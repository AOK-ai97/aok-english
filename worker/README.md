# AOK Checker — Cloudflare Worker

Saytdagi Writing va Speaking Checker shu Worker orqali Gemini AI ga ulanadi.
AI kaliti saytda emas, faqat Cloudflare ichida yashirin saqlanadi.

## O'rnatish (bir marta)
1. https://dash.cloudflare.com → bepul ro'yxatdan o'ting.
2. **Workers & Pages → Create → Create Worker** → nomi: `aok-checker` → **Deploy**.
3. **Edit code** → hamma kodni o'chirib, `worker.js` ichidagini qo'ying → **Deploy**.
4. **Settings → Variables and Secrets** → qo'shing:
   - `GEMINI_KEY` — **Secret** — Google AI Studio kaliti (https://aistudio.google.com/apikey)
   - `CLASS_CODE` — **Secret** — o'quvchilarga beriladigan sinf kodi
   - `ALLOWED_ORIGIN` — **Text** — `https://aok-ai97.github.io`
   - `TEACHER_CODE` — **Secret** — o'qituvchi paneli kodi
4b. **Storage & databases → Workers KV → Create** → nomi `aok-checker-data`. Keyin Worker → **Settings → Bindings → Add binding → KV namespace** → Variable name: `KV`, namespace: `aok-checker-data` → Deploy.
5. Worker manzilini (masalan `https://aok-checker.NOMINGIZ.workers.dev`) `assets/checker-config.js` ga yozing.

## Manzillar
- `POST /writing` — `{code, name, prompt, tasks:[{task:"1.1"|"1.2", text?, images:[{mime,data(base64)}]}]}`
- `POST /speaking` — `{code, name, part, question, audio(base64), mime}`
