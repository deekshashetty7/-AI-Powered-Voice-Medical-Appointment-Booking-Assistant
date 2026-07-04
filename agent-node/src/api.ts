import { BACKEND_URL } from './config.js';

async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${path}`);
  if (res.status === 404) {
    return { error: 'No clinic data configured. Please contact support.' };
  }
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function apiPost(path: string, data: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export const schedulingTools = {
  getClinicInfo: () => apiGet('/api/clinic'),
  listSpecialties: () => apiGet('/api/specialties'),
  listDoctors: (specialty?: string) =>
    apiGet(specialty ? `/api/doctors?specialty=${encodeURIComponent(specialty)}` : '/api/doctors'),
  checkDoctorAvailability: (doctorId: string, date: string) =>
    apiGet(`/api/availability/${doctorId}?date=${date}`),
  searchAvailability: (date: string, specialty?: string, doctorName?: string) => {
    const params = new URLSearchParams({ date });
    if (specialty) params.set('specialty', specialty);
    if (doctorName) params.set('doctorName', doctorName);
    return apiGet(`/api/availability?${params}`);
  },
  bookAppointment: (data: Record<string, unknown>) => apiPost('/api/appointments', data),
  getMyAppointments: (phone: string) => apiGet(`/api/appointments?phone=${encodeURIComponent(phone)}`),
  cancelAppointment: (id: string, patientPhone: string) =>
    apiPost(`/api/appointments/${id}/cancel`, { patientPhone }),
  rescheduleAppointment: (id: string, patientPhone: string, newDate: string, newStartTime: string) =>
    apiPost(`/api/appointments/${id}/reschedule`, { patientPhone, newDate, newStartTime }),
};
