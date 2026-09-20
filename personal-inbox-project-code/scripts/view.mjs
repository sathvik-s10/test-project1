// Launches the Next.js dev server, opens it in a real (visible) browser via
// Playwright, walks through the public pages, and saves a screenshot of
// each one to ./screenshots. Run with: npm run view
//
// Note: /dashboard and /admin require a real Supabase project (see README)
// to actually sign in - without one they'll just redirect to /login, which
// this script accounts for.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");

function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status < 500) return resolve();
      } catch {
        // server not up yet
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Timed out waiting for ${url}`));
      }
      setTimeout(tick, 500);
    };
    tick();
  });
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  console.log("Starting dev server...");
  const server = spawn(
    "npx",
    ["next", "dev", "--port", String(PORT)],
    { stdio: "inherit", shell: true }
  );

  const stopServer = () => {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
    } else {
      server.kill("SIGTERM");
    }
  };

  try {
    await waitForServer(BASE_URL);

    const headless = process.env.HEADLESS === "true";
    const browser = await chromium.launch({ headless });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    const pages = [
      { path: "/", name: "01-home" },
      { path: "/login", name: "02-login" },
      { path: "/signup", name: "03-signup" },
      { path: "/dashboard", name: "04-dashboard-or-redirect" },
      { path: "/admin", name: "05-admin-or-redirect" },
      { path: "/verify-email", name: "06-verify-email" },
    ];

    for (const { path: route, name } of pages) {
      console.log(`Visiting ${route}...`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${name}.png`),
        fullPage: true,
      });
    }

    console.log(`\nDone. Screenshots saved to ${SCREENSHOT_DIR}`);

    if (headless) {
      await browser.close();
    } else {
      console.log("Leaving the browser open - close it manually when you're done looking.");
      // Keep the process alive so you can click around yourself.
      await new Promise(() => {});
    }
  } finally {
    stopServer();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
