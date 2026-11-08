export type PensionSystem = "public" | "private" | "combined";
export type PersonaKind = "gosi_user" | "operator" | "tech";
export type ProfileState = "draft" | "pending_review" | "not_approved" | "active" | "paused";
export type RstStatus = "draft" | "pending" | "approved" | "not_approved";
export type PricingMode = "free" | "paid";
export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show_seeker"
  | "no_show_retiree"
  | "expired";
export type CancelParty = "seeker" | "retiree" | "gosi" | "system";
export type PaymentStatus = "held" | "released" | "paid_out" | "refunded" | "failed";
export type PaymentMethod = "mada" | "apple_pay" | "card";
export type ReportKind = "complaint" | "dispute";
export type ReportStatus = "open" | "refunded" | "rejected" | "closed";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type DocKind = "certificate" | "cv";

export type AppSettings = {
  id: number;
  demo_clock_offset_seconds: number;
  paid_enabled: boolean;
  price_floor: number;
  price_ceiling: number;
  last_settlement_period: string | null;
};

export type GosiPerson = {
  id: string;
  national_id: string;
  full_name: string;
  first_name: string;
  birth_date: string;
  mobile: string | null;
  region: string | null;
  is_retiree: boolean;
  pension_system: PensionSystem | null;
  retirement_date: string | null;
  pension_monthly: number | null;
  pension_bank: string | null;
  pension_iban_masked: string | null;
};

export type Employment = {
  id: string;
  person_id: string;
  employer: string;
  sector: string;
  start_date: string;
  end_date: string | null;
};

export type Persona = {
  id: string;
  kind: PersonaKind;
  person_id: string | null;
  display_name: string;
  blurb: string | null;
  sort: number;
};

export type Category = {
  id: string;
  name: string;
  name_ar: string;
  blurb: string;
  suggested_price: number;
  sort: number;
};

export type ServiceType = {
  id: string;
  category_id: string;
  name: string;
  name_ar: string;
  sort: number;
};

export type RetireeProfile = {
  person_id: string;
  state: ProfileState;
  show_employers: boolean;
  show_dates: boolean;
  show_sector: boolean;
  discipline_role: string | null;
  specializations: string | null;
  intro: string | null;
  languages: string[];
  terms_accepted_at: string | null;
  submitted_at: string | null;
  first_approved_at: string | null;
  readiness_passed_at: string | null;
  onboarding_watched_at: string | null;
  accepting_bookings: boolean;
  paused_at: string | null;
  paused_reason: string | null;
  application_step: number;
  created_at: string;
  updated_at: string;
};

export type RetireeServiceType = {
  id: string;
  person_id: string;
  service_type_id: string;
  description: string;
  status: RstStatus;
  reason_code: string | null;
  reason_note: string | null;
  decided_by: string | null;
  decided_at: string | null;
  pricing_mode: PricingMode;
  price: number | null;
};

export type AvailabilityWindow = {
  id: string;
  person_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export type Booking = {
  id: string;
  seeker_id: string;
  retiree_id: string;
  retiree_service_type_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  is_paid: boolean;
  price: number | null;
  seeker_need: string;
  seeker_goal: string;
  terms_accepted_at: string;
  hold_expires_at: string | null;
  daily_room_name: string | null;
  cancelled_by: CancelParty | null;
  cancelled_at: string | null;
  late_cancel: boolean;
  completed_at: string | null;
  reminders_sent: string[];
};

export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  psp_ref: string;
  merchant_id: string;
  status: PaymentStatus;
  held_at: string | null;
  release_due_at: string | null;
  released_at: string | null;
  refunded_at: string | null;
  refund_reason: string | null;
  paid_out_at: string | null;
  payout_id: string | null;
};

export type Report = {
  id: string;
  booking_id: string;
  reporter_id: string;
  kind: ReportKind;
  reason: string;
  description: string;
  status: ReportStatus;
  upheld: boolean | null;
  due_by: string | null;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  created_at: string;
};

export type Feedback = {
  booking_id: string;
  rating: number;
  helped: boolean | null;
  tags: string[];
  review_text: string | null;
  review_status: ReviewStatus | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  persona_id: string;
  title: string;
  body: string;
  link: string | null;
  created_at: string;
  read_at: string | null;
};

export type WaveFilters = {
  pensionSystems: PensionSystem[];
  sectors: string[];
  minYears: number;
  regions: string[];
};

export const LANGUAGES = [
  "Arabic",
  "English",
  "French",
  "Urdu",
  "Hindi",
  "Filipino",
  "Bengali",
  "Indonesian",
  "Turkish",
  "Spanish",
] as const;

export const REASON_CODES = {
  NOT_MATCHING: "Description doesn't match the Service Type",
  INSUFFICIENT_EVIDENCE: "Not enough evidence of this role or experience",
  DOCS_UNCLEAR: "Documents unclear or not relevant",
  CONTENT_ISSUE: "Content not appropriate for publishing",
  OTHER: "Other",
} as const;

export const REPORT_REASONS = [
  "Retiree didn't attend",
  "Session ended early",
  "Not the Service Type booked",
  "Unprofessional conduct",
  "Technical problem",
  "Other",
] as const;

export const NOTE_TEMPLATES: Record<string, { title: string; body: string }> = {
  WELCOME_TIPS: {
    title: "Welcome tips",
    body: "Welcome to GOSI Opportunities. Keep your weekly hours up to date, join a few minutes early, and describe each session in plain language.",
  },
  LOW_RATING: {
    title: "About recent ratings",
    body: "Your recent sessions are below the usual range. A short note on what the seeker wanted, and starting on time, helps the next session.",
  },
  MISSED_SESSION: {
    title: "Missed session",
    body: "A session was marked as missed because the call was not joined in time. Upcoming sessions stay on your list. Join from 10 minutes before the start.",
  },
  LATE_CANCELLATIONS: {
    title: "Late cancellations",
    body: "A cancellation close to the start time was recorded. If you cannot attend, cancel as early as you can so the seeker can book another slot.",
  },
  COMPLAINT_RECEIVED: {
    title: "A report was received",
    body: "A seeker sent a report about a session. Read the note, and keep upcoming sessions focused on the Service Type they booked.",
  },
  GENERAL: {
    title: "A note from GOSI",
    body: "",
  },
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
