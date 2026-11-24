(() => {
  const $ = (s) => document.querySelector(s), rose = $("#rose");
  rose.innerHTML = `<defs>${Flowers.defs()}</defs>${Flowers.art("rose", "hot")}`;
  $("#show").onclick = () => { const p = $("#pw"), on = p.type === "password"; p.type = on ? "text" : "password"; $("#show").textContent = on ? "Hide words" : "Show words"; };
  let box;
  $("#lock").onsubmit = async (e) => {
    e.preventDefault(); const pw = $("#pw").value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " "); if (!pw) return $("#pw").focus();
    $("#go").disabled = true; $("#msg").textContent = "Opening…";
    try {
      if (!box) { const r = await fetch("locked.bin"); if (!r.ok) throw Error("load"); box = new Uint8Array(await r.arrayBuffer()); }
    } catch { $("#msg").textContent = "It didn't load. Check your internet and try again."; $("#go").disabled = false; return; }
    let data;
    try {
      const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: box.slice(0, 16), iterations: 1000000 }, k, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      data = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: box.slice(16, 28) }, key, box.slice(28))));
    } catch { $("#msg").textContent = "Those aren't the words. Try once more."; $("#go").disabled = false; return; }
    window.BDAY = data.content; window.BDAY_PICS = data.photos.map((p) => p.name);
    window.BDAY_PHOTOS = data.photos.map((p) => URL.createObjectURL(new Blob([Uint8Array.from(atob(p.data), (c) => c.charCodeAt(0))], { type: "image/jpeg" })));
    document.title = "Happy birthday"; const s = document.createElement("script"); s.src = "app.js"; document.body.append(s);
  };
})();
