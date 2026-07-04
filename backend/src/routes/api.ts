import { Router, Request, Response } from 'express';
import {
  getClinicInfo,
  listDoctors,
  listSpecialties,
  getDoctorAvailability,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  findAppointmentsByPhone,
  searchAvailability,
  findDoctorByName,
} from '../services/scheduling.js';

const router = Router();

function noClinic(res: Response) {
  return res.status(404).json({
    error: 'No clinic data configured. Please contact support.',
  });
}

router.get('/clinic', async (_req: Request, res: Response) => {
  const clinic = await getClinicInfo();
  if (!clinic) return noClinic(res);
  res.json(clinic);
});

router.get('/specialties', async (_req: Request, res: Response) => {
  const specialties = await listSpecialties();
  if (specialties.length === 0) return noClinic(res);
  res.json(specialties);
});

router.get('/doctors', async (req: Request, res: Response) => {
  const specialty = req.query.specialty as string | undefined;
  const doctors = await listDoctors(specialty);
  if (doctors.length === 0) return noClinic(res);
  res.json(doctors);
});

router.get('/doctors/search', async (req: Request, res: Response) => {
  const name = req.query.name as string;
  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required.' });
  }
  const doctors = await findDoctorByName(name);
  res.json(doctors.map((d) => ({
    id: d.id,
    name: d.name,
    nameHi: d.nameHi,
    specialty: d.specialty.name,
  })));
});

router.get('/availability/:doctorId', async (req: Request, res: Response) => {
  const doctorId = req.params.doctorId as string;
  const date = req.query.date as string;
  if (!date) {
    return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD).' });
  }
  const result = await getDoctorAvailability(doctorId, date);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

router.get('/availability', async (req: Request, res: Response) => {
  const { specialty, doctorName, date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'date query parameter is required.' });
  }
  const result = await searchAvailability({
    specialty: specialty as string | undefined,
    doctorName: doctorName as string | undefined,
    date: date as string,
  });
  res.json(result);
});

router.post('/appointments', async (req: Request, res: Response) => {
  const { doctorId, patientName, patientPhone, patientEmail, date, startTime, notes } = req.body;
  if (!doctorId || !patientName || !patientPhone || !date || !startTime) {
    return res.status(400).json({
      error: 'doctorId, patientName, patientPhone, date, and startTime are required.',
    });
  }
  const result = await bookAppointment({
    doctorId,
    patientName,
    patientPhone,
    patientEmail,
    date,
    startTime,
    notes,
  });
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.status(201).json(result);
});

router.get('/appointments', async (req: Request, res: Response) => {
  const phone = req.query.phone as string;
  if (!phone) {
    return res.status(400).json({ error: 'phone query parameter is required.' });
  }
  const appointments = await findAppointmentsByPhone(phone);
  res.json(appointments);
});

router.post('/appointments/:id/cancel', async (req: Request, res: Response) => {
  const { patientPhone } = req.body;
  if (!patientPhone) {
    return res.status(400).json({ error: 'patientPhone is required.' });
  }
  const result = await cancelAppointment(req.params.id as string, patientPhone);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

router.post('/appointments/:id/reschedule', async (req: Request, res: Response) => {
  const { patientPhone, newDate, newStartTime } = req.body;
  if (!patientPhone || !newDate || !newStartTime) {
    return res.status(400).json({
      error: 'patientPhone, newDate, and newStartTime are required.',
    });
  }
  const result = await rescheduleAppointment(
    req.params.id as string,
    patientPhone,
    newDate,
    newStartTime
  );
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

export default router;
