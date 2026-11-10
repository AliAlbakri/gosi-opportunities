import { createHash, randomUUID } from "crypto";
import { readFileSync } from "fs";
import { clearClockCache } from "@/lib/domain/clock";
import { addWorkingDays } from "@/lib/domain/rules";
import { addRiyadhDays, atRiyadh, formatMonthKey, onTheHour, riyadhParts } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";

const DESC =
  "I taught English in secondary schools for 24 years. I can help you practice conversation, work on pronunciation, or prepare for an interview or presentation in English.";
const ACCOUNTING_DESC =
  "I spent 22 years as an accountant in the private sector. I can walk you through small-business accounts, bookkeeping habits, and what a VAT or Zakat obligation means in practice. This is guidance only.";

const REVIEWS = [
  "He walked through my restaurant VAT return line by line using last month's invoices.",
  "She slowed the conversation down until I could answer without translating first.",
  "We rebuilt my cash book from a shoebox of receipts and I left with a weekly habit.",
  "The exam tips were specific: timing, the essay shape, and three phrases I still use.",
  "I finally understand the difference between profit and the cash in the drawer.",
  "Arabic greetings and shop talk, practised until they felt natural.",
  "He marked the lines on my income statement that an owner should question.",
  "We rehearsed my project introduction and cut it from four minutes to one.",
  "Bookkeeping categories now match how my stall actually takes money.",
  "Zakat on inventory was the part I had been guessing. It is written down now.",
  "Pronunciation drills for the words I stumble on in meetings.",
  "She used my own lease to explain what a statement of accounts is for.",
  "A calm hour on how to talk to a bookkeeper without feeling lost.",
  "French numbers and dates, enough for a parent-teacher meeting.",
  "We compared two months of sales and spotted the week the costs jumped.",
  "English for a job interview: answers, not just vocabulary lists.",
  "He showed me which records to keep if a review ever asks.",
  "I practised explaining my idea to someone who had not read the slides.",
  "The balance sheet stopped being a wall of numbers.",
  "Urdu examples for the customers who visit the shop on Thursdays.",
  "We set a simple chart of accounts I can keep up after closing.",
  "She corrected my tense gently and let me try the sentence again.",
  "VAT on delivery fees was the question I came with, and it is answered.",
  "A clear plan for the speaking section of the language exam.",
  "He drew the money in and money out for one Saturday at the restaurant.",
  "I left with three phrases for booking a table and taking an order.",
  "Management accounts in plain language, using my contracting invoices.",
  "We role-played a difficult customer conversation in English.",
  "The Zakat base was smaller than I feared once we listed the debts.",
  "Reading practice from a short news paragraph, then my own summary.",
  "She showed me how to spot a missing receipt before month end.",
  "My presentation opening is now one sentence I can say slowly.",
  "We labelled every pot of cash: sales, tips, and what I pay myself.",
  "Hindi small talk for the staff room, not a textbook chapter.",
  "He explained accruals with the unpaid supplier bill on my desk.",
  "I can introduce my neighbourhood and my work without freezing.",
  "A walkthrough of a profit and loss that a non-accountant can read.",
  "Pronunciation of the sounds I avoid, with a list to practise.",
  "We checked whether my prices cover the VAT I have to hand over.",
  "Spanish for a family visit: airport, hotel, and a doctor's appointment.",
  "The session used my actual trial balance, not a sample company.",
  "She had me retell a story and only then fixed the grammar.",
  "I know which folder to keep the Zakat working papers in.",
  "Exam timing: we did one passage against a clock.",
  "He translated the accountant's email into what I should do this week.",
  "Everyday English for calling a school and asking for the head teacher.",
  "We separated owner drawings from business costs. That was the whole hour.",
  "Arabic letters on signs, read out loud until I stopped guessing.",
  "A checklist for the monthly close that fits on one page.",
  "I practised answering 'tell me about yourself' without reading notes.",
  "The statement of cash flows finally matched the bank app.",
  "She picked three grammar slips and we repaired only those.",
  "Bookkeeping for a stall that mixes cash and transfer.",
  "We planned how I will ask questions in the oral exam.",
  "He flagged a supplier balance that had been copied into the wrong month.",
  "Confidence more than grammar: I spoke for ten minutes straight.",
  "Zakat on receivables, with my own aged list as the example.",
  "A short dialogue for welcoming a guest and offering coffee, in English.",
  "I can read the notes under the accounts instead of skipping them.",
  "We built a revision timetable that respects my shift pattern.",
  "Clear, patient, and specific to the papers I brought.",
  "I left knowing the one number to watch before I price a new dish.",
];

