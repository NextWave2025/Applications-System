export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected"
  | "incomplete";

export interface AdminApplication {
  id: number;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  programName: string;
  universityName: string;
  universityLogo?: string;
  degreeLevel: string;
  intake: string;
  submissionDate: string;
  status: ApplicationStatus;
  lastUpdated: string;
  agentName?: string;
  agentCompany?: string;
  notes?: string;
  documents: {
    passport: boolean;
    transcript: boolean;
    englishCertificate: boolean;
    recommendationLetters: boolean;
    statementOfPurpose: boolean;
  };
}

export const ADMIN_APPLICATIONS_DATA: AdminApplication[] = [
  {
    id: 1,
    studentName: "John Doe",
    studentEmail: "john.doe@example.com",
    studentAvatar: "https://github.com/yusufhilmi.png",
    programName: "Bachelor of Business Administration",
    universityName: "University of Dubai",
    universityLogo: "https://picsum.photos/seed/univ1/200/80",
    degreeLevel: "Bachelor",
    intake: "September 2023",
    submissionDate: "June 15, 2023",
    status: "approved",
    lastUpdated: "July 10, 2023",
    agentName: "Sarah Ahmed",
    agentCompany: "Global Education Agency",
    notes: "Student has excellent academic record",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: true,
      statementOfPurpose: true,
    },
  },
  {
    id: 2,
    studentName: "Jane Smith",
    studentEmail: "jane.smith@example.com",
    studentAvatar: "https://github.com/kdrnp.png",
    programName: "Master of Science in Artificial Intelligence",
    universityName: "Khalifa University",
    universityLogo: "https://picsum.photos/seed/univ5/200/80",
    degreeLevel: "Master",
    intake: "January 2024",
    submissionDate: "July 5, 2023",
    status: "under-review",
    lastUpdated: "July 8, 2023",
    notes: "Waiting for university feedback",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: true,
      statementOfPurpose: true,
    },
  },
  {
    id: 3,
    studentName: "Ahmed Hassan",
    studentEmail: "ahmed.hassan@example.com",
    studentAvatar: "https://github.com/yahyabedirhan.png",
    programName: "Bachelor of Architecture",
    universityName: "American University of Sharjah",
    universityLogo: "https://picsum.photos/seed/univ2/200/80",
    degreeLevel: "Bachelor",
    intake: "September 2023",
    submissionDate: "June 1, 2023",
    status: "rejected",
    lastUpdated: "June 20, 2023",
    agentName: "Michael Brown",
    agentCompany: "Study Abroad Consultants",
    notes: "Portfolio did not meet requirements",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: false,
      statementOfPurpose: true,
    },
  },
  {
    id: 4,
    studentName: "Maria Garcia",
    studentEmail: "maria.garcia@example.com",
    studentAvatar: "https://github.com/buyuktas18.png",
    programName: "PhD in Computer Science",
    universityName: "UAE University",
    universityLogo: "https://picsum.photos/seed/univ4/200/80",
    degreeLevel: "PhD",
    intake: "January 2024",
    submissionDate: "July 8, 2023",
    status: "submitted",
    lastUpdated: "July 8, 2023",
    agentName: "David Wilson",
    agentCompany: "Academic Pathways",
    notes: "Strong research proposal",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: true,
      statementOfPurpose: true,
    },
  },
  {
    id: 5,
    studentName: "Ali Mohammed",
    studentEmail: "ali.mohammed@example.com",
    studentAvatar: "https://github.com/furkanksl.png",
    programName: "Bachelor of Science in Nursing",
    universityName: "Zayed University",
    universityLogo: "https://picsum.photos/seed/univ3/200/80",
    degreeLevel: "Bachelor",
    intake: "January 2024",
    submissionDate: "July 2, 2023",
    status: "under-review",
    lastUpdated: "July 5, 2023",
    notes: "Interview scheduled for July 15",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: true,
      statementOfPurpose: true,
    },
  },
  {
    id: 6,
    studentName: "Sophia Chen",
    studentEmail: "sophia.chen@example.com",
    programName: "Master of Education",
    universityName: "Abu Dhabi University",
    universityLogo: "https://picsum.photos/seed/univ6/200/80",
    degreeLevel: "Master",
    intake: "September 2023",
    submissionDate: "May 20, 2023",
    status: "approved",
    lastUpdated: "June 25, 2023",
    agentName: "Sarah Ahmed",
    agentCompany: "Global Education Agency",
    notes: "Scholarship awarded",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: true,
      statementOfPurpose: true,
    },
  },
  {
    id: 7,
    studentName: "Mohammed Al-Farsi",
    studentEmail: "mohammed.alfarsi@example.com",
    programName: "Bachelor of Science in Finance",
    universityName: "American University of Sharjah",
    universityLogo: "https://picsum.photos/seed/univ2/200/80",
    degreeLevel: "Bachelor",
    intake: "January 2024",
    submissionDate: "July 7, 2023",
    status: "submitted",
    lastUpdated: "July 7, 2023",
    agentName: "Michael Brown",
    agentCompany: "Study Abroad Consultants",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: false,
      statementOfPurpose: true,
    },
  },
  {
    id: 8,
    studentName: "Fatima Al-Zahra",
    studentEmail: "fatima.alzahra@example.com",
    studentAvatar: "https://github.com/kdrnp.png",
    programName: "Master of Arts in Diplomacy",
    universityName: "Zayed University",
    universityLogo: "https://picsum.photos/seed/univ3/200/80",
    degreeLevel: "Master",
    intake: "September 2023",
    submissionDate: "June 12, 2023",
    status: "incomplete",
    lastUpdated: "June 30, 2023",
    notes: "Missing recommendation letters",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: false,
      statementOfPurpose: true,
    },
  },
  {
    id: 9,
    studentName: "Raj Patel",
    studentEmail: "raj.patel@example.com",
    studentAvatar: "https://github.com/yahyabedirhan.png",
    programName: "Bachelor of Science in Cybersecurity",
    universityName: "Abu Dhabi University",
    universityLogo: "https://picsum.photos/seed/univ6/200/80",
    degreeLevel: "Bachelor",
    intake: "January 2024",
    submissionDate: "July 3, 2023",
    status: "under-review",
    lastUpdated: "July 9, 2023",
    agentName: "David Wilson",
    agentCompany: "Academic Pathways",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: true,
      statementOfPurpose: true,
    },
  },
  {
    id: 10,
    studentName: "Aisha Abdullah",
    studentEmail: "aisha.abdullah@example.com",
    studentAvatar: "https://github.com/buyuktas18.png",
    programName: "Bachelor of Environmental Sciences",
    universityName: "UAE University",
    universityLogo: "https://picsum.photos/seed/univ4/200/80",
    degreeLevel: "Bachelor",
    intake: "September 2023",
    submissionDate: "June 28, 2023",
    status: "approved",
    lastUpdated: "July 12, 2023",
    notes: "Conditional acceptance - must maintain GPA",
    documents: {
      passport: true,
      transcript: true,
      englishCertificate: true,
      recommendationLetters: true,
      statementOfPurpose: true,
    },
  },
];
