import { prisma } from '../lib/prisma.js';
import {
  generateSlots,
  getDayOfWeek,
  isPastDate,
  addMinutes,
} from '../lib/time.js';

export async function getClinicInfo() {
  const clinic = await prisma.clinic.findFirst({
    include: {
      doctors: {
        include: { specialty: true },
      },
    },
  });

  if (!clinic) {
    return null;
  }

  return {
    id: clinic.id,
    name: clinic.name,
    address: clinic.address,
    phone: clinic.phone,
    openTime: clinic.openTime,
    closeTime: clinic.closeTime,
    timezone: clinic.timezone,
    doctorCount: clinic.doctors.length,
  };
}

export async function listDoctors(specialty?: string) {
  const doctors = await prisma.doctor.findMany({
    where: specialty
      ? {
          specialty: {
            name: { equals: specialty, mode: 'insensitive' },
          },
        }
      : undefined,
    include: { specialty: true, clinic: true },
    orderBy: { name: 'asc' },
  });

  return doctors.map((d) => ({
    id: d.id,
    name: d.name,
    nameHi: d.nameHi,
    nameKn: d.nameKn,
    specialty: d.specialty.name,
    specialtyHi: d.specialty.nameHi,
    specialtyKn: d.specialty.nameKn,
    clinic: d.clinic.name,
    bio: d.bio,
  }));
}

export async function listSpecialties() {
  const specialties = await prisma.specialty.findMany({ orderBy: { name: 'asc' } });
  return specialties.map((s) => ({
    id: s.id,
    name: s.name,
    nameHi: s.nameHi,
    nameKn: s.nameKn,
    description: s.description,
  }));
}

export async function getDoctorAvailability(doctorId: string, dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return { error: 'Invalid date format. Use YYYY-MM-DD.' };
  }
  if (isPastDate(date)) {
    return { error: 'Cannot check availability for past dates.' };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { schedules: true, specialty: true },
  });

  if (!doctor) {
    return { error: 'Doctor not found.' };
  }

  const dayOfWeek = getDayOfWeek(date);
  const schedule = doctor.schedules.find((s) => s.dayOfWeek === dayOfWeek);

  if (!schedule) {
    return {
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: dateStr,
      available: false,
      message: 'Doctor is not available on this day.',
      slots: [],
    };
  }

  const allSlots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotMins);

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: date,
      status: { in: ['confirmed', 'rescheduled'] },
    },
    select: { startTime: true },
  });

  const bookedTimes = new Set(booked.map((b) => b.startTime));
  const availableSlots = allSlots.filter((s) => !bookedTimes.has(s));

  return {
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty.name,
    date: dateStr,
    available: availableSlots.length > 0,
    slots: availableSlots,
    slotDuration: schedule.slotMins,
  };
}

export async function findDoctorByName(name: string) {
  const doctors = await prisma.doctor.findMany({
    where: {
      OR: [
        { name: { contains: name, mode: 'insensitive' } },
        { nameHi: { contains: name, mode: 'insensitive' } },
        { nameKn: { contains: name, mode: 'insensitive' } },
      ],
    },
    include: { specialty: true },
  });
  return doctors;
}

export async function bookAppointment(data: {
  doctorId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  startTime: string;
  notes?: string;
}) {
  const date = new Date(data.date + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return { success: false, error: 'Invalid date format.' };
  }
  if (isPastDate(date)) {
    return { success: false, error: 'Cannot book appointments in the past.' };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: data.doctorId },
    include: { schedules: true, specialty: true },
  });

  if (!doctor) {
    return { success: false, error: 'Doctor not found.' };
  }

  const dayOfWeek = getDayOfWeek(date);
  const schedule = doctor.schedules.find((s) => s.dayOfWeek === dayOfWeek);
  if (!schedule) {
    return { success: false, error: 'Doctor is not available on this day.' };
  }

  const slots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotMins);
  if (!slots.includes(data.startTime)) {
    return { success: false, error: 'Requested time slot is not within doctor schedule.' };
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentDate: date,
      startTime: data.startTime,
      status: { in: ['confirmed', 'rescheduled'] },
    },
  });

  if (existing) {
    return { success: false, error: 'This time slot is already booked.' };
  }

  const endTime = addMinutes(data.startTime, schedule.slotMins);

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: data.doctorId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      appointmentDate: date,
      startTime: data.startTime,
      endTime,
      notes: data.notes,
      status: 'confirmed',
    },
    include: { doctor: { include: { specialty: true } } },
  });

  return {
    success: true,
    appointment: {
      id: appointment.id,
      doctorName: appointment.doctor.name,
      specialty: appointment.doctor.specialty.name,
      patientName: appointment.patientName,
      date: data.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
    },
  };
}

