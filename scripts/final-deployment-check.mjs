import { promises as fs } from "node:fs";

const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
const spoofedIp = `203.0.113.${Math.floor(Math.random() * 200) + 10}`;

if (!siteUrl) {
  console.error(JSON.stringify({
    ok: false,
    error: "NEXT_PUBLIC_SITE_URL is missing in .env.local"
  }, null, 2));
  process.exit(1);
}

if (!adminPassword) {
  console.error(JSON.stringify({
    ok: false,
    error: "ADMIN_PASSWORD is missing in .env.local"
  }, null, 2));
  process.exit(1);
}

const report = {
  ok: true,
  siteUrl,
  checkedAt: new Date().toISOString(),
  checks: [],
};

function addCheck(name, ok, details = {}) {
  report.checks.push({ name, ok, ...details });
  if (!ok) {
    report.ok = false;
  }
}

async function fetchText(path, init = {}) {
  const res = await fetch(`${siteUrl}${path}`, init);
  const text = await res.text();
  return { res, text };
}

async function fetchJson(path, init = {}) {
  const { res, text } = await fetchText(path, init);
  let json = null;

  try {
    json = JSON.parse(text);
  } catch {}

  return { res, text, json };
}

function includesAll(text, needles) {
  return needles.every((needle) => text.includes(needle));
}

