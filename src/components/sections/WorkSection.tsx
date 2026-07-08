import Image from "next/image"

export function WorkSection() {
  const experiences = [
    {
      role: "AI & IoT Engineer — Bootcamp",
      company: "National Research and Innovation Agency (BRIN)",
      date: "Feb – May 2026",
      logo: "/assets/image/logo/brin.svg",
      description:
        "Deployed AMCS for real-time autonomous greenhouse monitoring, engineered IoT panel replicas to validate sensor arrays and control logic, built AI predictive models for solar and weather energy optimization, and integrated computer vision for plant-disease detection with dashboard alerting.",
    },
    {
      role: "Chairperson",
      company: "President University Robotic & Technology Club (PURTC)",
      date: "Aug 2024 – Present",
      logo: "/assets/image/logo/purtc.svg",
      description:
        "Oversee organizational operations, manage divisions, and coordinate teams — developing and executing work plans, leading weekly training sessions, and driving strategic decisions to keep the club running effectively.",
    },
    {
      role: "Project Lead & Multimedia Specialist",
      company: "Keluarga Mahasiswa Buddhis Ashokavardhana (KMBA)",
      date: "Oct 2024 – Present",
      logo: "/assets/image/logo/kmba.svg",
      description:
        "Led the committee for the Praktik Penghayatan Dhamma retreat, keeping the team aligned from preparation to execution, and handle visual content creation, design, and documentation across organizational events.",
    },
    {
      role: "Photographer",
      company: "JD Production",
      date: "Oct – Dec 2023",
      logo: "/assets/image/logo/jd.svg",
      description:
        "Captured formal and candid photography for graduation events, operated drones for aerial cinematography, and handled post-production editing for promotional videos.",
    },
    {
      role: "Computer Technician",
      company: "V-TECH Computer",
      date: "Jun – Aug 2023",
      logo: "/assets/image/logo/vtech.svg",
      description:
        "Executed complete hardware and software provisioning for new systems, streamlining OS installations and driver configuration to ensure optimal device performance.",
    },
  ]

  return (
    <section id="work" className="py-16 md:py-24 border-t border-(--color-border)">
      <div className="w-full">
        <h2 className="mb-12 flex items-center gap-3 font-display text-3xl font-bold text-(--color-text-primary)">
          Experience
        </h2>

        <div className="space-y-10">
          {experiences.map((exp, i) => {
            const monogram = exp.company
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase()

            return (
              <div
                key={i}
                className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between w-full"
              >
                {/* Left: logo placeholder + details */}
                <div className="flex gap-4 flex-1 md:pr-12">
                  {exp.logo ? (
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
                      <Image
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) font-mono text-sm font-semibold text-(--color-text-muted)"
                    >
                      {monogram}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-(--color-text-primary)">
                      {exp.role}
                    </h3>
                    <h4 className="text-sm text-(--color-text-secondary)">
                      {exp.company}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                      {exp.description}
                    </p>
                  </div>
                </div>

                {/* Right: date */}
                <span className="shrink-0 pl-16 font-mono text-xs text-(--color-text-muted) md:pl-4 md:ml-auto md:text-right">
                  {exp.date}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