export async function cancelAppointment(appointmentId: string, patientPhone: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: { include: { specialty: true } } },
  });

  if (!appointment) {
    return { success: false, error: 'Appointment not found.' };
  }

  if (appointment.patientPhone !== patientPhone) {
    return { success: false, error: 'Phone number does not match appointment records.' };
  }

  if (appointment.status === 'cancelled') {
    return { success: false, error: 'Appointment is already cancelled.' };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'cancelled' },
  });

  return {
    success: true,
    message: 'Appointment cancelled successfully.',
    appointment: {
      id: appointment.id,
      doctorName: appointment.doctor.name,
      date: appointment.appointmentDate.toISOString().split('T')[0],
      startTime: appointment.startTime,
    },
  };
}

export async function rescheduleAppointment(
  appointmentId: string,
  patientPhone: string,
  newDate: string,
  newStartTime: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: { include: { schedules: true, specialty: true } } },
  });

  if (!appointment) {
    return { success: false, error: 'Appointment not found.' };
  }

  if (appointment.patientPhone !== patientPhone) {
    return { success: false, error: 'Phone number does not match appointment records.' };
  }

  if (appointment.status === 'cancelled') {
    return { success: false, error: 'Cannot reschedule a cancelled appointment.' };
  }

  const date = new Date(newDate + 'T00:00:00');
  if (isPastDate(date)) {
    return { success: false, error: 'Cannot reschedule to a past date.' };
  }

  const dayOfWeek = getDayOfWeek(date);
  const schedule = appointment.doctor.schedules.find((s) => s.dayOfWeek === dayOfWeek);
  if (!schedule) {
    return { success: false, error: 'Doctor is not available on the new date.' };
  }

  const slots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotMins);
  if (!slots.includes(newStartTime)) {
    return { success: false, error: 'Requested time slot is not available.' };
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: appointment.doctorId,
      appointmentDate: date,
      startTime: newStartTime,
      status: { in: ['confirmed', 'rescheduled'] },
      NOT: { id: appointmentId },
    },
  });

  if (conflict) {
    return { success: false, error: 'The new time slot is already booked.' };
  }

  const endTime = addMinutes(newStartTime, schedule.slotMins);

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      appointmentDate: date,
      startTime: newStartTime,
      endTime,
      status: 'rescheduled',
    },
    include: { doctor: { include: { specialty: true } } },
  });

  return {
    success: true,
    appointment: {
      id: updated.id,
      doctorName: updated.doctor.name,
      specialty: updated.doctor.specialty.name,
      date: newDate,
      startTime: updated.startTime,
      endTime: updated.endTime,
      status: updated.status,
    },
  };
}

export async function findAppointmentsByPhone(patientPhone: string) {
  const appointments = await prisma.appointment.findMany({
    where: {
      patientPhone,
      status: { in: ['confirmed', 'rescheduled'] },
      appointmentDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    include: { doctor: { include: { specialty: true } } },
    orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
  });

  return appointments.map((a) => ({
    id: a.id,
    doctorName: a.doctor.name,
    specialty: a.doctor.specialty.name,
    date: a.appointmentDate.toISOString().split('T')[0],
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    patientName: a.patientName,
  }));
}

export async function searchAvailability(params: {
  specialty?: string;
  doctorName?: string;
  date: string;
}) {
  let doctors = await prisma.doctor.findMany({
    where: {
      AND: [
        params.specialty
          ? { specialty: { name: { equals: params.specialty, mode: 'insensitive' } } }
          : {},
        params.doctorName
          ? {
              OR: [
                { name: { contains: params.doctorName, mode: 'insensitive' } },
                { nameHi: { contains: params.doctorName, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    include: { specialty: true },
  });

  if (doctors.length === 0) {
    return { error: 'No doctors found matching your criteria.', results: [] };
  }

  const results = [];
  for (const doctor of doctors) {
    const availability = await getDoctorAvailability(doctor.id, params.date);
    if (!('error' in availability) && availability.available) {
      results.push(availability);
    }
  }

  return { results };
}
