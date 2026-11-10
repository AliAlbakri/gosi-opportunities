import { expect, test } from "@playwright/test";

test("seeker and retiree can join the next session", async ({ browser }) => {
  const context = await browser.newContext({ permissions: ["camera", "microphone"] });
  const home = await context.newPage();
  home.on("dialog", (dialog) => dialog.accept());
  await home.goto("/");
  const reloaded = home.waitForEvent("load", { timeout: 180_000 });
  await home.getByRole("button", { name: "Reset demo data" }).click();
  await reloaded;
  const allow = await home.locator('iframe[title="Seeker phone"]').getAttribute("allow");
  expect(allow).toContain("camera");
  expect(allow).toContain("microphone");
  expect(allow).toContain("display-capture");
  expect(allow).toContain("fullscreen");

  const clock = await context.newPage();
  await clock.goto("/clock");
  const seekerHref = await clock.getByRole("link", { name: "Open in seeker phone" }).getAttribute("href");
  const retireeHref = await clock.getByRole("link", { name: "Open in retiree phone" }).getAttribute("href");
  expect(seekerHref).toBeTruthy();
  expect(retireeHref).toBeTruthy();

  const seeker = await context.newPage();
  const retiree = await context.newPage();
  await seeker.goto(seekerHref!);
  await retiree.goto(retireeHref!);
  await expect(seeker.getByRole("heading", { name: "Your session" })).toBeVisible();
  await expect(retiree.getByRole("heading", { name: "Your session" })).toBeVisible();
  await expect(seeker.getByText("Free · confirmed")).toHaveCount(0);
  await expect(retiree.getByText("Free · confirmed")).toHaveCount(0);
  await expect(seeker.locator("[data-live='1']")).toHaveCount(1);
  await expect(retiree.locator("[data-live='1']")).toHaveCount(1);

  await clock.getByRole("button", { name: "Jump to next booking" }).click();
  await expect(seeker.getByRole("link", { name: "Join now" })).toBeVisible({ timeout: 2000 });
  await expect(retiree.getByRole("link", { name: "Join now" })).toBeVisible({ timeout: 2000 });

  await seeker.getByRole("link", { name: "Join now" }).click();
  await seeker.getByRole("button", { name: "Join session" }).click();
  await expect(seeker.locator("iframe")).toBeVisible({ timeout: 45_000 });
  await expect(retiree.getByText(/is waiting/)).toBeVisible({ timeout: 45_000 });

  await retiree.getByRole("link", { name: "Join now" }).click();
  await retiree.getByRole("button", { name: "Join session" }).click();
  await expect(retiree.locator("iframe")).toBeVisible({ timeout: 45_000 });

  for (const [page, done] of [
    [seeker, "How was your session?"],
    [retiree, "Session complete"],
  ] as const) {
    await page.getByRole("button", { name: "Leave", exact: true }).first().click();
    await page.getByRole("button", { name: "Leave", exact: true }).last().click();
    await page.getByRole("link", { name: "I'm done" }).click();
    await expect(page.getByRole("heading", { name: done })).toBeVisible({ timeout: 20_000 });
  }
  await context.close();
});
