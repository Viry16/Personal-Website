export interface Experience {
  /** Database id. Absent for the static seed data below. */
  id?: number
  role: string
  company: string
  date: string
  /** Path/URL to the company logo image. Empty string = show monogram. */
  logo: string
  description: string
  /** Ordering weight (lower shows first). */
  sortOrder?: number
}

/**
 * Static seed data. Used to seed the database (`npm run db:seed`) and as the
 * fallback the data layer returns when `DATABASE_URL` is not configured.
 */
export const EXPERIENCES: Experience[] = [
  {
    role: "AI & IoT Engineer — Bootcamp",
    company: "National Research and Innovation Agency (BRIN)",
    date: "Feb – May 2026",
    logo: "/image/logo/brin.svg",
    description:
      "Deployed AMCS for real-time autonomous greenhouse monitoring, engineered IoT panel replicas to validate sensor arrays and control logic, built AI predictive models for solar and weather energy optimization, and integrated computer vision for plant-disease detection with dashboard alerting.",
  },
  {
    role: "Chairperson",
    company: "President University Robotic & Technology Club (PURTC)",
    date: "Aug 2024 – Present",
    logo: "/image/logo/purtc.svg",
    description:
      "Oversee organizational operations, manage divisions, and coordinate teams — developing and executing work plans, leading weekly training sessions, and driving strategic decisions to keep the club running effectively.",
  },
  {
    role: "Project Lead & Multimedia Specialist",
    company: "Keluarga Mahasiswa Buddhis Ashokavardhana (KMBA)",
    date: "Oct 2024 – Present",
    logo: "/image/logo/kmba.svg",
    description:
      "Led the committee for the Praktik Penghayatan Dhamma retreat, keeping the team aligned from preparation to execution, and handle visual content creation, design, and documentation across organizational events.",
  },
  {
    role: "Photographer",
    company: "JD Production",
    date: "Oct – Dec 2023",
    logo: "/image/logo/jd.svg",
    description:
      "Captured formal and candid photography for graduation events, operated drones for aerial cinematography, and handled post-production editing for promotional videos.",
  },
  {
    role: "Computer Technician",
    company: "V-TECH Computer",
    date: "Jun – Aug 2023",
    logo: "/image/logo/vtech.svg",
    description:
      "Executed complete hardware and software provisioning for new systems, streamlining OS installations and driver configuration to ensure optimal device performance.",
  },
]
