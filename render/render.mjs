// Kechki render: worker tekshirgan natijalarni sayt kodidagi A4 feedback sahifalariga aylantirib, o'quvchi topic'iga yuboradi.
import { chromium } from "playwright";
const W = "https://aok-checker.ozodbekadilov092.workers.dev", SITE = "https://aok-ai97.github.io/aok-english/checker/";
const RT = process.env.RT; if (!RT) { console.log("RT yo'q"); process.exit(0); }
const browser = await chromium.launch(); const t0 = Date.now(); let n = 0;
const pages = {};
async function pageFor(kind){ if (pages[kind]) return pages[kind]; const p = await browser.newPage({viewport: {width: 1100, height: 1400}, colorScheme: "light"});
  await p.goto(SITE + (kind === "writing" ? "writing.html" : "speaking.html") + "?v=" + Date.now(), {waitUntil: "networkidle"}); await p.waitForTimeout(5000); // sahifa o'zini bir marta yangilashi mumkin
  await p.waitForFunction(() => window.__AOK, null, {timeout: 30000}); return (pages[kind] = p); }
while (Date.now() - t0 < 20 * 60e3) {
  const rs0 = await fetch(`${W}/night/next?rt=${encodeURIComponent(RT)}`); if (rs0.status === 403) { console.log("❌ token mos emas"); process.exit(1); }
  const j = await rs0.json(); if (!j.id) break;
  const d = j.r; const p = await pageFor(d.kind);
  const out = await p.evaluate(async d => { const box = document.createElement("div"); box.style.cssText = "position:fixed;left:-20000px;top:0;width:900px"; document.body.appendChild(box);
    window.__AOK.showReport(box, d, null, ""); const pg = await window.__AOK.a4Pages(box, d); const b64 = [];
    for (const b of pg) { const u = new Uint8Array(await b.arrayBuffer()); let s = ""; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); b64.push(btoa(s)); }
    box.remove(); return {cap: window.__AOK.tgCaption(d), pages: b64}; }, d);
  const fd = new FormData(); fd.append("rt", RT); fd.append("sid", j.sid); fd.append("key", d.key); fd.append("nid", j.id); fd.append("caption", out.cap);
  out.pages.forEach((b, i) => fd.append("page", new Blob([Buffer.from(b, "base64")], {type: "image/png"}), `p${i}.png`));
  const r = await fetch(`${W}/send?rt=${encodeURIComponent(RT)}`, {method: "POST", body: fd}); console.log(j.id, r.status, (await r.text()).slice(0, 120)); n++;
  if (!r.ok) break;
}
await browser.close(); console.log("yuborildi:", n);
