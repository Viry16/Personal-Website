export interface NowItem {
  /** Database id. Absent for the static seed data below. */
  id?: number
  /**
   * Icon key that maps to a lucide icon in the NowFeed component.
   * Known keys: "reading", "building", "listening".
   * Any other string falls back to a generic icon.
   */
  icon: string
  /** Short uppercase label shown above the value (e.g. "Reading"). */
  label: string
  /** The actual content (e.g. "Designing Data-Intensive Applications"). */
  value: string
  /** Ordering weight (lower shows first). */
  sortOrder?: number
}

/**
 * Static seed data. Used to seed the database (`npm run db:seed`) and as the
 * fallback the data layer returns when `DATABASE_URL` is not configured.
 */
export const NOW_ITEMS: NowItem[] = [
  {
    icon: "reading",
    label: "Reading",
    value: "Designing Data-Intensive Applications",
  },
  {
    icon: "building",
    label: "Building",
    value: "Portfolio v4 & Edge AI pipelines",
  },
  {
    icon: "listening",
    label: "Listening",
    value: "Lofi Girl Synthwave",
  },
]
