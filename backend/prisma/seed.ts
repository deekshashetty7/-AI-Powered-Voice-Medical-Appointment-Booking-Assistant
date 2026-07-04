import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinic.deleteMany();

  const clinic = await prisma.clinic.create({
    data: {
      name: 'Trikon Medical Center',
      address: '123 Health Avenue, Bangalore, Karnataka 560001',
      phone: '+91-80-1234-5678',
      openTime: '08:00',
      closeTime: '20:00',
      timezone: 'Asia/Kolkata',
    },
  });

  const specialties = await Promise.all([
    prisma.specialty.create({
      data: {
        name: 'General Medicine',
        nameHi: 'सामान्य चिकित्सा',
        nameKn: 'ಸಾಮಾನ್ಯ ವೈದ್ಯ',
        description: 'Primary care and general health consultations',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Cardiology',
        nameHi: 'हृदय रोग विज्ञान',
        nameKn: 'ಹೃದಯರೋಗ',
        description: 'Heart and cardiovascular system specialists',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Orthopedics',
        nameHi: 'अस्थि रोग विज्ञान',
        nameKn: 'ಅಸ್ಥಿರೋಗ',
        description: 'Bone, joint, and musculoskeletal specialists',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Pediatrics',
        nameHi: 'बाल रोग विज्ञान',
        nameKn: 'ಮಕ್ಕಳ ವೈದ್ಯ',
        description: 'Healthcare for infants, children, and adolescents',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Dermatology',
        nameHi: 'त्वचा रोग विज्ञान',
        nameKn: 'ಚರ್ಮರೋಗ',
        description: 'Skin, hair, and nail specialists',
      },
    }),
  ]);

  const [general, cardio, ortho, peds, derma] = specialties;

  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        name: 'Dr. Priya Sharma',
        nameHi: 'डॉ. प्रिया शर्मा',
        nameKn: 'ಡಾ. ಪ್ರಿಯಾ ಶರ್ಮಾ',
        email: 'priya.sharma@trikonmed.com',
        phone: '+91-98765-43210',
        bio: '15 years experience in general medicine',
        clinicId: clinic.id,
        specialtyId: general.id,
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Rajesh Kumar',
        nameHi: 'डॉ. राजेश कुमार',
        nameKn: 'ಡಾ. ರಾಜೇಶ್ ಕುಮಾರ್',
        email: 'rajesh.kumar@trikonmed.com',
        phone: '+91-98765-43211',
        bio: 'Senior cardiologist with 20 years experience',
        clinicId: clinic.id,
        specialtyId: cardio.id,
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Ananya Reddy',
        nameHi: 'डॉ. अनन्या रेड्डी',
        nameKn: 'ಡಾ. ಅನನ್ಯಾ ರೆಡ್ಡಿ',
        email: 'ananya.reddy@trikonmed.com',
        phone: '+91-98765-43212',
        bio: 'Orthopedic surgeon specializing in sports injuries',
        clinicId: clinic.id,
        specialtyId: ortho.id,
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Suresh Gowda',
        nameHi: 'डॉ. सुरेश गौड़ा',
        nameKn: 'ಡಾ. ಸುರೇಶ್ ಗೌಡ',
        email: 'suresh.gowda@trikonmed.com',
        phone: '+91-98765-43213',
        bio: 'Pediatrician with expertise in child development',
        clinicId: clinic.id,
        specialtyId: peds.id,
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Meera Iyer',
        nameHi: 'डॉ. मीरा अय्यर',
        nameKn: 'ಡಾ. ಮೀರಾ ಅಯ್ಯರ್',
        email: 'meera.iyer@trikonmed.com',
        phone: '+91-98765-43214',
        bio: 'Dermatologist specializing in skin allergies',
        clinicId: clinic.id,
        specialtyId: derma.id,
      },
    }),
  ]);

  const weekdays = [1, 2, 3, 4, 5, 6];

  for (const doctor of doctors) {
    for (const day of weekdays) {
      await prisma.schedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotMins: 30,
        },
      });
    }
  }

  console.log('Seed completed:');
  console.log(`  Clinic: ${clinic.name}`);
  console.log(`  Specialties: ${specialties.length}`);
  console.log(`  Doctors: ${doctors.length}`);

  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      passwordHash: adminHash,
      name: 'Clinic Admin',
      role: 'ADMIN',
    },
  });

  const patientHash = await bcrypt.hash('Patient@12345', 12);
  await prisma.user.create({
    data: {
      email: 'patient@example.com',
      passwordHash: patientHash,
      name: 'Demo Patient',
      phone: '9876543210',
      role: 'PATIENT',
    },
  });

  console.log('  Users: admin@gmail.com / admin123, patient@example.com / Patient@12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