function uuid(name: string) {
  const h = createHash("sha1").update(`gosi:${name}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function loadEnv() {
  try {
    const text = readFileSync(".env.local", "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim();
    }
  } catch {
    /* Next.js loads env for the reset button. */
  }
}

function slotAfter(appNow: Date, hoursAhead: number) {
  const earliest = appNow.getTime() + hoursAhead * 60 * 60 * 1000;
  let day = atRiyadh(riyadhParts(new Date(earliest)).y, riyadhParts(new Date(earliest)).m, riyadhParts(new Date(earliest)).d, 12);
  for (let i = 0; i < 21; i++) {
    const parts = riyadhParts(day);
    if (parts.weekday <= 4) {
      for (const hour of [9, 10, 11, 12, 13, 14, 15, 16]) {
        const slot = atRiyadh(parts.y, parts.m, parts.d, hour);
        if (slot.getTime() >= earliest) return slot;
      }
    }
    day = addRiyadhDays(day, 1);
  }
  throw new Error("No slot");
}

async function wipe() {
  const db = admin();
  const tables = [
    "payments",
    "payouts",
    "reports",
    "feedback",
    "session_events",
    "bookings",
    "notifications",
    "ops_notes",
    "availability_windows",
    "retiree_documents",
    "retiree_service_types",
    "retiree_profiles",
    "invitations",
    "invitation_waves",
    "personas",
    "gosi_employment",
    "gosi_people",
  ];
  const key: Record<string, string> = { feedback: "booking_id", retiree_profiles: "person_id" };
  for (const table of tables) {
    const column = key[table] ?? "id";
    const { error } = await db.from(table).delete().neq(column, "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  const { error } = await db.from("audit_log").delete().gte("id", 0);
  if (error) throw new Error(`audit_log: ${error.message}`);
}

type Person = {
  slug?: string;
  kind?: "gosi_user";
  first: string;
  last: string;
  national: string;
  birth: string;
  mobile: string;
  region: string;
  retiree: boolean;
  pension?: "public" | "private" | "combined";
  retired?: string;
  blurb?: string;
  sort?: number;
  sector: string;
  employer: string;
};

export async function seedDemo() {
  loadEnv();
  const db = admin();
  await wipe();
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
  const prevKey = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`;
  await db.from("app_settings").update({
    demo_clock_offset_seconds: 0,
    paid_enabled: false,
    price_floor: 50,
    price_ceiling: 500,
    last_settlement_period: prevKey,
    updated_at: now.toISOString(),
  }).eq("id", 1);
  await db.from("categories").update({ suggested_price: 120 }).eq("id", "education");
  await db.from("categories").update({ suggested_price: 180 }).eq("id", "accounting");
  const shorts: [string, string, string][] = [
    ["edu-english", "English lessons", "Lessons and conversation practice"],
    ["edu-arabic", "Arabic for non-Arabic speakers", "Learn Arabic from a retired teacher"],
    ["edu-other-lang", "Other languages", "e.g. French"],
    ["edu-exam-prep", "Language exam prep", "Get ready for a language test"],
    ["acc-small-biz", "Small business accounts", "Make sense of your business numbers"],
    ["acc-bookkeeping", "Bookkeeping setup", "Set up simple, reliable records"],
    ["acc-statements", "Financial statements", "Read and understand your statements"],
    ["acc-vat-zakat", "VAT and Zakat", "Understand what you owe and when"],
  ];
  for (const [id, short_name, blurb] of shorts) {
    const { error } = await db.from("service_types").update({ short_name, blurb }).eq("id", id);
    if (error) throw new Error(error.message);
  }
  clearClockCache();

  const people: Person[] = [
    { slug: "ret-fahad", first: "Fahad", last: "Al-Otaibi", national: "1000004821", birth: "1962-04-12", mobile: "0551110001", region: "Riyadh", retiree: true, pension: "private", retired: "2019-06-01", sector: "Education", employer: "Riyadh Secondary School", blurb: "Retired English teacher · Riyadh · ready for the invite wave", sort: 1 },
    { slug: "ret-mona", first: "Mona", last: "Al-Harbi", national: "1000004822", birth: "1964-01-20", mobile: "0551110002", region: "Riyadh", retiree: true, pension: "public", retired: "2020-01-01", sector: "Education", employer: "Ministry of Education", blurb: "Retired Arabic teacher · application in draft", sort: 2 },
    { slug: "ret-saad", first: "Saad", last: "Al-Qahtani", national: "1000004823", birth: "1960-09-03", mobile: "0551110003", region: "Eastern Province", retiree: true, pension: "private", retired: "2018-03-01", sector: "Construction", employer: "Eastern Projects Co.", blurb: "Retired accountant · application under review", sort: 3 },
    { slug: "ret-huda", first: "Huda", last: "Al-Shammari", national: "1000004824", birth: "1966-11-11", mobile: "0551110004", region: "Makkah", retiree: true, pension: "public", retired: "2021-05-01", sector: "Education", employer: "Jeddah Girls School", blurb: "Teacher · exam prep not approved", sort: 4 },
    { slug: "ret-abdullah", first: "Abdullah", last: "Al-Dosari", national: "1000004825", birth: "1958-02-02", mobile: "0551110005", region: "Riyadh", retiree: true, pension: "private", retired: "2017-01-15", sector: "Finance", employer: "Riyadh Accounts Bureau", blurb: "Accountant · active · 4.7 from 18 sessions", sort: 5 },
    { slug: "ret-latifa", first: "Latifa", last: "Al-Ghamdi", national: "1000004826", birth: "1965-07-19", mobile: "0551110006", region: "Jeddah", retiree: true, pension: "public", retired: "2022-02-01", sector: "Education", employer: "Jeddah Language School", blurb: "English teacher · active · new, no ratings", sort: 6 },
    { slug: "ret-majed", first: "Majed", last: "Al-Mutairi", national: "1000004827", birth: "1959-12-08", mobile: "0551110007", region: "Qassim", retiree: true, pension: "combined", retired: "2016-08-01", sector: "Banking", employer: "Qassim National Bank", blurb: "Accountant · active · late cancellation and a complaint", sort: 7 },
    { slug: "ret-turki", first: "Turki", last: "Al-Anazi", national: "1000004828", birth: "1961-05-25", mobile: "0551110008", region: "Madinah", retiree: true, pension: "public", retired: "2019-09-01", sector: "Education", employer: "Madinah Schools", blurb: "Teacher · paused by GOSI", sort: 8 },
    { slug: "ret-hassan", first: "Hassan", last: "Al-Subaie", national: "1000004829", birth: "1963-03-14", mobile: "0551110009", region: "Asir", retiree: true, pension: "private", retired: "2020-04-01", sector: "Education", employer: "Abha Boys School", blurb: "Invited · has not opened the invite", sort: 9 },
    { slug: "ret-nasser", first: "Nasser", last: "Al-Shehri", national: "1000004830", birth: "1957-08-30", mobile: "0551110010", region: "Makkah", retiree: true, pension: "private", retired: "2015-01-01", sector: "Finance", employer: "Makkah Ledger Office", blurb: "Accountant · busy for the coming week", sort: 10 },
  ];

  const extras = ["Yousef Al-Ajmi", "Nora Al-Zahrani", "Saleh Al-Harthy", "Amina Al-Johani", "Khaled Al-Tamimi", "Reemah Al-Otaibi"];
  extras.forEach((full, index) => {
    const [first, last] = [full.split(" ")[0], full.split(" ").slice(1).join(" ")];
    people.push({
      slug: `ret-extra-${index + 1}`,
      first,
      last,
      national: `10000049${String(index + 1).padStart(2, "0")}`,
      birth: "1960-06-06",
      mobile: `055222000${index}`,
      region: index === 5 ? "Eastern Province" : "Makkah",
      retiree: true,
      pension: "private",
      retired: "2018-01-01",
      sector: index % 2 === 0 ? "Education" : "Finance",
      employer: "Regional Office",
      blurb: "Active retiree",
      sort: 20 + index,
    });
  });

  const poolNames = ["Nawaf Al-Harbi", "Sami Al-Qahtani", "Waleed Al-Dosari", "Tariq Al-Ghamdi"];
  poolNames.forEach((full, index) => {
    const [first, last] = [full.split(" ")[0], full.split(" ").slice(1).join(" ")];
    people.push({
      first,
      last,
      national: `10000070${index}`,
      birth: "1959-01-01",
      mobile: `055333000${index}`,
      region: "Riyadh",
      retiree: true,
      pension: "private",
      retired: "2016-01-01",
      sector: "Education",
      employer: "Riyadh Public School",
    });
  });

  const regions = ["Makkah", "Eastern Province", "Madinah", "Qassim", "Asir"];
  const sectors = ["Finance", "Banking", "Government", "Construction", "Healthcare", "Retail"];
  for (let i = 0; i < 20; i++) {
    people.push({
      first: `Retiree${i + 1}`,
      last: "Al-Saud",
      national: `100001${String(i).padStart(4, "0")}`,
      birth: "1958-05-05",
      mobile: `055444${String(i).padStart(4, "0")}`,
      region: regions[i % regions.length],
      retiree: true,
      pension: (["public", "private", "combined"] as const)[i % 3],
      retired: "2014-01-01",
      sector: sectors[i % sectors.length],
      employer: `${sectors[i % sectors.length]} Employer ${i + 1}`,
    });
  }

  const seekers: Person[] = [
    { slug: "seek-sara", first: "Sara", last: "Al-Nasser", national: "1000001111", birth: "1997-03-03", mobile: "0555550001", region: "Riyadh", retiree: false, sector: "Government", employer: "Ministry of Finance", blurb: "Employee, 29 · wants English practice", sort: 100 },
    { slug: "seek-james", first: "James", last: "Rahman", national: "2000002222", birth: "1985-06-15", mobile: "0555550002", region: "Eastern Province", retiree: false, sector: "Retail", employer: "Gulf Retail", blurb: "Resident · wants Arabic lessons", sort: 101 },
    { slug: "seek-omar", first: "Omar", last: "Al-Farsi", national: "1000003333", birth: "1991-09-09", mobile: "0555550003", region: "Jeddah", retiree: false, sector: "Retail", employer: "Omar's Kitchen", blurb: "Restaurant owner · wants VAT guidance", sort: 102 },
    { slug: "seek-reem", first: "Reem", last: "Al-Otaibi", national: "1000004444", birth: "2004-01-22", mobile: "0555550004", region: "Riyadh", retiree: false, sector: "Education", employer: "University trainee", blurb: "22 · browsing sessions", sort: 103 },
    { slug: "seek-teen", first: "Yazan", last: "Al-Harbi", national: "1000005555", birth: `${now.getUTCFullYear() - 16}-06-01`, mobile: "0555550005", region: "Riyadh", retiree: false, sector: "Education", employer: "School", blurb: "16 · booking is blocked", sort: 104 },
  ];
  for (let i = 0; i < 7; i++) {
    seekers.push({
      first: `Employee${i + 1}`,
      last: "Al-Ali",
      national: `2000006${String(i).padStart(3, "0")}`,
      birth: "1990-02-02",
      mobile: `055666000${i}`,
      region: regions[i % regions.length],
      retiree: false,
      sector: "Government",
      employer: "Public agency",
    });
  }

  const all = [...people, ...seekers];
  const rows = all.map((person) => ({
    id: uuid(`person:${person.national}`),
    national_id: person.national,
    full_name: `${person.first} ${person.last}`,
    first_name: person.first,
    birth_date: person.birth,
    mobile: person.mobile,
    region: person.region,
    is_retiree: person.retiree,
    pension_system: person.retiree ? person.pension : null,
    retirement_date: person.retired ?? null,
    pension_monthly: person.retiree ? 8000 : null,
    pension_bank: person.retiree ? "Al Rajhi Bank" : null,
    pension_iban_masked: person.retiree ? "SA** **** **** **** **** 4821" : null,
  }));
  const { error: peopleError } = await db.from("gosi_people").insert(rows);
  if (peopleError) throw new Error(peopleError.message);
  const idOf = new Map(all.map((person) => [person.national, uuid(`person:${person.national}`)]));

  const jobs = all.flatMap((person) => {
    const base = {
      id: uuid(`job:${person.national}`),
      person_id: idOf.get(person.national),
      employer: person.employer,
      sector: person.sector,
      start_date: person.retiree ? "1994-01-01" : "2016-01-01",
      end_date: person.retiree ? person.retired ?? "2019-01-01" : null,
    };
    if (!person.retiree) return [base];
    return [
      base,
      {
        id: uuid(`job2:${person.national}`),
        person_id: idOf.get(person.national),
        employer: person.sector === "Education" ? "Riyadh Secondary Schools, Ministry of Education" : "Al-Faisal Accounting Co.",
        sector: person.sector,
        start_date: "1988-01-01",
        end_date: "1993-12-31",
      },
    ];
  });
  const { error: jobError } = await db.from("gosi_employment").insert(jobs);
  if (jobError) throw new Error(jobError.message);

  const personas = [
    { id: "op-noura", kind: "operator", person_id: null, display_name: "Noura Al-Harbi", blurb: "Operator", sort: 1 },
    { id: "op-khalid", kind: "operator", person_id: null, display_name: "Khalid Al-Mutairi", blurb: "Operator", sort: 2 },
    ...all.filter((person) => person.slug).map((person) => ({
      id: person.slug,
      kind: "gosi_user",
      person_id: idOf.get(person.national),
      display_name: `${person.first} ${person.last}`,
      blurb: person.blurb ?? "",
      sort: person.sort ?? 50,
    })),
  ];
  const { error: personaError } = await db.from("personas").insert(personas);
  if (personaError) throw new Error(personaError.message);

  const appNow = now;
  const waveId = uuid("wave:1");
  await db.from("invitation_waves").insert({
    id: waveId,
    name: "Wave 1 · Riyadh teachers",
    filters: { regions: ["Riyadh"], sectors: ["Education"] },
    size_cap: 13,
    status: "sent",
    created_by: "op-noura",
    sent_at: new Date(appNow.getTime() - 20 * 86400000).toISOString(),
  });

  const invitedSlugs = new Set(["ret-mona", "ret-saad", "ret-huda", "ret-abdullah", "ret-latifa", "ret-majed", "ret-turki", "ret-hassan", "ret-nasser", "ret-extra-1", "ret-extra-2", "ret-extra-3", "ret-extra-5"]);
  const invitations = all
    .filter((person) => person.slug && invitedSlugs.has(person.slug))
    .map((person) => ({
      id: uuid(`inv:${person.slug}`),
      person_id: idOf.get(person.national),
      wave_id: waveId,
      invited_by: "op-noura",
      invited_at: new Date(appNow.getTime() - 20 * 86400000).toISOString(),
      opened_at: person.slug === "ret-hassan" ? null : new Date(appNow.getTime() - 18 * 86400000).toISOString(),
    }));
  const { error: invError } = await db.from("invitations").insert(invitations);
  if (invError) throw new Error(invError.message);

  const pid = (slug: string) => {
    const person = all.find((row) => row.slug === slug);
    return idOf.get(person!.national)!;
  };

  const liveAt = new Date(appNow.getTime() - 10 * 86400000).toISOString();
  const profiles = [
    { person_id: pid("ret-mona"), state: "draft", application_step: 3, discipline_role: "Arabic teacher", languages: ["Arabic", "English"], intro: "I taught Arabic for many years." },
    { person_id: pid("ret-saad"), state: "pending_review", application_step: 5, discipline_role: "Accountant", languages: ["Arabic"], specializations: "VAT, bookkeeping", intro: "I worked as an accountant even when the GOSI sector reads construction.", submitted_at: liveAt, terms_accepted_at: liveAt },
    { person_id: pid("ret-huda"), state: "not_approved", application_step: 5, discipline_role: "English teacher", languages: ["English", "Arabic"], submitted_at: liveAt, terms_accepted_at: liveAt },
    { person_id: pid("ret-abdullah"), state: "active", application_step: 5, discipline_role: "Accountant", languages: ["Arabic", "English"], intro: "I help small businesses read their accounts.", submitted_at: liveAt, terms_accepted_at: liveAt, first_approved_at: liveAt, onboarding_watched_at: liveAt, readiness_passed_at: liveAt },
    { person_id: pid("ret-latifa"), state: "active", application_step: 5, discipline_role: "English teacher", languages: ["English", "Arabic"], intro: "Conversation practice for everyday English.", submitted_at: liveAt, terms_accepted_at: liveAt, first_approved_at: liveAt, onboarding_watched_at: liveAt, readiness_passed_at: liveAt },
    { person_id: pid("ret-majed"), state: "active", application_step: 5, discipline_role: "Accountant", languages: ["Arabic"], intro: "Bookkeeping guidance for owners.", submitted_at: liveAt, terms_accepted_at: liveAt, first_approved_at: liveAt, onboarding_watched_at: liveAt, readiness_passed_at: liveAt },
    { person_id: pid("ret-turki"), state: "paused", application_step: 5, discipline_role: "Teacher", languages: ["Arabic"], submitted_at: liveAt, terms_accepted_at: liveAt, first_approved_at: liveAt, onboarding_watched_at: liveAt, readiness_passed_at: liveAt, paused_at: liveAt, paused_reason: "Repeated missed sessions" },
    { person_id: pid("ret-nasser"), state: "active", application_step: 5, discipline_role: "Accountant", languages: ["Arabic"], intro: "Financial statements in plain language.", submitted_at: liveAt, terms_accepted_at: liveAt, first_approved_at: liveAt, onboarding_watched_at: liveAt, readiness_passed_at: liveAt },
  ];
  for (const [index, slug] of ["ret-extra-1", "ret-extra-2", "ret-extra-3", "ret-extra-4", "ret-extra-5"].entries()) {
    profiles.push({
      person_id: pid(slug),
      state: "active",
      application_step: 5,
      discipline_role: index % 2 === 0 ? "Teacher" : "Accountant",
      languages: ["Arabic", "English"],
      intro: [
        "I taught English conversation for two decades and still enjoy helping people prepare for a meeting.",
        "I kept the books for a family trading company and can walk you through a monthly close.",
        "I coached students through language exams and like a clear practice plan.",
        "I prepared management accounts for a contracting firm and explain the statements in plain words.",
        "I am still finishing the go-live steps, so seekers will not see me until that is done.",
      ][index],
      submitted_at: liveAt,
      terms_accepted_at: liveAt,
      first_approved_at: liveAt,
      onboarding_watched_at: slug === "ret-extra-5" ? null : liveAt,
      readiness_passed_at: slug === "ret-extra-5" ? null : liveAt,
    } as (typeof profiles)[number]);
  }
  const { error: profileError } = await db.from("retiree_profiles").insert(profiles.map((row) => ({ ...row, updated_at: liveAt })));
  if (profileError) throw new Error(profileError.message);

  const serviceRows = [
    { person_id: pid("ret-saad"), service_type_id: "acc-vat-zakat", description: ACCOUNTING_DESC, status: "pending" },
    { person_id: pid("ret-saad"), service_type_id: "acc-bookkeeping", description: ACCOUNTING_DESC, status: "pending" },
    { person_id: pid("ret-huda"), service_type_id: "edu-exam-prep", description: DESC, status: "not_approved", reason_code: "INSUFFICIENT_EVIDENCE", reason_note: "The documents do not show exam-preparation experience.", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-abdullah"), service_type_id: "acc-small-biz", description: ACCOUNTING_DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-abdullah"), service_type_id: "acc-statements", description: ACCOUNTING_DESC, status: "pending" },
    { person_id: pid("ret-abdullah"), service_type_id: "acc-vat-zakat", description: ACCOUNTING_DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-latifa"), service_type_id: "edu-english", description: DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-majed"), service_type_id: "acc-bookkeeping", description: ACCOUNTING_DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-turki"), service_type_id: "edu-arabic", description: DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-nasser"), service_type_id: "acc-statements", description: ACCOUNTING_DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-extra-1"), service_type_id: "edu-english", description: DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-extra-2"), service_type_id: "edu-arabic", description: DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-extra-3"), service_type_id: "edu-other-lang", description: DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-extra-4"), service_type_id: "acc-small-biz", description: ACCOUNTING_DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
    { person_id: pid("ret-extra-5"), service_type_id: "acc-vat-zakat", description: ACCOUNTING_DESC, status: "approved", decided_by: "op-noura", decided_at: liveAt },
  ].map((row, index) => ({ id: uuid(`rst:${row.person_id}:${row.service_type_id}`), ...row, description: `${row.description} We will use an example from your own work, starting with point ${index + 1}.` }));
  const { error: rstError } = await db.from("retiree_service_types").insert(serviceRows);
  if (rstError) throw new Error(rstError.message);

  const patterns = [
    { days: [0, 1, 2, 3, 4], start: "09:00:00", end: "12:00:00" },
    { days: [0, 1, 2, 3, 4], start: "18:00:00", end: "21:00:00" },
    { days: [5, 6], start: "10:00:00", end: "14:00:00" },
    { days: [1, 3, 5], start: "08:00:00", end: "11:00:00" },
  ];
  const windowPeople = ["ret-abdullah", "ret-latifa", "ret-majed", "ret-extra-1", "ret-extra-2", "ret-extra-3", "ret-extra-4", "ret-turki"];
  const windows = [
    ...windowPeople.flatMap((slug, index) => {
      const pattern = patterns[index % patterns.length];
      return pattern.days.map((weekday) => ({
        id: uuid(`win:${slug}:${weekday}`),
        person_id: pid(slug),
        weekday,
        start_time: pattern.start,
        end_time: pattern.end,
      }));
    }),
    ...[0, 1, 2, 3, 4].map((weekday) => ({
      id: uuid(`win:ret-nasser:${weekday}`),
      person_id: pid("ret-nasser"),
      weekday,
      start_time: "09:00:00",
      end_time: "10:00:00",
    })),
  ];
  const { error: winError } = await db.from("availability_windows").insert(windows);
  if (winError) throw new Error(winError.message);

  const rst = (slug: string, type: string) => uuid(`rst:${pid(slug)}:${type}`);
  const primary: Record<string, string> = {
    "ret-abdullah": "acc-small-biz",
    "ret-latifa": "edu-english",
    "ret-majed": "acc-bookkeeping",
    "ret-nasser": "acc-statements",
    "ret-extra-1": "edu-english",
    "ret-extra-2": "edu-arabic",
    "ret-extra-3": "edu-other-lang",
    "ret-extra-4": "acc-small-biz",
    "ret-extra-5": "acc-vat-zakat",
  };
  const bookings: Record<string, unknown>[] = [];
  const feedback: Record<string, unknown>[] = [];
  const activeForHistory = ["ret-abdullah", "ret-latifa", "ret-majed", "ret-nasser", "ret-extra-1"];
  const ratingPlan = [
    ...Array.from({ length: 13 }, () => 5),
    ...Array.from({ length: 5 }, () => 4),
    4, 4, 3, 3, 3,
    ...Array.from({ length: 17 }, () => 5),
  ];
  for (let i = 0; i < 40; i++) {
    const retiree = i < 18 ? "ret-abdullah" : i < 23 ? "ret-majed" : activeForHistory[i % activeForHistory.length];
    const seeker = seekers[i % 4];
    const starts = onTheHour(new Date(appNow.getTime() - (i + 3) * 86400000));
    const id = uuid(`past:${i}`);
    bookings.push({
      id,
      seeker_id: pid(seeker.slug!),
      retiree_id: pid(retiree),
      retiree_service_type_id: rst(retiree, primary[retiree]),
      starts_at: starts.toISOString(),
      ends_at: new Date(starts.getTime() + 3600000).toISOString(),
      status: "completed",
      is_paid: false,
      price: 0,
      seeker_need: "I want a clearer explanation of this topic.",
      seeker_goal: "Leave with one practical next step.",
      terms_accepted_at: starts.toISOString(),
      completed_at: new Date(starts.getTime() + 3600000).toISOString(),
      created_at: new Date(starts.getTime() - 3 * 86400000).toISOString(),
    });
    const review = REVIEWS[i % REVIEWS.length];
    feedback.push({
      booking_id: id,
      rating: ratingPlan[i] ?? 5,
      helped: true,
      tags: ["clear explanation", "strong knowledge"],
      review_text: review,
      review_status: "approved",
      created_at: new Date(starts.getTime() + 3700000).toISOString(),
    });
  }

  const noShowStart = onTheHour(new Date(appNow.getTime() - 6 * 86400000));
  bookings.push({
    id: uuid("noshow"),
    seeker_id: pid("seek-omar"),
    retiree_id: pid("ret-majed"),
    retiree_service_type_id: rst("ret-majed", "acc-bookkeeping"),
    starts_at: noShowStart.toISOString(),
    ends_at: new Date(noShowStart.getTime() + 3600000).toISOString(),
    status: "no_show_retiree",
    is_paid: false,
    price: 0,
    seeker_need: "Help me set up a simple book.",
    seeker_goal: "Know which records to keep.",
    terms_accepted_at: noShowStart.toISOString(),
    created_at: noShowStart.toISOString(),
  });
  const lateStart = onTheHour(new Date(appNow.getTime() - 4 * 86400000));
  bookings.push({
    id: uuid("late"),
    seeker_id: pid("seek-sara"),
    retiree_id: pid("ret-latifa"),
    retiree_service_type_id: rst("ret-latifa", "edu-english"),
    starts_at: lateStart.toISOString(),
    ends_at: new Date(lateStart.getTime() + 3600000).toISOString(),
    status: "cancelled",
    is_paid: false,
    price: 0,
    seeker_need: "Conversation practice.",
    seeker_goal: "Feel more confident speaking.",
    terms_accepted_at: lateStart.toISOString(),
    cancelled_by: "seeker",
    cancelled_at: new Date(lateStart.getTime() - 60 * 60 * 1000).toISOString(),
    late_cancel: true,
    created_at: lateStart.toISOString(),
  });

  const saraSlot = slotAfter(appNow, 25);
  const omarSlot = slotAfter(appNow, 24 * 5);
  bookings.push({
    id: uuid("upcoming:sara"),
    seeker_id: pid("seek-sara"),
    retiree_id: pid("ret-latifa"),
    retiree_service_type_id: rst("ret-latifa", "edu-english"),
    starts_at: saraSlot.toISOString(),
    ends_at: new Date(saraSlot.getTime() + 3600000).toISOString(),
    status: "confirmed",
    is_paid: false,
    price: 0,
    seeker_need: "I want to practise spoken English before a work presentation.",
    seeker_goal: "A short plan for how to introduce my project.",
    terms_accepted_at: appNow.toISOString(),
    created_at: appNow.toISOString(),
  });
  bookings.push({
    id: uuid("upcoming:omar"),
    seeker_id: pid("seek-omar"),
    retiree_id: pid("ret-abdullah"),
    retiree_service_type_id: rst("ret-abdullah", "acc-small-biz"),
    starts_at: omarSlot.toISOString(),
    ends_at: new Date(omarSlot.getTime() + 3600000).toISOString(),
    status: "confirmed",
    is_paid: false,
    price: 0,
    seeker_need: "I need to understand the restaurant accounts.",
    seeker_goal: "Know what to ask my bookkeeper.",
    terms_accepted_at: appNow.toISOString(),
    created_at: appNow.toISOString(),
  });

  const reemDays = [
    { days: 1, hour: 9 },
    { days: 4, hour: 14 },
    { days: 8, hour: 11 },
  ];
  reemDays.forEach((plan, index) => {
    const day = addRiyadhDays(atRiyadh(riyadhParts(appNow).y, riyadhParts(appNow).m, riyadhParts(appNow).d, 12), plan.days);
    const parts = riyadhParts(day);
    const slot = atRiyadh(parts.y, parts.m, parts.d, plan.hour);
    bookings.push({
      id: uuid(`full:${index}`),
      seeker_id: pid("seek-reem"),
      retiree_id: pid("ret-nasser"),
      retiree_service_type_id: rst("ret-nasser", "acc-statements"),
      starts_at: slot.toISOString(),
      ends_at: new Date(slot.getTime() + 3600000).toISOString(),
      status: "confirmed",
      is_paid: false,
      price: 0,
      seeker_need: "A walkthrough of a simple statement.",
      seeker_goal: "Read the main lines with confidence.",
      terms_accepted_at: appNow.toISOString(),
      created_at: appNow.toISOString(),
    });
  });

  const releasedStart = onTheHour(new Date(appNow.getTime() - 5 * 86400000));
  const releasedId = uuid("paid:released");
  bookings.push({
    id: releasedId,
    seeker_id: pid("seek-omar"),
    retiree_id: pid("ret-abdullah"),
    retiree_service_type_id: rst("ret-abdullah", "acc-small-biz"),
    starts_at: releasedStart.toISOString(),
    ends_at: new Date(releasedStart.getTime() + 3600000).toISOString(),
    status: "completed",
    is_paid: true,
    price: 180,
    seeker_need: "VAT basics for a small restaurant.",
    seeker_goal: "Know which sales to record.",
    terms_accepted_at: releasedStart.toISOString(),
    completed_at: new Date(releasedStart.getTime() + 3600000).toISOString(),
    created_at: releasedStart.toISOString(),
  });
  const paidOutStart = onTheHour(new Date(appNow.getTime() - 40 * 86400000));
  const paidOutId = uuid("paid:out");
  bookings.push({
    id: paidOutId,
    seeker_id: pid("seek-sara"),
    retiree_id: pid("ret-abdullah"),
    retiree_service_type_id: rst("ret-abdullah", "acc-small-biz"),
    starts_at: paidOutStart.toISOString(),
    ends_at: new Date(paidOutStart.getTime() + 3600000).toISOString(),
    status: "completed",
    is_paid: true,
    price: 180,
    seeker_need: "How to read a monthly summary.",
    seeker_goal: "A checklist for the owner.",
    terms_accepted_at: paidOutStart.toISOString(),
    completed_at: new Date(paidOutStart.getTime() + 3600000).toISOString(),
    created_at: paidOutStart.toISOString(),
  });
  const refundedId = uuid("paid:refunded");
  const refundedStart = onTheHour(new Date(appNow.getTime() - 12 * 86400000));
  bookings.push({
    id: refundedId,
    seeker_id: pid("seek-james"),
    retiree_id: pid("ret-abdullah"),
    retiree_service_type_id: rst("ret-abdullah", "acc-small-biz"),
    starts_at: refundedStart.toISOString(),
    ends_at: new Date(refundedStart.getTime() + 3600000).toISOString(),
    status: "cancelled",
    is_paid: true,
    price: 180,
    seeker_need: "Arabic accounting terms.",
    seeker_goal: "A short glossary.",
    terms_accepted_at: refundedStart.toISOString(),
    cancelled_by: "retiree",
    cancelled_at: new Date(refundedStart.getTime() - 2 * 86400000).toISOString(),
    late_cancel: false,
    created_at: refundedStart.toISOString(),
  });
  const disputeStart = onTheHour(new Date(appNow.getTime() - 3 * 3600000));
  const disputeId = uuid("paid:dispute");
  bookings.push({
    id: disputeId,
    seeker_id: pid("seek-omar"),
    retiree_id: pid("ret-majed"),
    retiree_service_type_id: rst("ret-majed", "acc-bookkeeping"),
    starts_at: disputeStart.toISOString(),
    ends_at: new Date(disputeStart.getTime() + 3600000).toISOString(),
    status: "completed",
    is_paid: true,
    price: 150,
    seeker_need: "The session ended much earlier than planned.",
    seeker_goal: "A full hour on bookkeeping setup.",
    terms_accepted_at: disputeStart.toISOString(),
    completed_at: new Date(appNow.getTime() - 2 * 3600000).toISOString(),
    created_at: disputeStart.toISOString(),
  });

  const seen = new Set<string>();
  const uniqueBookings = bookings.filter((row) => {
    const key = `${row.retiree_id}:${row.starts_at}:${row.status}`;
    if ((row.status === "confirmed" || row.status === "pending_payment") && seen.has(`${row.retiree_id}:${row.starts_at}`)) return false;
    seen.add(`${row.retiree_id}:${row.starts_at}`);
    return key.length > 0;
  });
  const { error: bookingError } = await db.from("bookings").insert(
    uniqueBookings.map((row) => ({
      ...row,
      late_cancel: row.late_cancel ?? false,
      reminders_sent: row.reminders_sent ?? [],
    })),
  );
  if (bookingError) throw new Error(bookingError.message);
  const kept = new Set(uniqueBookings.map((row) => row.id));
  const { error: feedbackError } = await db.from("feedback").insert(feedback.filter((row) => kept.has(row.booking_id as string)));
  if (feedbackError) throw new Error(feedbackError.message);

  const payoutId = uuid("payout:abdullah");
  await db.from("payouts").insert({
    id: payoutId,
    retiree_id: pid("ret-abdullah"),
    period: prevKey,
    amount: 180,
    bank: "Al Rajhi Bank",
    iban_masked: "SA** **** **** **** **** 4821",
    paid_at: new Date(appNow.getTime() - 15 * 86400000).toISOString(),
  });
  await db.from("payments").insert([
    { id: uuid("pay:released"), booking_id: releasedId, amount: 180, method: "mada", psp_ref: "PSP-OPP-RELEASED", status: "released", held_at: releasedStart.toISOString(), release_due_at: new Date(appNow.getTime() - 2 * 86400000).toISOString(), released_at: new Date(appNow.getTime() - 1 * 86400000).toISOString(), created_at: releasedStart.toISOString() },
    { id: uuid("pay:out"), booking_id: paidOutId, amount: 180, method: "card", psp_ref: "PSP-OPP-PAIDOUT", status: "paid_out", held_at: paidOutStart.toISOString(), released_at: new Date(paidOutStart.getTime() + 3 * 86400000).toISOString(), paid_out_at: new Date(appNow.getTime() - 15 * 86400000).toISOString(), payout_id: payoutId, created_at: paidOutStart.toISOString() },
    { id: uuid("pay:refund"), booking_id: refundedId, amount: 180, method: "apple_pay", psp_ref: "PSP-OPP-REFUND", status: "refunded", held_at: refundedStart.toISOString(), refunded_at: refundedStart.toISOString(), refund_reason: "Retiree cancelled", created_at: refundedStart.toISOString() },
    { id: uuid("pay:dispute"), booking_id: disputeId, amount: 150, method: "mada", psp_ref: "PSP-OPP-DISPUTE", status: "held", held_at: disputeStart.toISOString(), release_due_at: new Date(appNow.getTime() + 46 * 3600000).toISOString(), created_at: disputeStart.toISOString() },
  ]);
  await db.from("reports").insert([
    { id: uuid("report:complaint"), booking_id: bookings[20].id, reporter_id: pid("seek-sara"), kind: "complaint", reason: "Unprofessional conduct", description: "The session did not stay on the topic I booked.", status: "open", created_at: new Date(appNow.getTime() - 8 * 86400000).toISOString() },
    { id: uuid("report:dispute"), booking_id: disputeId, reporter_id: pid("seek-omar"), kind: "dispute", reason: "Session ended early", description: "The call ended after about twenty minutes.", status: "open", due_by: addWorkingDays(appNow, 6).toISOString(), created_at: new Date(appNow.getTime() - 60 * 60 * 1000).toISOString() },
  ]);
  await db.from("ops_notes").insert({
    id: uuid("note:majed"),
    retiree_id: pid("ret-majed"),
    template_id: "LATE_CANCELLATIONS",
    body: "A cancellation close to the start time was recorded. If you cannot attend, cancel as early as you can.",
    sent_by: "op-noura",
    sent_at: new Date(appNow.getTime() - 3 * 86400000).toISOString(),
  });
  await db.from("audit_log").insert([
    { actor: "op-noura", action: "wave.sent", entity: "invitation_wave", entity_id: waveId, details: { name: "Wave 1 · Riyadh teachers" }, at: new Date(appNow.getTime() - 20 * 86400000).toISOString() },
    { actor: "op-noura", action: "retiree.paused", entity: "retiree_profile", entity_id: pid("ret-turki"), details: { reason: "Repeated missed sessions" }, at: liveAt },
    { actor: "system", action: "paid.history", entity: "app_settings", entity_id: "1", details: { note: "Historical paid sessions were created while the paid switch was on." }, at: new Date(appNow.getTime() - 40 * 86400000).toISOString() },
  ]);
  await db.from("notifications").insert([
    { id: randomUUID(), persona_id: "ret-mona", title: "You're invited to GOSI Opportunities", body: "Your application is saved as a draft.", link: "/phone/ret-mona/opportunities/retiree", created_at: new Date(appNow.getTime() - 18 * 86400000).toISOString() },
  ]);
  return { people: all.length, bookings: uniqueBookings.length, month: formatMonthKey(appNow) };
}

const direct = process.argv[1]?.includes("seed");
if (direct) {
  seedDemo()
    .then((result) => {
      console.log(result);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