(async () => {
  const health = await fetchJson("/api/health");
  addCheck(
    "health",
    health.res.status === 200 &&
      health.json?.ok === true &&
      health.json?.data?.siteUrlConfigured === true &&
      health.json?.data?.adminPasswordConfigured === true &&
      health.json?.data?.adminSecretConfigured === true &&
      health.json?.data?.kvConfigured === true,
    {
      status: health.res.status,
      body: health.json,
    }
  );

  const robots = await fetchText("/robots.txt");
  addCheck(
    "robots",
    robots.res.status === 200 &&
      includesAll(robots.text, [
        "Disallow: /admin",
        "Disallow: /api/",
        "Sitemap:",
      ]),
    {
      status: robots.res.status,
    }
  );

  const sitemap = await fetchText("/sitemap.xml");
  addCheck(
    "sitemap",
    sitemap.res.status === 200 &&
      includesAll(sitemap.text, [
        `${siteUrl}/`,
        `${siteUrl}/about`,
        `${siteUrl}/contact`,
        `${siteUrl}/links`,
        `${siteUrl}/poetry`,
        `${siteUrl}/prose`,
      ]),
    {
      status: sitemap.res.status,
    }
  );

  const home = await fetchText("/");
  addCheck(
    "home",
    home.res.status === 200 &&
      includesAll(home.text, [
        "Категории контента",
        "В центре внимания",
        "Популярное сейчас",
      ]),
    { status: home.res.status }
  );

  const about = await fetchText("/about");
  addCheck(
    "about",
    about.res.status === 200 &&
      includesAll(about.text, [
        "Фокус и направления",
        "Принципы работы",
      ]),
    { status: about.res.status }
  );

  const contact = await fetchText("/contact");
  addCheck(
    "contact",
    contact.res.status === 200 &&
      includesAll(contact.text, [
        "По вопросам сотрудничества",
        "Платформы и точки входа",
      ]),
    { status: contact.res.status }
  );

  const poetry = await fetchText("/poetry");
  addCheck(
    "poetry",
    poetry.res.status === 200 &&
      includesAll(poetry.text, ["Фильтр и поиск"]),
    { status: poetry.res.status }
  );

  const proseSearch = await fetchText(
    "/prose?q=%D0%B1%D1%83%D0%B4%D1%83%D1%89%D0%B5%D0%B5"
  );
  addCheck(
    "prose-search",
    proseSearch.res.status === 200 &&
      proseSearch.text.includes("Письмо из будущего"),
    { status: proseSearch.res.status }
  );

  const proseEmpty = await fetchText("/prose?q=zzzzzzzzzz");
  addCheck(
    "prose-empty-state",
    proseEmpty.res.status === 200 &&
      proseEmpty.text.includes("По запросу ничего не найдено"),
    { status: proseEmpty.res.status }
  );

  const poemItem = await fetchText("/poetry/poem-001");
  addCheck(
    "poetry-item-related",
    poemItem.res.status === 200 &&
      poemItem.text.includes("Похожие материалы"),
    { status: poemItem.res.status }
  );

  const searchQ = await fetchJson("/api/search?q=%D0%B1%D1%83%D0%B4%D1%83%D1%89%D0%B5%D0%B5");
  addCheck(
    "search-q",
    searchQ.res.status === 200 &&
      searchQ.json?.ok === true &&
      searchQ.json?.data?.query?.limit === 20 &&
      searchQ.json?.data?.totals?.matched >= 1,
    {
      status: searchQ.res.status,
      body: searchQ.json,
    }
  );

  const searchTag = await fetchJson("/api/search?tag=%D1%80%D0%B0%D1%81%D1%81%D0%B2%D0%B5%D1%82");
  addCheck(
    "search-tag",
    searchTag.res.status === 200 &&
      searchTag.json?.ok === true &&
      searchTag.json?.data?.query?.limit === 20 &&
      searchTag.json?.data?.totals?.matched >= 1,
    {
      status: searchTag.res.status,
      body: searchTag.json,
    }
  );

  const adminLoginPage = await fetchText("/admin/login");
  addCheck(
    "admin-login-page",
    adminLoginPage.res.status === 200 &&
      adminLoginPage.text.toLowerCase().includes("noindex"),
    { status: adminLoginPage.res.status }
  );

  const login = await fetchJson("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": spoofedIp,
    },
    body: JSON.stringify({ password: adminPassword }),
  });

  const setCookie = login.res.headers.get("set-cookie") || "";
  const cookieHeader = setCookie.split(";")[0];

  addCheck(
    "admin-login-api",
    login.res.status === 200 && login.json?.ok === true && Boolean(cookieHeader),
    {
      status: login.res.status,
      body: login.json,
    }
  );

  const authHeaders = cookieHeader ? { Cookie: cookieHeader } : {};

  const adminAnalyticsApi = await fetchJson("/api/admin/analytics", {
    headers: authHeaders,
  });
  addCheck(
    "admin-analytics-api",
    adminAnalyticsApi.res.status === 200 &&
      adminAnalyticsApi.json?.ok === true &&
      typeof adminAnalyticsApi.json?.data?.totals?.works === "number",
    {
      status: adminAnalyticsApi.res.status,
      body: adminAnalyticsApi.json,
    }
  );

  const adminWorks = await fetchText("/admin/works", {
    headers: authHeaders,
  });
  addCheck(
    "admin-works-page",
    adminWorks.res.status === 200 &&
      adminWorks.text.includes("Moderation filters"),
    { status: adminWorks.res.status }
  );

  const adminLinks = await fetchText("/admin/links", {
    headers: authHeaders,
  });
  addCheck(
    "admin-links-page",
    adminLinks.res.status === 200 &&
      adminLinks.text.includes("Управление ссылками"),
    { status: adminLinks.res.status }
  );

  const adminAnalyticsPage = await fetchText("/admin/analytics", {
    headers: authHeaders,
  });
  addCheck(
    "admin-analytics-page",
    adminAnalyticsPage.res.status === 200 &&
      adminAnalyticsPage.text.includes("Контентная аналитика"),
    { status: adminAnalyticsPage.res.status }
  );

  await fs.writeFile(
    "final-check-report.json",
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    process.exit(1);
  }
})().catch(async (error) => {
  const payload = {
    ok: false,
    siteUrl,
    checkedAt: new Date().toISOString(),
    fatal: error instanceof Error ? error.message : String(error),
  };

  try {
    await fs.writeFile(
      "final-check-report.json",
      JSON.stringify(payload, null, 2),
      "utf8"
    );
  } catch {}

  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
