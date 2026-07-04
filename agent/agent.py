"""MediVoice - AI Medical Appointment Booking Voice Agent"""

import json
import logging
import os
from typing import Annotated

import httpx
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    function_tool,
    inference,
)
from livekit.plugins import deepgram, elevenlabs, openai, sarvam

load_dotenv()

logger = logging.getLogger("medivoice-agent")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001")

LANGUAGE_MAP = {
    "en": {"name": "English", "sarvam": "en-IN", "deepgram": "en", "elevenlabs": "en"},
    "hi": {"name": "Hindi", "sarvam": "hi-IN", "deepgram": "hi", "elevenlabs": "hi"},
    "kn": {"name": "Kannada", "sarvam": "kn-IN", "deepgram": "kn", "elevenlabs": "kn"},
}

GREETINGS = {
    "en": "Hello! Welcome to Trikon Medical Center. I'm your virtual receptionist. How may I help you today? You can book an appointment, check availability, reschedule, cancel, or ask about our doctors and clinic hours.",
    "hi": "नमस्ते! ट्राइकोन मेडिकल सेंटर में आपका स्वागत है। मैं आपकी वर्चुअल रिसेप्शनिस्ट हूं। मैं आपकी कैसे मदद कर सकती हूं? आप अपॉइंटमेंट बुक कर सकते हैं, उपलब्धता जांच सकते हैं, रीशेड्यूल या कैंसल कर सकते हैं, या हमारे डॉक्टरों और क्लिनिक के समय के बारे में पूछ सकते हैं।",
    "kn": "ನಮಸ್ಕಾರ! ಟ್ರೈಕಾನ್ ಮೆಡಿಕಲ್ ಸೆಂಟರ್‌ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮ್ಮ ವರ್ಚುವಲ್ ರಿಸೆಪ್ಷನಿಸ್ಟ್. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ನೀವು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಬಹುದು, ಲಭ್ಯತೆ ಪರಿಶೀಲಿಸಬಹುದು, ಮರುನಿಗದಿ ಅಥವಾ ರದ್ದು ಮಾಡಬಹುದು, ಅಥವಾ ನಮ್ಮ ವೈದ್ಯರು ಮತ್ತು ಕ್ಲಿನಿಕ್ ಸಮಯದ ಬಗ್ಗೆ ಕೇಳಬಹುದು.",
}


async def api_get(path: str) -> dict | list:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{BACKEND_URL}{path}")
        if resp.status_code == 404:
            return {"error": "No clinic data configured. Please contact support."}
        resp.raise_for_status()
        return resp.json()


async def api_post(path: str, data: dict) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(f"{BACKEND_URL}{path}", json=data)
        return resp.json()


def get_language_instructions(lang: str) -> str:
    lang_name = LANGUAGE_MAP.get(lang, LANGUAGE_MAP["en"])["name"]
    return f"""
You are a friendly, professional medical receptionist at Trikon Medical Center.
You MUST conduct the entire conversation in {lang_name}.
Maintain the same language throughout unless the patient switches languages.

STRICT RULES:
- NEVER hallucinate doctor availability. Always use the provided tools to check real data.
- NEVER confirm an appointment without calling book_appointment tool and receiving success.
- If you don't have information, say: "I don't have that information."
- If clinic data is unavailable, say: "No clinic data configured. Please contact support."
- Always confirm appointment details (doctor, date, time, patient name, phone) before booking.
- Ask follow-up questions when information is missing.
- Be concise and conversational, like a real phone receptionist.
- For dates, use YYYY-MM-DD format when calling tools.
- Times are in 24-hour format HH:MM (e.g., 09:00, 14:30).

Available actions: book appointments, check availability, reschedule, cancel, list doctors/specialties, clinic info.
"""


