import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const OUT = path.join(__dirname, "..", "screenshots");

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

/* ────────────────────── helpers ────────────────────── */

function shotPath(name: string, projectName: string) {
  const suffix = projectName === "Mobile" ? "-mobile" : "-desktop";
  return path.join(OUT, `${name}${suffix}.png`);
}

async function snap(page: any, name: string, projectName: string, opts?: { fullPage?: boolean }) {
  await page.screenshot({
    path: shotPath(name, projectName),
    fullPage: opts?.fullPage ?? false,
  });
}

/* ──────────── Landing page (no auth required) ──────────── */

test.describe("Landing Page", () => {
  test("hero section", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000); // let animations settle
    await snap(page, "landing-hero", testInfo.project.name);
  });

  test("features bento grid", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    // Scroll to the features section
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="features"]');
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
      } else {
        // fallback: scroll partway down
        window.scrollTo(0, 800);
      }
    });
    await page.waitForTimeout(500);
    await snap(page, "landing-features", testInfo.project.name);
  });

  test("pricing section", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="pricing"]');
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
    await page.waitForTimeout(500);
    await snap(page, "landing-pricing", testInfo.project.name);
  });

  test("full page", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await snap(page, "landing-full", testInfo.project.name, { fullPage: true });
  });
});

/* ──────────── Authenticated screens ──────────── */

test.describe("App Screens (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth and sign in with dev credentials
    await page.goto("/auth", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Fill email
    const emailInput = page.locator('input[placeholder="Email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill("yulionel829@gmail.com");
      
      // Fill password
      const passwordInput = page.locator('input[placeholder="Password"]');
      await passwordInput.fill("test123456");
      
      // Click sign in
      const signInButton = page.getByText("Sign In", { exact: true });
      await signInButton.click();
      
      // Wait for navigation to complete
      await page.waitForTimeout(3000);
    }
  });

  test("user home", async ({ page }, testInfo) => {
    await page.goto("/user", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await snap(page, "user-home", testInfo.project.name);
  });

  test("capture screen", async ({ page }, testInfo) => {
    await page.goto("/user/capture", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Type a sample thought into the text area
    const textInput = page.locator('textarea, [contenteditable="true"], input[placeholder*="thought"]').first();
    if (await textInput.isVisible()) {
      await textInput.fill(
        "Meeting notes: Discussed Q2 roadmap priorities. Need to follow up with design team about the new onboarding flow. Key decision — move to weekly sprints starting next month."
      );
      await page.waitForTimeout(500);
    }
    await snap(page, "capture", testInfo.project.name);
  });

  test("review screen", async ({ page }, testInfo) => {
    await page.goto("/user/review", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000); // let swipe cards load
    await snap(page, "review-cards", testInfo.project.name);
  });

  test("vault screen", async ({ page }, testInfo) => {
    await page.goto("/user/vault", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000); // let notes load
    await snap(page, "vault", testInfo.project.name);
  });
});
