/** Shape of the editable site identity/links (DB-backed via `getSiteSettings`). */
export type SiteSettings = {
  name: string
  title: string
  description: string
  email: string
  githubUsername: string
  github: string
  linkedin: string
  instagram: string
  resume: string
  logo: string
  /** About page biography. Paragraph breaks via `\n\n`. */
  aboutBio: string
  /** About page profile image path/URL. */
  aboutImage: string
  /** Home hero long-form tagline paragraph. */
  heroTagline: string
  /** Terminal `whoami` username (e.g. "excel_viryan"). */
  terminalUsername: string
  /** Terminal `whoami` role/title (e.g. "AI/ML Engineer & IoT Builder"). */
  terminalRole: string
  /** Terminal `cat skills.txt` items (displayed as bullet list). */
  terminalSkills: string[]
}

/**
 * Static defaults. Used to seed the database and as the fallback the data layer
 * returns when `DATABASE_URL` is not configured or a query fails.
 */
export const SITE: SiteSettings = {
  name: "Excel Viryan",
  title: "Excel Viryan | Console",
  description:
    "AI/ML engineer, full-stack developer, and IoT builder at President University.",
  email: "viryanexcel@gmail.com",
  githubUsername: "Viry16",
  github: "https://github.com/Viry16",
  linkedin: "https://linkedin.com/in/excelviryan",
  instagram: "https://instagram.com/excelviryan12",
  resume: "/cv/CV_Excel%20Viryan.pdf",
  logo: "/image/logo/logo.svg",
  aboutBio:
    "I'm Excel Viryan — an enthusiastic, curious software developer with a foundation in multimedia design and a deep focus on Artificial Intelligence. I'm a Sarjana Komputer (S.Kom.) candidate at President University in Cikarang, with a 3.87/4.00 GPA.\n\nI enjoy tackling complex challenges through intuitive UI/UX and smart automation — building robust backend architectures, bridging them with responsive frontends, and integrating Machine Learning, Deep Learning, and NLP models. I currently chair PURTC (Robotics & Technology Club) and am expanding my full-stack skills toward next-generation IoT solutions.",
  aboutImage: "/image/profile_image/excel.webp",
  heroTagline:
    "A software developer with roots in multimedia design and a deep focus on AI. I build robust backends, bridge them with responsive frontends, and integrate ML, deep learning, and NLP models — lately channeling all of it into next-generation IoT solutions.",
  terminalUsername: "excel_viryan",
  terminalRole: "AI/ML Engineer & IoT Builder",
  terminalSkills: [
    "Python, TypeScript",
    "Next.js, React, Laravel",
    "YOLOv8, Computer Vision, NLP",
    "ESP32, Arduino, MQTT",
  ],
}
