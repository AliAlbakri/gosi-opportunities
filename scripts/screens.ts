// @ts-nocheck
import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { chromium } from "playwright";

function personId(national: string) {
  const h = createHash("sha1").update(`gosi:person:${national}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const base = process.env.SCREEN_BASE ?? "http://localhost:3000";
const shots: { name: string; path: string; tab?: string; detail?: boolean; clearTab?: boolean }[] = [
  { name: "home-fahad", path: "/phone/ret-fahad/home" },
  { name: "home-hassan", path: "/phone/ret-hassan/home" },
  { name: "home-mona", path: "/phone/ret-mona/home" },
  { name: "home-sara", path: "/phone/seek-sara/home" },
  { name: "about-hassan", path: "/phone/ret-hassan/opportunities/retiree/about" },
  { name: "apply-mona", path: "/phone/ret-mona/opportunities/retiree/apply" },
  { name: "status-saad", path: "/phone/ret-saad/opportunities/retiree/status" },
  { name: "dash-abdullah", path: "/phone/ret-abdullah/opportunities/retiree" },
  { name: "seeker-sara", path: "/phone/seek-sara/opportunities" },
  { name: "category-education", path: "/phone/seek-sara/opportunities/c/education" },
  { name: "profile-abdullah", path: `/phone/seek-sara/opportunities/p/${personId("1000004825")}` },
  { name: "ops-noura", path: "/ops/op-noura" },
  { name: "seeker-home", path: "/phone/seek-sara/opportunities" },
  { name: "seeker-category", path: "/phone/seek-sara/opportunities/c/education" },
  { name: "seeker-service", path: "/phone/seek-sara/opportunities/t/edu-english" },
  { name: "seeker-search", path: "/phone/seek-sara/opportunities/search" },
  { name: "seeker-results", path: "/phone/seek-sara/opportunities/results?category=education&sort=soonest" },
  { name: "seeker-bookings", path: "/phone/seek-sara/opportunities/bookings", clearTab: true },
  { name: "seeker-bookings-past", path: "/phone/seek-sara/opportunities/bookings", tab: "past" },
  { name: "seeker-booking-detail", path: "/phone/seek-sara/opportunities/bookings", detail: true, clearTab: true },
  { name: "seeker-bookings-empty", path: "/phone/seek-james/opportunities/bookings", clearTab: true },
];

async function main() {
  await mkdir("screenshots", { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultNavigationTimeout(180000);
  for (const shot of shots) {
    const response = await page.goto(`${base}${shot.path}`, { waitUntil: "load" });
    if (!response || response.status() >= 400) console.error(shot.name, response?.status());
    if (shot.clearTab) {
      await page.evaluate(() => sessionStorage.removeItem("gosi-bookings-tab"));
      await page.reload({ waitUntil: "load" });
    }
    if (shot.tab) {
      await page.evaluate((tab) => sessionStorage.setItem("gosi-bookings-tab", tab), shot.tab);
      await page.reload({ waitUntil: "load" });
    }
    if (shot.detail) {
      const href = await page.locator("a", { hasText: "Details" }).first().getAttribute("href");
      if (href) await page.goto(href.startsWith("http") ? href : `${base}${href}`, { waitUntil: "load" });
    }
    await page.waitForTimeout(500);
    const png = await page.screenshot({ fullPage: false });
    await writeFile(`screenshots/${shot.name}.png`, png);
    console.log(shot.name);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
