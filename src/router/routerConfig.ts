// Type-safe page names object
export const PAGES = {
  LOGIN: "login",
  TRANSMIT: "transmit",
  SAMPLE: "sample",
  SAMPLE_TABLE: "sample-table",
  NOT_FOUND: "not-found",
} as const;

// Type for page names
export type PageName = (typeof PAGES)[keyof typeof PAGES];

// Type-safe routes object that creates absolute paths from page names
export const ROUTES = {
  LOGIN: `/${PAGES.LOGIN}`,
  TRANSMIT: `/${PAGES.TRANSMIT}`,
  SAMPLE: `/${PAGES.SAMPLE}`,
  SAMPLE_TABLE: `/${PAGES.SAMPLE_TABLE}`,
  NOT_FOUND: `/${PAGES.NOT_FOUND}`,
} as const;
