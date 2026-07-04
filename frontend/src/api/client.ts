const API = import.meta.env.VITE_API_URL || '';

export interface Doctor {
  id: string;
  name: string;
  nameHi?: string;
  nameKn?: string;
  specialty: string;
  specialtyHi?: string;
  specialtyKn?: string;
  clinic: string;
  bio?: string;
}

export interface Specialty {
  id: string;
  name: string;
  nameHi?: string;
  nameKn?: string;
  description?: string;
}

export interface Clinic {
  name: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  patientName: string;
}

export async function fetchDoctors(specialty?: string): Promise<Doctor[]> {
  const url = specialty ? `${API}/api/doctors?specialty=${encodeURIComponent(specialty)}` : `${API}/api/doctors`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSpecialties(): Promise<Specialty[]> {
  const res = await fetch(`${API}/api/specialties`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchClinic(): Promise<Clinic | null> {
  const res = await fetch(`${API}/api/clinic`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAppointments(phone: string): Promise<Appointment[]> {
  const res = await fetch(`${API}/api/appointments?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) return [];
  return res.json();
}
