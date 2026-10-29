const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const ExpertProfile = require('../models/ExpertProfile');

const DEMO_EXPERTS = [
  {
    username: 'Dr. Kavinda Perera',
    email: 'kavinda.expert@smartgrow.lk',
    phoneNumber: '0772345601',
    location: 'Peradeniya University Agri-Innovation Hub',
    fullName: 'Dr. Kavinda Perera, PhD',
    professionalTitle: 'Senior Greenhouse Agronomist & Plant Pathologist',
    qualifications: 'PhD in Protected Agriculture (Wageningen), BSc Agriculture (Hons) — University of Peradeniya',
    fieldOfStudy: 'Plant Pathology & Protected Greenhouse Cultivation',
    yearsOfExperience: 12,
    experienceSummary:
      '12+ years advising commercial poly-tunnel and glasshouse growers in Nuwara Eliya, Bandarawela, and Kandy on fungal blight prevention, viral wilt control, and integrated crop nutrition.',
    biography:
      'Dr. Kavinda Perera specializes in diagnosing complex leaf chlorosis, early/late blight, powdery mildew, and root-zone fungal pathogens in greenhouse tomatoes, bell peppers, and cucumbers. He combines laboratory pathology with practical low-residue IPM protocols.',
    specializations: [
      'Plant Diseases',
      'Crop Nutrition',
      'Greenhouse Management',
      'Pest Management'
    ],
    languages: ['English', 'Sinhala'],
    profilePhoto:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    consultationTypes: ['video', 'text', 'in_person'],
    consultationFee: 25,
    isAvailable: true,
    availabilitySchedule: {
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'],
      appointmentDurationMinutes: 45,
      maxConsultationsPerDay: 5,
      unavailableDates: []
    }
  },
  {
    username: 'Eng. Tharushi Jayawardena',
    email: 'tharushi.expert@smartgrow.lk',
    phoneNumber: '0772345602',
    location: 'Colombo Agri-Tech & Hydroponics Center',
    fullName: 'Eng. Tharushi Jayawardena, MSc',
    professionalTitle: 'Hydroponic Systems & Nutrient Formulation Specialist',
    qualifications: 'MSc in Controlled Environment Agriculture, BSc Chemical & Process Engineering (Moratuwa)',
    fieldOfStudy: 'Closed-Loop Hydroponics & Fertigation Chemistry',
    yearsOfExperience: 8,
    experienceSummary:
      'Designed over 45 commercial NFT and Dutch-bucket recirculating hydroponic bays across Sri Lanka. Expert in A+B stock tank precipitation troubleshooting, EC/pH drift correction, and dissolved oxygen optimization.',
    biography:
      'Tharushi helps hydroponic and coco-peat substrate growers solve nutrient lockout, calcium tip-burn in leafy greens, blossom-end rot in fruiting crops, and peristaltic dosing calibration issues.',
    specializations: [
      'Hydroponics',
      'Nutrient Management',
      'Irrigation Systems',
      'Soil and Growing Media'
    ],
    languages: ['English', 'Sinhala'],
    profilePhoto:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    consultationTypes: ['video', 'text', 'phone'],
    consultationFee: 20,
    isAvailable: true,
    availabilitySchedule: {
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['10:00 AM', '01:00 PM', '03:30 PM', '05:00 PM'],
      appointmentDurationMinutes: 45,
      maxConsultationsPerDay: 6,
      unavailableDates: []
    }
  },
  {
    username: 'Roshan Bandara',
    email: 'roshan.expert@smartgrow.lk',
    phoneNumber: '0772345603',
    location: 'Nuwara Eliya Highland Automation Hub',
    fullName: 'Roshan Bandara, BSc Eng',
    professionalTitle: 'Greenhouse IoT Telemetry & Climate Automation Engineer',
    qualifications: 'BSc Engineering (Hons) in Electronic & Telecommunication Engineering, Certified LoRaWAN/MQTT Systems Architect',
    fieldOfStudy: 'Agricultural IoT Sensors & Micro-Climate Automation',
    yearsOfExperience: 7,
    experienceSummary:
      '7 years building automated VPD climate controllers, RS485 Modbus soil-probe networks, and solenoid drip fertigation schedules for highland greenhouses.',
    biography:
      'Roshan assists farmers experiencing erratic sensor readings, high daytime greenhouse heat stress, humidity spikes causing condensation mold, and automated exhaust/misting relay tuning.',
    specializations: [
      'Greenhouse Automation',
      'Sensor and IoT Systems',
      'Climate and Temperature Control',
      'Irrigation Systems'
    ],
    languages: ['English', 'Sinhala', 'Tamil'],
    profilePhoto:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    consultationTypes: ['video', 'text', 'phone', 'in_person'],
    consultationFee: 18,
    isAvailable: true,
    availabilitySchedule: {
      availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['09:30 AM', '11:30 AM', '02:30 PM', '04:30 PM'],
      appointmentDurationMinutes: 40,
      maxConsultationsPerDay: 5,
      unavailableDates: []
    }
  },
  {
    username: 'Nadeesha Senanayake',
    email: 'nadeesha.expert@smartgrow.lk',
    phoneNumber: '0772345604',
    location: 'Dambulla Sustainable Horticulture Station',
    fullName: 'Nadeesha Senanayake, MSc',
    professionalTitle: 'Integrated Pest Management (IPM) & Organic Horticulture Advisor',
    qualifications: 'MSc in Entomology & Crop Protection, BSc Agricultural Technology & Management',
    fieldOfStudy: 'Biological Pest Control & Sustainable Horticulture',
    yearsOfExperience: 9,
    experienceSummary:
      '9 years guiding export-oriented greenhouse growers on zero-residue biological control of whiteflies, thrips, spider mites, and Tuta absoluta, plus F1 hybrid crop selection and post-harvest quality.',
    biography:
      'Nadeesha specializes in biological pest control, botanical neem/spinosad rotations, sticky-trap monitoring, F1 cultivar selection for tropical/highland zones, and GAP certification readiness.',
    specializations: [
      'Pest Management',
      'Sustainable Agriculture',
      'Crop Selection',
      'Harvest Management'
    ],
    languages: ['English', 'Sinhala'],
    profilePhoto:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
    consultationTypes: ['video', 'text', 'phone'],
    consultationFee: 15,
    isAvailable: true,
    availabilitySchedule: {
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      timeSlots: ['08:30 AM', '11:00 AM', '03:00 PM'],
      appointmentDurationMinutes: 45,
      maxConsultationsPerDay: 4,
      unavailableDates: []
    }
  }
];