class MedicalReceptionist(Agent):
    def __init__(self, language: str = "en") -> None:
        self.language = language
        super().__init__(instructions=get_language_instructions(language))

    @function_tool()
    async def get_clinic_info(self) -> str:
        """Get clinic information including name, address, phone, and operating hours."""
        data = await api_get("/api/clinic")
        if isinstance(data, dict) and "error" in data:
            return data["error"]
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def list_specialties(self) -> str:
        """List all medical specialties available at the clinic."""
        data = await api_get("/api/specialties")
        if isinstance(data, dict) and "error" in data:
            return data["error"]
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def list_doctors(
        self,
        specialty: Annotated[str, "Optional specialty filter, e.g. Cardiology"] = "",
    ) -> str:
        """List all doctors, optionally filtered by specialty."""
        path = "/api/doctors"
        if specialty:
            path += f"?specialty={specialty}"
        data = await api_get(path)
        if isinstance(data, dict) and "error" in data:
            return data["error"]
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def check_doctor_availability(
        self,
        doctor_id: Annotated[str, "Doctor ID from list_doctors"],
        date: Annotated[str, "Date in YYYY-MM-DD format"],
    ) -> str:
        """Check available time slots for a specific doctor on a given date."""
        data = await api_get(f"/api/availability/{doctor_id}?date={date}")
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def search_availability(
        self,
        date: Annotated[str, "Date in YYYY-MM-DD format"],
        specialty: Annotated[str, "Optional specialty name"] = "",
        doctor_name: Annotated[str, "Optional doctor name"] = "",
    ) -> str:
        """Search availability across doctors by date, optionally filtered by specialty or doctor name."""
        params = f"date={date}"
        if specialty:
            params += f"&specialty={specialty}"
        if doctor_name:
            params += f"&doctorName={doctor_name}"
        data = await api_get(f"/api/availability?{params}")
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def book_appointment(
        self,
        doctor_id: Annotated[str, "Doctor ID"],
        patient_name: Annotated[str, "Patient full name"],
        patient_phone: Annotated[str, "Patient phone number with country code"],
        date: Annotated[str, "Appointment date YYYY-MM-DD"],
        start_time: Annotated[str, "Start time HH:MM in 24h format"],
        patient_email: Annotated[str, "Optional patient email"] = "",
        notes: Annotated[str, "Optional notes"] = "",
    ) -> str:
        """Book a new appointment. Only call after confirming all details with the patient."""
        data = await api_post("/api/appointments", {
            "doctorId": doctor_id,
            "patientName": patient_name,
            "patientPhone": patient_phone,
            "patientEmail": patient_email or None,
            "date": date,
            "startTime": start_time,
            "notes": notes or None,
        })
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def get_my_appointments(
        self,
        patient_phone: Annotated[str, "Patient phone number used when booking"],
    ) -> str:
        """Get upcoming appointments for a patient by phone number."""
        data = await api_get(f"/api/appointments?phone={patient_phone}")
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def cancel_appointment(
        self,
        appointment_id: Annotated[str, "Appointment ID"],
        patient_phone: Annotated[str, "Patient phone for verification"],
    ) -> str:
        """Cancel an existing appointment."""
        data = await api_post(f"/api/appointments/{appointment_id}/cancel", {
            "patientPhone": patient_phone,
        })
        return json.dumps(data, ensure_ascii=False)

    @function_tool()
    async def reschedule_appointment(
        self,
        appointment_id: Annotated[str, "Appointment ID"],
        patient_phone: Annotated[str, "Patient phone for verification"],
        new_date: Annotated[str, "New date YYYY-MM-DD"],
        new_start_time: Annotated[str, "New start time HH:MM"],
    ) -> str:
        """Reschedule an existing appointment to a new date and time."""
        data = await api_post(f"/api/appointments/{appointment_id}/reschedule", {
            "patientPhone": patient_phone,
            "newDate": new_date,
            "newStartTime": new_start_time,
        })
        return json.dumps(data, ensure_ascii=False)


def create_stt(provider: str, language: str):
    lang_config = LANGUAGE_MAP.get(language, LANGUAGE_MAP["en"])

    if provider == "sarvam":
        return sarvam.STT(
            model="saaras:v3",
            language=lang_config["sarvam"],
            mode="transcribe",
            flush_signal=True,
        )
    elif provider == "elevenlabs":
        return elevenlabs.STT(
            language_code=lang_config["elevenlabs"],
        )
    else:
        return deepgram.STT(
            model="nova-3",
            language=lang_config["deepgram"],
            punctuate=True,
            smart_format=True,
            interim_results=True,
        )


def create_tts(provider: str, language: str):
    lang_config = LANGUAGE_MAP.get(language, LANGUAGE_MAP["en"])

    if provider == "sarvam":
        return sarvam.TTS(
            target_language_code=lang_config["sarvam"],
            model="bulbul:v3",
            speaker="priya",
        )
    elif provider == "elevenlabs":
        return elevenlabs.TTS(
            voice_id="pNInz6obpgDQGcFmaJgB",
            model="eleven_turbo_v2_5",
        )
    else:
        voice_map = {
            "en": "aura-2-thalia-en",
            "hi": "aura-2-asteria-en",
            "kn": "aura-2-thalia-en",
        }
        return deepgram.TTS(model=voice_map.get(language, "aura-2-thalia-en"))



async def entrypoint(ctx: JobContext):
    await ctx.connect()

    metadata = {}
    if ctx.room.metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
        except json.JSONDecodeError:
            pass

    language = metadata.get("language", "en")
    stt_provider = metadata.get("sttProvider", "deepgram")

    logger.info(f"Starting agent - language: {language}, STT: {stt_provider}")

    session = AgentSession(
        vad=inference.VAD(),
        stt=create_stt(stt_provider, language),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=create_tts(stt_provider, language),
        turn_detection="stt",
        allow_interruptions=True,
        min_endpointing_delay=0.5,
        max_endpointing_delay=3.0,
    )

    agent = MedicalReceptionist(language=language)

    await session.start(agent=agent, room=ctx.room)

    greeting = GREETINGS.get(language, GREETINGS["en"])
    await session.generate_reply(
        instructions=f"Greet the patient warmly in the selected language. Say exactly: {greeting}",
        allow_interruptions=True,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="medivoice-agent",
        )
    )
