import { Router } from 'express';
import { requireAuth, requireRole } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/stats', async (_req, res) => {
  const [doctors, specialties, appointments, patients] = await Promise.all([
    prisma.doctor.count(),
    prisma.specialty.count(),
    prisma.appointment.count({ where: { status: 'confirmed' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
  ]);

  res.json({ doctors, specialties, appointments, patients });
});

router.get('/appointments', async (_req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: { include: { specialty: true } },
    },
    orderBy: { appointmentDate: 'desc' },
    take: 50,
  });

  res.json(appointments.map((a) => ({
    id: a.id,
    doctorName: a.doctor.name,
    specialty: a.doctor.specialty.name,
    patientName: a.patientName,
    patientPhone: a.patientPhone,
    date: a.appointmentDate.toISOString().split('T')[0],
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
  })));
});

export default router;
