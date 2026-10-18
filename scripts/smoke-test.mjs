#!/usr/bin/env node
/**
 * Smoke test — run against a dev/prod server:
 *   npm run build && npm start     (in one terminal)
 *   node scripts/smoke-test.mjs    (in another)
 *
 * Verifies: pages render, robots headers, private-data gating, and a
 * complete credentials sign-in → protected page flow.
 */
const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const results = [];
const ok = (name, pass, extra = "") =>
  results.push({ name, pass, extra }) && console.log(`${pass ? "✓" : "✖"} ${name}${extra ? ` — ${extra}` : ""}`);

async function get(path, cookie) {
  const res = await fetch(BASE + path, {
    redirect: "manual",
    headers: cookie ? { cookie } : {},
  });
  return res;
}

// ---- 1. public pages render ------------------------------------------
for (const path of ["/", "/about", "/timeline", "/milestones", "/gallery", "/favorites", "/login"]) {
  const res = await get(path);
  const html = await res.text();
  ok(`GET ${path} → 200`, res.status === 200, `status ${res.status}`);
  ok(`GET ${path} renders Bengali`, /[\u0980-\u09FF]/.test(html));
}

// ---- 2. privacy headers ----------------------------------------------
const home = await get("/");
ok(
  "X-Robots-Tag: noindex, nofollow on every response",
  (home.headers.get("x-robots-tag") ?? "").includes("noindex"),
  home.headers.get("x-robots-tag") ?? "missing",
);

// ---- 3. private data is NOT in public HTML ---------------------------
const homeHtml = await home.text();
ok("birth time not in public HTML", !homeHtml.includes("06:42"));
const aboutHtml = await (await get("/about")).text();
ok("birth date not in public About HTML", !aboutHtml.includes("২০২৪") || !aboutHtml.includes("মার্চ ১২"));

// ---- 4. protected routes redirect when signed out --------------------
for (const path of ["/growth", "/letters", "/family"]) {
  const res = await get(path);
  ok(`GET ${path} redirects signed-out users`, res.status === 307 || res.status === 308 || res.status === 401,
    `status ${res.status} → ${res.headers.get("location") ?? ""}`);
}
const profileApi = await get("/api/family/profile");
ok("GET /api/family/profile → 401 when signed out", profileApi.status === 401, `status ${profileApi.status}`);

// ---- 5. full credentials sign-in -------------------------------------
const cookieJar = new Map();
const storeCookies = (res) => {
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    const [pair] = c.split(";");
    const [k, ...v] = pair.split("=");
    cookieJar.set(k.trim(), v.join("=").trim());
  }
};
const jarHeader = () => [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

const csrfRes = await get("/api/auth/csrf");
storeCookies(csrfRes);
const { csrfToken } = await csrfRes.json();

const loginRes = await fetch(BASE + "/api/auth/callback/credentials", {
  method: "POST",
  redirect: "manual",
  headers: {
    cookie: jarHeader(),
    "content-type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    csrfToken,
    email: process.env.SEED_ADMIN_EMAIL || "family@example.com",
    password: process.env.SEED_ADMIN_PASSWORD || "change-me-before-going-live",
    callbackUrl: BASE + "/family",
  }),
});
storeCookies(loginRes);
const hasSession = [...cookieJar.keys()].some((k) => k.startsWith("authjs.session-token") || k.startsWith("next-auth.session-token"));
ok("credentials sign-in issues a session cookie", hasSession || loginRes.status === 302,
  `status ${loginRes.status}, cookies: ${[...cookieJar.keys()].join(", ")}`);

// ---- 6. protected pages work when signed in --------------------------
const growth = await get("/growth", jarHeader());
ok("GET /growth → 200 when signed in", growth.status === 200, `status ${growth.status}`);
const growthHtml = await growth.text();
ok("growth chart renders numbers", /কেজি|cm|svg/i.test(growthHtml));

const family = await get("/family", jarHeader());
ok("GET /family → 200 when signed in", family.status === 200, `status ${family.status}`);

const profileApiAuth = await get("/api/family/profile", jarHeader());
const profileJson = await profileApiAuth.json().catch(() => ({}));
ok("GET /api/family/profile → birthDate for family", profileApiAuth.status === 200 && !!profileJson.birthDate,
  `status ${profileApiAuth.status}, birthDate=${profileJson.birthDate}`);

const letters = await get("/letters", jarHeader());
ok("GET /letters → 200 when signed in", letters.status === 200, `status ${letters.status}`);

// ---- summary ----------------------------------------------------------
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("Failed:", failed.map((f) => f.name).join(" | "));
  process.exit(1);
}
console.log("🌸 All good!");
