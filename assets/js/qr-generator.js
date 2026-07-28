(function () {
  "use strict";

  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadQr");
  const wrap = document.getElementById("qrCanvasWrap");
  const placeholder = document.getElementById("qrPlaceholder");
  const fgColor = document.getElementById("fgColor");
  const bgColor = document.getElementById("bgColor");

  let activeTab = "link";
  let qrInstance = null;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === activeTab));
    });
  });

  function escapeWifi(str) {
    return String(str).replace(/([\\;,:"])/g, "\\$1");
  }

  function buildPayload() {
    switch (activeTab) {
      case "link": {
        const val = document.getElementById("linkInput").value.trim();
        if (!val) return null;
        return /^https?:\/\//i.test(val) ? val : "https://" + val;
      }
      case "text": {
        const val = document.getElementById("textInput").value.trim();
        return val || null;
      }
      case "wifi": {
        const ssid = document.getElementById("wifiSsid").value.trim();
        const pass = document.getElementById("wifiPass").value;
        const enc = document.getElementById("wifiEnc").value;
        if (!ssid) return null;
        const passPart = enc === "nopass" ? "" : `P:${escapeWifi(pass)};`;
        return `WIFI:T:${enc};S:${escapeWifi(ssid)};${passPart};`;
      }
      case "email": {
        const to = document.getElementById("emailTo").value.trim();
        const subject = document.getElementById("emailSubject").value.trim();
        if (!to) return null;
        return `mailto:${to}${subject ? "?subject=" + encodeURIComponent(subject) : ""}`;
      }
      default:
        return null;
    }
  }

  function loadQrLib() {
    return new Promise((resolve, reject) => {
      if (window.QRCode) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load QR library"));
      document.head.appendChild(script);
    });
  }

  generateBtn.addEventListener("click", async () => {
    const payload = buildPayload();
    if (!payload) {
      alert("Fill in the fields for this tab first.");
      return;
    }

    const originalLabel = generateBtn.textContent;
    generateBtn.textContent = "Generating…";
    generateBtn.disabled = true;

    try {
      await loadQrLib();
      wrap.innerHTML = "";
      qrInstance = new window.QRCode(wrap, {
        text: payload,
        width: 220,
        height: 220,
        colorDark: fgColor.value,
        colorLight: bgColor.value,
        correctLevel: window.QRCode.CorrectLevel.M,
      });
      downloadBtn.disabled = false;
    } catch (err) {
      console.error(err);
      wrap.innerHTML = "";
      wrap.appendChild(placeholder);
      placeholder.textContent = "Could not load the QR engine. Check your connection and try again.";
      alert("Could not generate the QR code. Please try again.");
    } finally {
      generateBtn.textContent = originalLabel;
      generateBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener("click", () => {
    const img = wrap.querySelector("img");
    const canvas = wrap.querySelector("canvas");
    const src = img ? img.src : canvas ? canvas.toDataURL("image/png") : null;
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = "qr-code.png";
    a.click();
  });
})();
