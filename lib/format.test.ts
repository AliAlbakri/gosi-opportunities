import assert from "node:assert/strict";
import test from "node:test";
import { formatWhen } from "./format.ts";

test("starts_at renders in Asia/Riyadh exactly as stored", () => {
  const stored = "2026-11-11T06:00:00.000Z";
  assert.equal(formatWhen(stored), "Wed 11 Nov, 09:00");
  const shifted = new Date(new Date(stored).getTime() + 86_400_000).toISOString();
  assert.notEqual(formatWhen(stored), formatWhen(shifted));
});
