// Cloudflare Worker manzili
// Oddiy holat: ASOSIY worker. Sinov uchun: sahifani ?api=dev bilan oching (shu tabda saqlanadi), qaytish uchun ?api=main.
(function(){
  var MAIN = "https://aok-checker.ozodbekadilov092.workers.dev";
  var DEV = "https://aok-checker-dev.ozodbekadilov092.workers.dev";
  var dev = false;
  try {
    var q = new URLSearchParams(location.search).get("api");
    if (q === "dev") sessionStorage.setItem("aok_api", "dev");
    else if (q === "main") sessionStorage.removeItem("aok_api");
    dev = sessionStorage.getItem("aok_api") === "dev";
  } catch (e) {}
  window.AOK_API = dev ? DEV : MAIN;
  window.AOK_DEV = dev;
  window.AOK_LS = dev ? "dev:" : ""; // sinovda kodlar alohida saqlanadi (asosiysi bilan aralashmaydi)
  if (dev) {
    var show = function(){
      if (document.getElementById("aokDevBar")) return;
      var b = document.createElement("div"); b.id = "aokDevBar";
      b.style.cssText = "position:sticky;top:0;z-index:99999;background:#c62828;color:#fff;font:600 13px/1.4 system-ui,sans-serif;text-align:center;padding:6px 8px";
      b.innerHTML = '🧪 SINOV rejimi (sinov worker) · <a href="?api=main" style="color:#fff;text-decoration:underline">asosiyga qaytish</a>';
      document.body.insertBefore(b, document.body.firstChild);
    };
    if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
  }
})();
