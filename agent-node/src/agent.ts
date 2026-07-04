import { llm, voice } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import { z } from 'zod';
import { schedulingTools } from './api.js';
import { getLanguageInstructions } from './config.js';

function jsonResult(data: unknown): string {
  return JSON.stringify(data);
}

export class MedicalReceptionist extends voice.Agent {
  constructor(language: string) {
    super({
      instructions: getLanguageInstructions(language),
      llm: openai.LLM.withGroq({ model: 'llama-3.3-70b-versatile' }),
      tools: {
        get_clinic_info: llm.tool({
          description: 'Get clinic information including name, address, phone, and operating hours.',
          parameters: z.object({}),
          execute: async () => jsonResult(await schedulingTools.getClinicInfo()),
        }),
        list_specialties: llm.tool({
          description: 'List all medical specialties available at the clinic.',
          parameters: z.object({}),
          execute: async () => jsonResult(await schedulingTools.listSpecialties()),
        }),
        list_doctors: llm.tool({
          description: 'List all doctors, optionally filtered by specialty.',
          parameters: z.object({
            specialty: z.string().optional().describe('Optional specialty filter, e.g. Cardiology'),
          }),
          execute: async ({ specialty }) => jsonResult(await schedulingTools.listDoctors(specialty)),
        }),
        check_doctor_availability: llm.tool({
          description: 'Check available time slots for a specific doctor on a given date.',
          parameters: z.object({
            doctor_id: z.string().describe('Doctor ID from list_doctors'),
            date: z.string().describe('Date in YYYY-MM-DD format'),
          }),
          execute: async ({ doctor_id, date }) =>
            jsonResult(await schedulingTools.checkDoctorAvailability(doctor_id, date)),
        }),
        search_availability: llm.tool({
          description: 'Search availability across doctors by date, optionally filtered.',
          parameters: z.object({
            date: z.string().describe('Date in YYYY-MM-DD format'),
            specialty: z.string().optional(),
            doctor_name: z.string().optional(),
          }),
          execute: async ({ date, specialty, doctor_name }) =>
            jsonResult(await schedulingTools.searchAvailability(date, specialty, doctor_name)),
        }),
        book_appointment: llm.tool({
          description: 'Book a new appointment. Only call after confirming all details with the patient.',
          parameters: z.object({
            doctor_id: z.string(),
            patient_name: z.string(),
            patient_phone: z.string(),
            date: z.string().describe('YYYY-MM-DD'),
            start_time: z.string().describe('HH:MM 24h format'),
            patient_email: z.string().optional(),
            notes: z.string().optional(),
          }),
          execute: async ({ doctor_id, patient_name, patient_phone, date, start_time, patient_email, notes }) =>
            jsonResult(
              await schedulingTools.bookAppointment({
                doctorId: doctor_id,
                patientName: patient_name,
                patientPhone: patient_phone,
                patientEmail: patient_email,
                date,
                startTime: start_time,
                notes,
              })
            ),
        }),
        get_my_appointments: llm.tool({
          description: 'Get upcoming appointments for a patient by phone number.',
          parameters: z.object({
            patient_phone: z.string(),
          }),
          execute: async ({ patient_phone }) =>
            jsonResult(await schedulingTools.getMyAppointments(patient_phone)),
        }),
        cancel_appointment: llm.tool({
          description: 'Cancel an existing appointment.',
          parameters: z.object({
            appointment_id: z.string(),
            patient_phone: z.string(),
          }),
          execute: async ({ appointment_id, patient_phone }) =>
            jsonResult(await schedulingTools.cancelAppointment(appointment_id, patient_phone)),
        }),
        reschedule_appointment: llm.tool({
          description: 'Reschedule an existing appointment to a new date and time.',
          parameters: z.object({
            appointment_id: z.string(),
            patient_phone: z.string(),
            new_date: z.string().describe('YYYY-MM-DD'),
            new_start_time: z.string().describe('HH:MM'),
          }),
          execute: async ({ appointment_id, patient_phone, new_date, new_start_time }) =>
            jsonResult(
              await schedulingTools.rescheduleAppointment(
                appointment_id,
                patient_phone,
                new_date,
                new_start_time
              )
            ),
        }),
      },
    });
  }
}