async function seedExperts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for ExpertConnect seeding...');

    const hashedPassword = await bcrypt.hash('expert123', 10);

    // 1. Ensure a dedicated platform administrator account exists for Stage 4/11 verification workflows
    let adminUser = await User.findOne({ email: 'admin@smartgrow.lk' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'SmartGrow Admin',
        email: 'admin@smartgrow.lk',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        phoneNumber: '0770000001',
        location: 'Colombo HQ'
      });
      console.log('Created platform administrator account: admin@smartgrow.lk');
    }

    // 2. Upsert the 4 verified demo agricultural experts
    for (const exp of DEMO_EXPERTS) {
      let user = await User.findOne({ email: exp.email });
      if (!user) {
        user = await User.create({
          username: exp.username,
          email: exp.email,
          password: hashedPassword,
          role: 'expert',
          phoneNumber: exp.phoneNumber,
          location: exp.location
        });
      }

      await ExpertProfile.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          fullName: exp.fullName,
          professionalTitle: exp.professionalTitle,
          qualifications: exp.qualifications,
          fieldOfStudy: exp.fieldOfStudy,
          yearsOfExperience: exp.yearsOfExperience,
          experienceSummary: exp.experienceSummary,
          biography: exp.biography,
          specializations: exp.specializations,
          languages: exp.languages,
          profilePhoto: exp.profilePhoto,
          location: exp.location,
          consultationTypes: exp.consultationTypes,
          consultationFee: exp.consultationFee,
          isAvailable: exp.isAvailable,
          availabilitySchedule: exp.availabilitySchedule,
          verificationStatus: 'approved',
          isVerified: true,
          verificationNotes: 'Verified by SmartGrow Academic & Agronomic Review Board',
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded verified expert profile: ${exp.fullName}`);
    }

    console.log('ExpertConnect seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('ExpertConnect seed error:', err);
    process.exit(1);
  }
}

seedExperts();
