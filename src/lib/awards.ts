export interface Award {
  id?: number
  title: string
  issuer: string
  date: string
  logo: string
  image: string
  description: string
  url: string
  sortOrder?: number
}

export const AWARDS: Award[] = [
  {
    title: "Outstanding Performance Award",
    issuer: "President University",
    date: "2024",
    logo: "",
    image: "",
    description: "Awarded for exceptional academic and extracurricular performance.",
    url: "",
  },
  {
    title: "Certificate of Completion: AI & IoT",
    issuer: "National Research and Innovation Agency (BRIN)",
    date: "May 2026",
    logo: "",
    image: "",
    description: "Successfully completed the rigorous bootcamp covering AI model deployment and IoT integrations.",
    url: "",
  }
]

