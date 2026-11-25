(() => {
  const B = window.BDAY, $ = (s) => document.querySelector(s), main = $("#main"), preview = new URLSearchParams(location.search).has("preview");
  const calm = matchMedia("(prefers-reduced-motion:reduce)").matches, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let i = 0, run = 0, pics = [];
  // crop a photo around the face; aspect = width / height, room = how much space around it
  const cache = {}, load = (k) => cache[k] ||= new Promise((ok, no) => { const m = new Image(); m.onload = () => ok(m); m.onerror = no; m.src = window.BDAY_PHOTOS ? BDAY_PHOTOS[k] : "/photo/" + k; });
  function crop(k, aspect, room, px) {
    const c = document.createElement("canvas"); c.width = px; c.height = Math.round(px / aspect); c.setAttribute("role", "img"); c.setAttribute("aria-label", "Photo " + (k + 1));
    const glow = (B.brighten || {})[pics[k]]; if (glow) c.style.filter = `brightness(${glow})`;
    load(k).then((m) => { const [fx, fy, fw] = (B.faces || {})[pics[k]] || [.5, .36, .6], W = m.naturalWidth, H = m.naturalHeight, w = Math.min(W, H * aspect, fw * W * room), h = w / aspect, x = Math.max(0, Math.min(W - w, fx * W - w / 2)), y = Math.max(0, Math.min(H - h, fy * H - h * .48)); c.getContext("2d").drawImage(m, x, y, w, h, 0, 0, c.width, c.height); }).catch(() => c.remove());
    return c;
  }
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const btn = (x, f, c = "btn") => { const b = el("button", c, x); b.onclick = f; return b; };
  const row = (...k) => { const r = el("div", "row"); r.append(...k); return r; };
  const scene = (...k) => { run++; i = 0; k.forEach((e) => { e.classList.add("in"); e.style.setProperty("--i", i++); }); main.replaceChildren(...k); scrollTo(0, 0); };
  const add = (...k) => k.forEach((e) => { e.classList.add("in"); main.append(e); e.scrollIntoView({ block: "nearest" }); });
  const svg = (h) => { const d = el("div"); d.innerHTML = h; return d.firstElementChild; };
  $("#brand").textContent = "♥ Made with love by " + B.from;
  // shared flower paint, balloons
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Flowers.defs()}</defs></svg>`);
  const HEART = "M0 24C-40-2-18-32 0-12C18-32 40-2 0 24Z";
  const F = (t, p, x, y, k, d = .4) => `<g transform="translate(${x} ${y}) scale(${k})"><g class="bloom" style="--d:${d}s">${Flowers.art(t, p)}</g></g>`;
  const duo = (art, ...k) => { const g = el("div", "duo"), a = el("div", "art"), t = el("div", "text"); a.append(art); k.forEach((e, j) => { e.classList.add("in"); e.style.setProperty("--i", j + 1); }); t.append(...k); g.append(a, t); return g; };
  function balloons(on) {
    document.querySelector(".balloons")?.remove(); if (!on) return;
    const d = el("div", "balloons"); d.setAttribute("aria-hidden", "true");
    d.innerHTML = [["3%", "#f0568f", 0, 1], ["13%", "#ffd5e3", -9, .75], ["84%", "#ff8fb5", -5, .85], ["93%", "#d81b60", -13, 1], ["75%", "#fff0f5", -17, .65]].map(([x, c, t, k]) => `<svg viewBox="-45 -40 90 190" style="left:${x};--t:${t}s;--k:${k}"><path d="M0 26Q14 70 0 100T4 148" fill="none" stroke="#c9175e" stroke-opacity=".5" stroke-width="1.5"/><path transform="scale(1.25)" d="${HEART}" fill="${c}"/><path d="M-22-18Q-24-6-16 2" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/><path d="M-5 36L0 28L5 36Z" fill="${c}"/></svg>`).join("");
    document.body.prepend(d);
  }

  // sky and confetti
  const cv = ["#sky", "#front"].map((s) => [$(s), $(s).getContext("2d")]); let W, H;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.forEach(([c, x]) => { c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); }); };
  addEventListener("resize", size); size();
  const petal = new Path2D("M0 10C-12 2-9-10 0-10C9-10 12 2 0 10Z"), fall = Array.from({ length: calm ? 0 : Math.min(36, W / 24) }, (_, k) => ({ x: Math.random() * W, y: Math.random() * H, v: .3 + Math.random() * .7, p: Math.random() * 7, s: .5 + Math.random() * .7, c: ["#ff6fa5", "#ffc2d8", "#fff0f5", "#d81b60", "#ff9d9d"][k % 5] }));
  let bits = [], last = performance.now();
  const COL = ["#f5b52e", "#ff6fa5", "#fff", "#d81b60", "#ffd766"];
  function pop(x, y, n = 40, p = 9) { if (!calm) for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, v = p * Math.random(); bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: a, s: 4 + Math.random() * 6, l: 1, c: COL[k % 5] }); } }
  const party = (n = 10) => { for (let k = 0; k < n; k++) setTimeout(() => pop(W * Math.random(), H * Math.random() * .5, 34), k * 260); };
  (function tick(now = last) {
    const k = Math.max(0, now - last) / 16.7, q = Math.min(k, 3); last = now; cv.forEach(([, x]) => x.clearRect(0, 0, W, H));
    const s = cv[0][1]; for (const a of fall) { a.y += a.v * q; a.p += .02 * q; a.x += Math.sin(a.p) * .5 * q; if (a.y > H + 20) { a.y = -20; a.x = Math.random() * W; } s.save(); s.globalAlpha = .75; s.translate(a.x, a.y); s.rotate(a.p); s.scale(a.s, a.s); s.fillStyle = a.c; s.fill(petal); s.restore(); }
    bits = bits.filter((b) => (b.l -= .01 * k) > 0); const f = cv[1][1];
    for (const b of bits) { b.vy += .14 * q; b.vx *= .985; b.x += b.vx * q; b.y += b.vy * q; b.r += .1 * q; f.save(); f.globalAlpha = Math.min(1, b.l * 2); f.translate(b.x, b.y); f.rotate(b.r); f.fillStyle = b.c; f.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); f.restore(); }
    requestAnimationFrame(tick);
  })();

  // "Happy Birthday" on a music box
  let ac;
  function song() {
    try {
      ac = ac || new (window.AudioContext || webkitAudioContext)(); ac.resume(); let t = ac.currentTime + .2; const b = .42;
      [[67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2], [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2], [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1.6], [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 2.4]].forEach(([m, d]) => {
        [[12, .16, 1], [0, .08, 1], [24, .04, .6]].forEach(([o, g, l]) => { const n = ac.createOscillator(), v = ac.createGain(); n.frequency.value = 440 * 2 ** ((m + o - 69) / 12); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + .01); v.gain.exponentialRampToValueAtTime(.0005, t + 1.5 * l); n.connect(v).connect(ac.destination); n.start(t); n.stop(t + 1.6); }); t += d * b;
      });
    } catch {}
  }

  const start = new Date(B.date + "T00:00:00");
  function lock() {
    const c = el("div", "count"), n = ["days", "hours", "minutes", "seconds"].map((x) => { const d = el("div"), b = el("b"); d.append(b, x); c.append(d); return b; });
    c.setAttribute("aria-live", "off"); balloons(true); scene(posy("gate-rose"), el("h1", "", "Something is waiting for you"), c, el("p", "hand", "No peeking until your birthday, " + B.name + "."));
    const upd = () => { const s = Math.ceil((start - Date.now()) / 1000); if (s <= 0) { clearInterval(t); return gate(); } [s / 86400, s / 3600 % 24, s / 60 % 60, s % 60].forEach((v, k) => n[k].textContent = Math.floor(v)); };
    const t = setInterval(upd, 1000); upd();
  }
  function posy(c) {
    const around = [["daisy", "white", .78], ["ranunculus", "coral", .72], ["rose", "red", .72], ["daisy", "white", .72], ["peony", "blush", .74], ["ranunculus", "cream", .74], ["rose", "red", .7], ["lily", "cream", .74]];
    const at = (k, n, r) => [Math.cos(k / n * 6.283 - 1.2) * r, Math.sin(k / n * 6.283 - 1.2) * r];
    return svg(`<svg class="${c}" viewBox="-190 -190 380 380" aria-hidden="true">${Array.from({ length: 12 }, (_, k) => Flowers.leaf(0, 0, k * 30 + 12, 1.55 + (k % 2) * .12, .9 + k * .04, k % 2 ? "#79ac78" : "#4f8a5b")).join("")}${around.map(([t, p, z], k) => F(t, p, ...at(k, 8, 106), z, .45 + k * .09)).join("")}${F("rose", "hot", 0, 0, 1.5, .1)}</svg>`);
  }
  function gate() {
    balloons(true); const b = el("button", "gate"); b.append(el("p", "to", "For " + B.name), posy("gate-rose beat"), el("h1", "", "Tap here, birthday girl"));
    b.onclick = async () => { b.onclick = null; song(); pop(W / 2, H / 2, 130, 14); b.classList.add("open"); await sleep(calm ? 0 : 900); cake(); };
    scene(b);
  }

  function cake() {
    const n = Math.max(1, Math.min(30, B.candles | 0)), gap = Math.min(25, 165 / n); let c = "";
    for (let k = 0; k < n; k++) { const u = k - (n - 1) / 2, x = 300 + u * gap, y = 150 + (k % 2 ? 6 : -4); c += `<g class="candle" transform="translate(${x} ${y})"><rect x="-12" y="-58" width="24" height="100" fill="transparent"/><circle class="halo" cy="-24" r="32" fill="url(#glow)"/><rect x="-4.5" y="-6" width="9" height="42" rx="3" fill="${["#d81b60", "#fff", "#ffd766"][k % 3]}"/><path d="M-4.500 8L4.500 16M-4.500 22L4.500 30" stroke="#ff9dc1" stroke-width="3"/><path d="M0-6V-12" stroke="#5c0c35" stroke-width="2"/><path class="flame" d="M0-44C11-28 9-11 0-11C-9-11-11-28 0-44Z" fill="#ff9f2e"/><path class="flame" d="M0-31C5-23 5-13 0-13C-5-13-5-23 0-31Z" fill="#fff6cf"/></g>`; }
    const tier = (x, y, w, h, side, ice, k) => { const m = k, q = w / m; let d = `M${x} ${y}Q${x + w / 2} ${y + 34} ${x + w} ${y}`; for (let a = m; a > 0; a--) { const mx = (a - 1) / m, sag = 34 * 2 * mx * (1 - mx); d += `${a === m ? `V${y + 24}` : ""}A${q / 2} 15 0 0 1 ${x + (a - 1) * q} ${y + 24 + sag}`; } let pearls = ""; const pn = Math.round(w / 17); for (let a = 0; a <= pn; a++) { const u = a / pn; pearls += `<circle cx="${x + u * w}" cy="${y + h + 34 * 2 * u * (1 - u)}" r="6.500" fill="#fff" stroke="#f7a8c5" stroke-width="1"/>`; }
      return `<path d="M${x} ${y}V${y + h}Q${x + w / 2} ${y + h + 34} ${x + w} ${y + h}V${y}Z" fill="url(#${side})"/><ellipse cx="${x + w / 2}" cy="${y}" rx="${w / 2}" ry="17" fill="${ice}"/><path d="${d}Z" fill="${ice}"/><path d="M${x} ${y}Q${x + w / 2} ${y + 34} ${x + w} ${y}" fill="${ice}"/>${pearls}`; };
    const side = (id, a, b) => `<linearGradient id="${id}"><stop stop-color="${b}"/><stop offset=".35" stop-color="${a}"/><stop offset=".6" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    const lf = (x, y, r, k, d) => Flowers.leaf(x, y, r, k, d, r % 4 ? "#79ac78" : "#4f8a5b");
    const garden = [lf(392, 215, 70, .5, .5), lf(372, 222, 150, .45, .5), lf(448, 330, 64, .55, .7), lf(415, 330, 190, .45, .7), lf(508, 470, 60, .55, .9), lf(470, 480, 200, .5, .9), lf(95, 560, -62, .6, 1), lf(120, 560, -10, .45, 1), lf(228, 312, -70, .4, .9),
      F("rose", "hot", 384, 208, .42, .5), F("ranunculus", "cream", 352, 226, .36, .6), F("daisy", "white", 402, 246, .34, .7),
      F("peony", "red", 430, 300, .5, .7), F("rose", "cream", 408, 346, .42, .8), F("ranunculus", "coral", 456, 344, .42, .9), F("daisy", "white", 436, 378, .34, 1),
      F("rose", "red", 494, 448, .46, .9), F("peony", "blush", 466, 490, .52, 1), F("lily", "cream", 516, 496, .46, 1.1), F("ranunculus", "hot", 488, 540, .5, 1.2), F("daisy", "white", 440, 548, .4, 1.3), F("rose", "coral", 534, 552, .44, 1.3),
      F("peony", "hot", 96, 552, .5, 1.1), F("rose", "cream", 142, 570, .42, 1.2), F("daisy", "white", 66, 578, .38, 1.3), F("daisy", "white", 176, 306, .32, 1), F("ranunculus", "coral", 154, 322, .34, 1.1)].join("").replace(/scale\((0?\.[345]\d?)\)/g, (m, v) => `scale(${(v * 1.14).toFixed(3)})`);
    const s = svg(`<svg class="cake" viewBox="0 70 600 620" role="img" aria-label="A birthday cake covered in flowers"><defs><radialGradient id="glow"><stop stop-color="#fff0b8" stop-opacity=".95"/><stop offset="1" stop-color="#ffe08f" stop-opacity="0"/></radialGradient>${side("t1", "#ffe3ee", "#ffb3cf")}${side("t2", "#ffa9c8", "#f0568f")}${side("t3", "#fff6fa", "#ffcadd")}${side("gold", "#ffeeb5", "#d99a35")}</defs>
      <ellipse cx="300" cy="676" rx="170" ry="13" fill="#a80f4c" opacity=".16"/><path d="M262 600Q290 640 220 672H380Q310 640 338 600Z" fill="url(#gold)"/><ellipse cx="300" cy="592" rx="268" ry="30" fill="url(#gold)"/><ellipse cx="300" cy="584" rx="256" ry="26" fill="#fff6fa"/>
      ${tier(86, 428, 428, 142, "t3", "#ffa9c8", 11)}${tier(146, 300, 308, 126, "t2", "#fff6fa", 9)}${tier(206, 184, 188, 116, "t1", "#f0568f", 6)}
      <text x="272" y="545" text-anchor="middle" font-family="Yeseva One" font-size="31" fill="#c9175e" ${B.name.length > 15 ? 'textLength="300" lengthAdjust="spacingAndGlyphs"' : ""} id="cname"></text>${garden}${c}</svg>`);
    s.querySelector("#cname").textContent = B.name;
    const msg = el("p", "hand", "Close your eyes, make a wish, then blow out the candles."), cs = [...s.querySelectorAll(".candle")]; let stop = () => {}, done = false;
    const out = (g) => { if (done || g.classList.contains("out")) return; g.classList.add("out"); if (cs.every((x) => x.classList.contains("out"))) finish(); };
    const puff = () => { const g = cs.find((x) => !x.classList.contains("out")); if (g) out(g); };
    cs.forEach((g) => g.onclick = () => out(g));
    const mic = btn("Blow with my breath", async () => {
      mic.disabled = true;
      try {
        const st = await navigator.mediaDevices.getUserMedia({ audio: { noiseSuppression: false, echoCancellation: false, autoGainControl: false } });
        stop = () => st.getTracks().forEach((t) => t.stop()); if (done || !mic.isConnected) return stop();
        ac = ac || new AudioContext(); await ac.resume(); const an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(st).connect(an); const d = new Uint8Array(1024); msg.textContent = "Blow towards the screen…";
        const t = setInterval(() => { if (done || !s.isConnected) { clearInterval(t); return stop(); } an.getByteTimeDomainData(d); let e = 0; for (const v of d) e += ((v - 128) / 128) ** 2; if (Math.sqrt(e / 1024) > .13) puff(); }, 130);
      } catch { msg.textContent = "No microphone? Tap each candle instead."; mic.disabled = false; }
    }), all = btn("Blow them all out", async () => { all.disabled = true; while (!done) { puff(); await sleep(180); } }, "btn soft"), r = row(mic, all);
    balloons(false); const D = duo(s, el("p", "to", "For " + B.name), el("h1", "", "Happy birthday"), msg, r), side2 = D.lastChild; scene(D);
    async function finish() { done = true; stop(); r.remove(); document.body.classList.add("dark"); msg.textContent = "Wish made…"; await sleep(1500); document.body.classList.remove("dark"); party(9); msg.textContent = "I hope it comes true. Mine already did: it's you."; side2.append(btn("One number for you", since)); side2.lastChild.scrollIntoView({ block: "nearest" }); }
  }

  const met = new Date(B.metOn + "T00:00:00");
  function since() {
    const big = el("h1", "bigday"), tick = el("p", "to"), now = new Date(), days = () => Math.floor((Date.now() - met) / 864e5);
    let nth = 0; for (let y = met.getFullYear(); y <= Math.max(now.getFullYear(), start.getFullYear()); y++) { const d = new Date(start); d.setFullYear(y); if (d > met && d <= Math.max(now, start)) nth++; }
    const ord = nth + (["th", "st", "nd", "rd"][nth % 10 < 4 && (nth % 100 < 11 || nth % 100 > 13) ? nth % 10 : 0]), d = days(), facts = el("div", "facts");
    [[Math.floor(d / 7).toLocaleString(), "weeks of you"], [Math.floor((d + met.getDay()) / 7).toLocaleString(), "Sundays"], [ord, "birthday since we met"]].forEach(([n, t]) => { const f = el("div"); f.append(el("b", "", n), el("span", "", t)); facts.append(f); });
    const heart = svg(`<svg class="gate-rose beat" viewBox="-190 -180 380 360" aria-hidden="true">${Array.from({ length: 24 }, (_, k) => { const t = k / 24 * 6.283, x = 16 * Math.sin(t) ** 3 * 9.5, y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 9.5; return F(["rose", "daisy", "peony", "ranunculus"][k % 4], ["hot", "white", "blush", "coral"][k % 4], x, y, .48, k * .07); }).join("")}${F("rose", "red", 0, -8, 1, 1.7)}</svg>`);
    scene(duo(heart, el("p", "to", `Since ${met.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}, the day we met`), big, tick, facts, row(btn(pics.length || preview ? "Hang up the memories" : "I have a surprise", pics.length || preview ? gallery : popGame))));
    const id = run, upd = () => { if (id !== run) return clearInterval(t); const x = Date.now() - met; big.textContent = days().toLocaleString() + " days"; tick.textContent = `${Math.floor(x / 36e5) % 24} hours, ${Math.floor(x / 6e4) % 60} minutes, ${Math.floor(x / 1e3) % 60} seconds. Still counting.`; }, t = setInterval(upd, 1000); tick.setAttribute("aria-live", "off"); upd();
  }

  function popGame() {
    const box = el("div", "pops"), W2 = [...B.balloonWords], msg = el("p", "hand", "Pop every balloon. They're hiding something."), id = run + 1; let left = W2.length;
    W2.forEach((ch, k) => {
      const b = el("button", "pop"); b.setAttribute("aria-label", "Pop balloon " + (k + 1)); b.style.setProperty("--k", k % 4);
      b.append(svg(`<svg viewBox="-45 -40 90 135" aria-hidden="true"><path d="M0 28Q10 55 0 90" fill="none" stroke="#c9175e" stroke-opacity=".5" stroke-width="1.5"/><path transform="scale(1.25)" d="${HEART}" fill="${["#f0568f", "#ff8fb5", "#d81b60", "#fff6fa"][k % 4]}"/><path d="M-22-18Q-24-6-16 2" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/></svg>`));
      b.onclick = () => { b.onclick = null; const q = b.getBoundingClientRect(); pop(q.left + q.width / 2, q.top + q.height / 3, 34, 8); b.classList.add("done"); b.setAttribute("aria-label", ch); b.replaceChildren(el("span", "", ch)); if (!--left) setTimeout(() => { if (id !== run) return; party(8); msg.textContent = "Hidden in every balloon. Hidden in everything I do."; next.hidden = false; next.scrollIntoView({ block: "nearest" }); }, 500); };
      box.append(b);
    });
    const next = btn("Tell me why", jar); next.hidden = true; scene(el("h1", "", "Pop, pop, pop"), msg, box, next);
  }

  function jar() {
    let k = 0; const total = B.reasons.length, b = el("button", "jarbtn"), p = el("p", "hand reason", "Tap the jar. I filled it with reasons."), c = el("p", "", "");
    b.setAttribute("aria-label", "Take a reason from the jar");
    const spots = Array.from({ length: total }, (_, j) => [72 + (j * 53) % 160, 300 - Math.floor(j / 4) * 52 - (j % 2) * 14, (j * 37) % 50 - 25]);
    b.append(svg(`<svg class="gift" viewBox="0 0 300 370" aria-hidden="true"><ellipse cx="150" cy="350" rx="110" ry="10" fill="#a80f4c" opacity=".16"/><path d="M60 80Q30 110 34 160V310Q36 345 70 346H230Q264 345 266 310V160Q270 110 240 80Z" fill="#fff" opacity=".55"/>${spots.map(([x, y, a], j) => `<path class="jh" transform="translate(${x} ${y}) rotate(${a}) scale(1.15)" d="${HEART}" fill="${["#d81b60", "#ff8fb5", "#f0568f", "#ffb3cf"][j % 4]}"/>`).join("")}<path d="M60 80Q30 110 34 160V310Q36 345 70 346H230Q264 345 266 310V160Q270 110 240 80Z" fill="none" stroke="#fff" stroke-width="5"/><path d="M58 150Q52 200 56 280" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity=".8"/><rect x="52" y="44" width="196" height="40" rx="10" fill="#f0568f"/><rect x="52" y="76" width="196" height="12" rx="6" fill="#d81b60"/>${F("rose", "red", 150, 82, .5)}${F("daisy", "white", 112, 84, .38)}${F("ranunculus", "coral", 188, 84, .4)}</svg>`));
    const next = btn("Open your gift", gift); next.hidden = true;
    b.onclick = () => { if (k >= total) return; const hs = b.querySelectorAll(".jh"); hs[total - 1 - k].style.opacity = 0; const q = b.getBoundingClientRect(); pop(q.left + q.width / 2, q.top + 60, 14, 6); p.textContent = B.reasons[k++]; p.classList.remove("in"); void p.offsetWidth; p.style.setProperty("--i", 0); p.classList.add("in"); c.textContent = k < total ? `${k} of ${total}` : "The jar's empty. I could fill a hundred more."; if (k >= 3) next.hidden = false; };
    scene(duo(b, el("h1", "", "Why I love you"), p, c, row(next)));
  }

  function coupons() {
    const g = el("div", "coupons");
    B.coupons.forEach((t, k) => {
      const d = el("div", "coupon"), cover = document.createElement("canvas"), x = cover.getContext("2d"); cover.width = 300; cover.height = 170; cover.tabIndex = 0; cover.setAttribute("role", "button"); cover.setAttribute("aria-label", "Scratch coupon " + (k + 1));
      const gr = x.createLinearGradient(0, 0, 300, 170); gr.addColorStop(0, "#ff8fb5"); gr.addColorStop(.5, "#f0568f"); gr.addColorStop(1, "#d81b60"); x.fillStyle = gr; x.fillRect(0, 0, 300, 170); x.fillStyle = "#fff"; x.font = "26px 'Yeseva One',serif"; x.textAlign = "center"; x.fillText("Scratch me", 150, 94); x.globalCompositeOperation = "destination-out"; x.lineWidth = 46; x.lineCap = "round";
      let len = 0, lastP = null, open = false; const at = (e) => { const q = cover.getBoundingClientRect(); return [(e.clientX - q.left) / q.width * 300, (e.clientY - q.top) / q.height * 170]; };
      const reveal = () => { if (open) return; open = true; cover.style.opacity = 0; setTimeout(() => cover.remove(), 450); const q = d.getBoundingClientRect(); pop(q.left + q.width / 2, q.top + q.height / 2, 24, 7); };
      cover.onpointerdown = (e) => { lastP = at(e); try { cover.setPointerCapture(e.pointerId); } catch {} };
      cover.onpointermove = (e) => { if (!lastP) return; const n = at(e); x.beginPath(); x.moveTo(...lastP); x.lineTo(...n); x.stroke(); len += Math.hypot(n[0] - lastP[0], n[1] - lastP[1]); lastP = n; if (len > 650) reveal(); };
      cover.onpointerup = cover.onpointercancel = () => { lastP = null; };
      cover.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); } };
      d.append(el("small", "", "Good for"), el("b", "", t), el("small", "", "Never expires. Signed, " + B.from), cover); g.append(d);
    });
    scene(el("h1", "", "Love coupons"), el("p", "hand", "Scratch them. Take a screenshot. I have to say yes."), g, btn("Send a wish to the sky", wish));
  }

  function gallery() {
    const g = el("div", "gallery"), per = innerWidth < 700 ? 2 : 4;
    for (let k = 0; k < pics.length; k += per) {
      const l = el("div", "line"); let h = ""; for (let b = 0; b < 13; b++) { const x = b * 100 / 12; h += `<circle cx="${x}" cy="${4 + 100 * (x / 100) * (1 - x / 100) * 1.4}" r="1" vector-effect="non-scaling-stroke" stroke="${["#ffd766", "#f0568f", "#fff"][b % 3]}" stroke-width="13" stroke-linecap="round"/>`; }
      l.append(svg(`<svg class="wire" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4Q50 74 100 4" fill="none" stroke="#4f8a5b" stroke-width="3" vector-effect="non-scaling-stroke"/>${h.replace(/<circle cx="([^"]+)" cy="([^"]+)" r="1"/g, '<path d="M$1 $2h.01"')}</svg>`));
      ["left", "right"].forEach((z, j) => { const o = svg(`<svg class="posy ${z}" viewBox="-75 -70 150 140" aria-hidden="true">${[-80, 80, 160, 30].map((r) => Flowers.leaf(0, 0, r, .6, .3, "#6aa06c")).join("")}${F("rose", j ? "red" : "hot", -18, -6, .62)}${F("ranunculus", j ? "cream" : "coral", 24, 12, .56, .6)}${F("daisy", "white", 12, -28, .46, .8)}</svg>`); l.append(o); });
      pics.slice(k, k + per).forEach((name, j) => {
        const p = el("button", "pol"), w = el("span"), a = el("span", "face"), im = crop(k + j, .96, 2.7, 560), b = el("span", "face back", B.captions[name] || B.spareCaptions[(k + j) % B.spareCaptions.length]);
        p.style.setProperty("--r", ((k + j) * 37 % 7 - 3) + "deg"); a.append(im); w.append(a, b); p.append(w, svg(`<svg class="clip" viewBox="-60 -60 120 120" aria-hidden="true">${Flowers.art(["daisy", "rose", "ranunculus"][(k + j) % 3], ["white", "hot", "coral"][(k + j) % 3])}</svg>`));
        p.onclick = () => { p.classList.toggle("flip"); const q = p.getBoundingClientRect(); pop(q.left + q.width / 2, q.top + q.height / 2, 12, 5); }; l.append(p);
      });
      g.append(l);
    }
    if (!pics.length) g.append(el("p", "tip", "Her photos will hang here. Put them in the birthday/photos folder and refresh. (Only you see this, in preview.)"));
    scene(el("h2", "", "My favourite person, in bloom"), el("p", "hand", "Tap a photo. I wrote something behind each one."), g, btn("I have a surprise", popGame));
  }

  function gift() {
    const b = el("button", "giftbtn"); b.setAttribute("aria-label", "Open your gift");
    b.append(svg(`<svg class="gift" viewBox="0 -20 400 420"><defs><linearGradient id="bx"><stop stop-color="#f0568f"/><stop offset=".5" stop-color="#ffa9c8"/><stop offset="1" stop-color="#f0568f"/></linearGradient><linearGradient id="rb"><stop stop-color="#fff6fa"/><stop offset="1" stop-color="#ffd5e3"/></linearGradient></defs><ellipse cx="200" cy="388" rx="165" ry="13" fill="#a80f4c" opacity=".18"/><rect x="50" y="170" width="300" height="215" rx="12" fill="url(#bx)"/>${Array.from({ length: 14 }, (_, k) => `<path transform="translate(${80 + (k % 5) * 60 + (k / 5 | 0) % 2 * 28} ${222 + (k / 5 | 0) * 58}) scale(.32)" d="${HEART}" fill="#fff" opacity=".45"/>`).join("")}<rect x="172" y="170" width="56" height="215" fill="url(#rb)"/><g id="lid"><path d="M200 112C150 20 62 42 88 98C102 126 160 124 200 112ZM200 112C250 20 338 42 312 98C298 126 240 124 200 112Z" fill="url(#rb)" stroke="#f7a8c5" stroke-width="3"/><rect x="32" y="112" width="336" height="66" rx="11" fill="#e83e7e"/><rect x="168" y="112" width="64" height="66" fill="url(#rb)"/>${Flowers.leaf(200, 104, -100, .6, .3, "#4f8a5b")}${Flowers.leaf(200, 104, 100, .6, .3, "#79ac78")}${F("ranunculus", "coral", 158, 112, .5, .6)}${F("daisy", "white", 242, 112, .52, .7)}${F("rose", "red", 200, 98, .72)}</g></svg>`));
    b.onclick = async () => {
      b.onclick = null; b.classList.add("opened"); pop(W / 2, H / 2, 130, 14); await sleep(calm ? 0 : 1200);
      const l = el("article", "letter"); B.letter.forEach((x) => l.append(el("p", "", x))); l.append(el("p", "", "Yours, " + B.from));
      const d = el("div"); d.innerHTML = Flowers.bouquet(); const g = duo(d.firstChild, l, row(btn("There are coupons too", coupons))); g.classList.add("withletter"); scene(g);
    };
    scene(duo(b, el("p", "to", "One more thing"), el("h1", "", "Your gift is waiting"), el("p", "hand", "Tap the box to unwrap it.")));
  }

  const lantern = (c) => svg(`<svg class="${c}" viewBox="-30 -30 230 260" aria-hidden="true"><defs><radialGradient id="lg" cy=".85"><stop stop-color="#fff6cf"/><stop offset=".45" stop-color="#ffc08a"/><stop offset="1" stop-color="#f0568f"/></radialGradient><radialGradient id="lh"><stop stop-color="#fff0b8" stop-opacity=".9"/><stop offset="1" stop-color="#fff0b8" stop-opacity="0"/></radialGradient></defs><circle cx="85" cy="110" r="125" fill="url(#lh)"/><path d="M30 20Q85-12 140 20L152 170Q85 200 18 170Z" fill="url(#lg)"/><path d="M60 8L56 182M110 8L114 182" stroke="#fff" stroke-opacity=".45" stroke-width="2"/><ellipse cx="85" cy="176" rx="50" ry="10" fill="#fff6cf"/><path transform="translate(85 95) scale(1.3)" d="${HEART}" fill="#c9175e" opacity=".75"/>${F("rose", "red", 85, 186, .36)}${F("daisy", "white", 48, 182, .3, .6)}${F("ranunculus", "coral", 122, 182, .3, .7)}</svg>`);
  function wish() {
    const inp = el("input"); inp.maxLength = 60; inp.placeholder = "I wish…"; inp.setAttribute("aria-label", "Your wish");
    const art = lantern("bob"), note = el("p", "hand", `Keep it between you and the sky, or let ${B.from} help make it come true.`);
    const fly = async (share) => {
      const w = inp.value.trim(), id = run;
      if (!w) { inp.placeholder = "Whisper something first"; return inp.focus(); }
      go.disabled = tell.disabled = inp.disabled = true;
      if (share && window.BDAY_PICS) { open("https://wa.me/?text=" + encodeURIComponent(`My birthday wish for ${B.from} ♥\n\n${w}`), "_blank", "noopener"); note.textContent = `Choose ${B.from} in WhatsApp and press send.`; }
      else if (share) {
        try { const r = await fetch("/wish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wish: w }) }); if (!r.ok) throw 0; note.textContent = `${B.from} will know. Consider it half granted.`; }
        catch { go.disabled = tell.disabled = inp.disabled = false; note.textContent = "That didn't send. Try again, or just let it fly."; return; }
      } else note.textContent = "Your secret is safe with the sky.";
      inp.value = ""; art.classList.add("fly"); await sleep(calm ? 1200 : 4600); if (id === run) finale();
    };
    const go = btn("Let it fly", () => fly(false)), tell = btn(`Let it fly, and tell ${B.from}`, () => fly(true), "btn soft");
    inp.onkeydown = (e) => { if (e.key === "Enter") fly(false); };
    scene(duo(art, el("h1", "", "Put a wish in a lantern"), note, inp, row(go, tell)));
  }

  function finale() {
    const h = el("div", "heart"), n = 12, real = pics.length;
    const pts = Array.from({ length: 721 }, (_, j) => { const t = j / 720 * 2 * Math.PI; return [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)]; });
    const len = [0]; for (let j = 1; j < pts.length; j++) len.push(len[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
    const FL = [["rose", "red"], ["peony", "blush"], ["daisy", "white"], ["ranunculus", "coral"], ["rose", "hot"], ["lily", "cream"]]; let at = 0;
    for (let k = 0; k < n * 2; k++) {
      const [x, y] = pts[len.findIndex((v) => v >= k / (n * 2) * len[720])], photo = real && k % 2 === 0, f = FL[k % 6], e = photo ? crop(at++ % real, 1, 1.75, 260) : svg(`<svg viewBox="-64 -64 128 128" aria-hidden="true">${Flowers.art(...f)}</svg>`);
      
      e.style.cssText = `left:${50 + x * 2.55}%;top:${46 - y * 2.75}%;--k:${k / 2}`; h.append(e);
    }
    h.append(el("h2", "", "I love you")); song(); party(16); balloons(true);
    scene(duo(h, el("p", "to", "Once more, with all my heart,"), el("h1", "", "Happy birthday, " + B.name), el("p", "hand", `${Math.floor((Date.now() - met) / 864e5).toLocaleString()} days since I met you. I want to be there for every candle still to come.`), row(btn("Play it again", gate))));
  }

  (window.BDAY_PICS ? Promise.resolve(BDAY_PICS) : fetch("/photos.json").then((r) => r.json())).catch(() => []).then((p) => { pics = p; preview || Date.now() >= start ? gate() : lock(); });
})();
