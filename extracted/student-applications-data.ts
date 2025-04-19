export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected"
  | "incomplete";

export interface Application {
  id: number;
  programName: string;
  universityName: string;
  universityLogo?: string;
  degreeLevel: string;
  intake: string;
  submissionDate?: string;
  status: ApplicationStatus;
  lastUpdated: string;
  deadlineDate?: string;
  notes?: string;
}

export const STUDENT_APPLICATIONS_DATA: Application[] = [
  {
    id: 1,
    programName: "Bachelor of Business Administration",
    universityName: "University of Dubai",
    universityLogo: "https://picsum.photos/seed/univ1/200/80",
    degreeLevel: "Bachelor",
    intake: "September 2023",
    submissionDate: "June 15, 2023",
    status: "approved",
    lastUpdated: "July 10, 2023",
    deadlineDate: "July 30, 2023",
    notes: "Scholarship application submitted separately",
  },
  {
    id: 2,
    programName: "Master of Science in Artificial Intelligence",
    universityName: "Khalifa University",
    universityLogo: "https://picsum.photos/seed/univ5/200/80",
    degreeLevel: "Master",
    intake: "January 2024",
    status: "draft",
    lastUpdated: "July 5, 2023",
    deadlineDate: "October 15, 2023",
    notes: "Need to upload research proposal",
  },
  {
    id: 3,
    programName: "Bachelor of Architecture",
    universityName: "American University of Sharjah",
    universityLogo: "https://picsum.photos/seed/univ2/200/80",
    degreeLevel: "Bachelor",
    intake: "September 2023",
    submissionDate: "June 1, 2023",
    status: "under-review",
    lastUpdated: "June 20, 2023",
    deadlineDate: "July 15, 2023",
  },
  {
    id: 4,
    programName: "PhD in Computer Science",
    universityName: "UAE University",
    universityLogo: "https://picsum.photos/seed/univ4/200/80",
    degreeLevel: "PhD",
    intake: "January 2024",
    status: "incomplete",
    lastUpdated: "July 8, 2023",
    deadlineDate: "September 30, 2023",
    notes: "Missing recommendation letters",
  },
  {
    id: 5,
    programName: "Bachelor of Science in Nursing",
    universityName: "Zayed University",
    universityLogo: "https://picsum.photos/seed/univ3/200/80",
    degreeLevel: "Bachelor",
    intake: "January 2024",
    submissionDate: "July 2, 2023",
    status: "submitted",
    lastUpdated: "July 2, 2023",
    deadlineDate: "August 15, 2023",
  },
  {
    id: 6,
    programName: "Master of Education",
    universityName: "Abu Dhabi University",
    universityLogo: "https://picsum.photos/seed/univ6/200/80",
    degreeLevel: "Master",
    intake: "September 2023",
    submissionDate: "May 20, 2023",
    status: "rejected",
    lastUpdated: "June 25, 2023",
    deadlineDate: "June 30, 2023",
    notes: "Can reapply for next intake",
  },
];
