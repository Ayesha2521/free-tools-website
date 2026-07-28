(function () {
  "use strict";

  const pwOutput = document.getElementById("pwOutput");
  const copyBtn = document.getElementById("copyBtn");
  const regenBtn = document.getElementById("regenBtn");
  const generateBtn = document.getElementById("generateBtn");
  const lengthRange = document.getElementById("lengthRange");
  const lengthValue = document.getElementById("lengthValue");
  const optUpper = document.getElementById("optUpper");
  const optLower = document.getElementById("optLower");
  const optNumbers = document.getElementById("optNumbers");
  const optSymbols = document.getElementById("optSymbols");
  const optAmbiguous = document.getElementById("optAmbiguous");
  const strengthFill = document.getElementById("strengthFill");
  const strengthLabel = document.getElementById("strengthLabel");

  const SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.<>?/",
  };
  const AMBIGUOUS = /[lI1O0]/g;

  lengthRange.addEventListener("input", () => { lengthValue.textContent = lengthRange.value; });

  function randomInt(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  function buildCharset() {
    let charset = "";
    if (optUpper.checked) charset += SETS.upper;
    if (optLower.checked) charset += SETS.lower;
    if (optNumbers.checked) charset += SETS.numbers;
    if (optSymbols.checked) charset += SETS.symbols;
    if (optAmbiguous.checked) charset = charset.replace(AMBIGUOUS, "");
    return charset;
  }

  function generate() {
    const charset = buildCharset();
    if (!charset) {
      pwOutput.value = "";
      strengthLabel.textContent = "Pick at least one character type.";
      strengthFill.style.width = "0%";
      return;
    }
    const length = Number(lengthRange.value);
    let pw = "";
    for (let i = 0; i < length; i++) {
      pw += charset[randomInt(charset.length)];
    }
    pwOutput.value = pw;
    updateStrength(pw, charset.length);
  }

  function updateStrength(pw, poolSize) {
    const entropy = Math.log2(Math.pow(poolSize, pw.length));
    let pct, label, color;
    if (entropy < 40) { pct = 25; label = "Weak"; color = "var(--bin-age)"; }
    else if (entropy < 65) { pct = 55; label = "Fair"; color = "var(--bin-invoice)"; }
    else if (entropy < 90) { pct = 80; label = "Strong"; color = "var(--bin-bmi)"; }
    else { pct = 100; label = "Very strong"; color = "var(--bin-pdf)"; }
    strengthFill.style.width = pct + "%";
    strengthFill.style.background = color;
    strengthLabel.textContent = `${label} · ~${Math.round(entropy)} bits of entropy`;
  }

  copyBtn.addEventListener("click", async () => {
    if (!pwOutput.value) return;
    try {
      await navigator.clipboard.writeText(pwOutput.value);
      const original = copyBtn.title;
      copyBtn.title = "Copied!";
      setTimeout(() => { copyBtn.title = original; }, 1200);
    } catch {
      pwOutput.select();
      document.execCommand("copy");
    }
  });

  regenBtn.addEventListener("click", generate);
  generateBtn.addEventListener("click", generate);
  [optUpper, optLower, optNumbers, optSymbols, optAmbiguous, lengthRange].forEach((el) =>
    el.addEventListener("change", generate)
  );

  generate();
})();
