export type ProjectType = "Software" | "Hardware"
export type ProjectStatus = "Live" | "In Progress" | "Archived"

export interface Project {
  /** Database id. Absent for the static seed data below. */
  id?: number
  title: string
  subtitle?: string
  description: string
  highlights: string[]
  tags: string[]
  image: string
  type: ProjectType
  period: string
  role: string
  status: ProjectStatus
  website?: string
  source?: string
  featured?: boolean
  /** Ordering weight (lower shows first). DB-only; absent in seed data. */
  sortOrder?: number
}

/**
 * Static seed data. Used to seed the database (`npm run db:seed`) and as the
 * fallback the data layer returns when `DATABASE_URL` is not configured.
 */
export const PROJECTS: Project[] = [
  {
    title: "AMCS",
    subtitle: "Autonomous Monitoring & Control System",
    description:
      "Computer vision system that detects plant diseases early, paired with IoT sensors that auto-adjust greenhouse conditions. Built in partnership with BRIN researchers.",
    highlights: [
      "Trained a YOLOv8 detection model across 7 plant-disease classes (downy mildew, early/late blight, gray/green mold, powdery mildew, tomato mosaic virus)",
      "Designed a split architecture separating the UI and compute servers",
      "Built a dashboard app with real-time sensor updates and an async YOLOv8 AI server",
      "Implemented authenticated API communication between services",
    ],
    tags: [
      "Python",
      "InfluxDB",
      "MySQL",
      "Laravel",
      "EMQX MQTT",
      "Cloudflare Tunnel",
      "Arduino",
    ],
    image: "/assets/projects/amcs.jpg",
    type: "Hardware",
    period: "Feb – May 2026",
    role: "AI Engineer",
    status: "Live",
    featured: true,
  },
  {
    title: "Clearity",
    description:
      "Free browser-based photo editor with AI features like background removal and style transfer that run entirely in-browser — no expensive servers required.",
    highlights: [
      "Built the editor workspace: layer system, canvas, and tool panels (crop, transform, resize, adjust, filters, draw, text, shape)",
      "Implemented multi-layer composition with real-time preview",
      "Designed the UX for 10 AI-powered features",
      "Full export system (PNG/JPG with quality control)",
    ],
    tags: ["React", "TypeScript", "HTML5 Canvas", "Vite"],
    image: "/assets/projects/clearity.png",
    type: "Software",
    period: "April 2025",
    role: "Frontend",
    status: "Live",
    featured: true,
  },
  {
    title: "SCIO",
    description:
      "An intelligent RAG chatbot that answers IT support questions by reading private company documents, eliminating repetitive manual support tickets.",
    highlights: [
      "Designed and built the chat interface in Next.js",
      "Ensured a responsive, intuitive experience for 24/7 support",
      "Reduced average response time to under 90 seconds",
    ],
    tags: ["Next.js", "FastAPI", "Llama 3", "Ollama", "SQLite", "RAG"],
    image: "/assets/projects/scio.png",
    type: "Software",
    period: "Jan – Feb 2026",
    role: "Front End",
    status: "Archived",
  },
  {
    title: "Smart Factory Automation System",
    description:
      "Computer vision + IoT system that automatically sorts factory items and detects defects in real-time, replacing slow manual sorting.",
    highlights: [
      "Programmed ESP32 microcontrollers for hardware communication",
      "Connected live sensor data to a web dashboard",
      "Integrated computer-vision output with automatic sorting triggers",
    ],
    tags: ["ESP32", "Python", "Computer Vision", "React", "Real-time Sensors"],
    image: "/assets/projects/factory-automation.jpg",
    type: "Hardware",
    period: "Mar – Apr 2026",
    role: "IoT & Back End",
    status: "Archived",
  },
]

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured)
