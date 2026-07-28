(function () {
  "use strict";

  const dropZone   = document.getElementById("dropZone");
  const fileInput  = document.getElementById("fileInput");
  const qualityEl  = document.getElementById("quality");
  const qualityVal = document.getElementById("qualityValue");
  const formatEl   = document.getElementById("format");
  const resizeEl   = document.getElementById("resizeToggle");
  const resultsSec = document.getElementById("results");
  const fileList   = document.getElementById("fileList");
  const clearAllBtn = document.getElementById("clearAll");
  const downloadAllBtn = document.getElementById("downloadAll");
  const totalSavedEl = document.getElementById("totalSaved");

  /** @type {Map<string, {original: File, compressedBlob: Blob|null, originalSize:number, compressedSize:number, name:string, ext:string}>} */
  const items = new Map();
  let seq = 0;

  qualityEl.addEventListener("input", () => {
    qualityVal.textContent = qualityEl.value;
  });

  // ---- Drag & drop / click to browse ----
  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  ["dragenter", "dragover"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.add("is-dragover"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.remove("is-dragover"); })
  );
  dropZone.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) handleFiles(files);
  });
  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files);
    if (files.length) handleFiles(files);
    fileInput.value = "";
  });

  function handleFiles(files) {
    resultsSec.hidden = false;
    files.forEach((file) => processFile(file));
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function pressAnimation(run) {
    dropZone.classList.toggle("is-pressing", run);
  }

  async function processFile(file) {
    const id = "f" + ++seq;
    const row = buildRow(id, file);
    fileList.appendChild(row);

    const record = { original: file, compressedBlob: null, originalSize: file.size, compressedSize: 0, name: file.name, ext: "" };
    items.set(id, record);

    pressAnimation(true);
    try {
      const { blob, ext, usedOriginal } = await compressImage(file, {
        quality: Number(qualityEl.value) / 100,
        format: formatEl.value,
        maxDim: resizeEl.checked ? 1920 : null,
      });
      record.compressedBlob = blob;
      record.compressedSize = blob.size;
      record.ext = ext;
      updateRow(id, blob, ext, usedOriginal);
      updateTotals();
    } catch (err) {
      console.error(err);
      const statusEl = row.querySelector(".status");
      statusEl.textContent = "Could not compress";
    } finally {
      pressAnimation(false);
    }
  }

  function loadImageEl(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => resolve({ img, url });
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
      img.src = url;
    });
  }

  function drawToBlob(img, width, height, mime, quality) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // Flatten transparency onto white when encoding to JPEG (JPEG has no alpha channel).
    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        mime,
        mime === "image/png" ? undefined : quality
      );
    });
  }

  async function compressImage(file, { quality, format, maxDim }) {
    const { img, url } = await loadImageEl(file);
    try {
      let { width, height } = img;
      if (maxDim && Math.max(width, height) > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      let mime, ext;
      if (format === "webp") { mime = "image/webp"; ext = "webp"; }
      else if (format === "jpeg") { mime = "image/jpeg"; ext = "jpg"; }
      else if (format === "png") { mime = "image/png"; ext = "png"; }
      else { mime = "image/webp"; ext = "webp"; } // auto: WebP gives the smallest files for almost all photos

      let blob = await drawToBlob(img, width, height, mime, quality);

      // Auto mode: if WebP somehow isn't supported or didn't help, try JPEG too and keep whichever is smaller.
      if (format === "auto" && blob.size >= file.size) {
        try {
          const jpegBlob = await drawToBlob(img, width, height, "image/jpeg", quality);
          if (jpegBlob.size < blob.size) { blob = jpegBlob; mime = "image/jpeg"; ext = "jpg"; }
        } catch (e) { /* ignore, keep the webp attempt */ }
      }

      // Safety net: never hand back a "compressed" file that's bigger than the original.
      let usedOriginal = false;
      if (blob.size >= file.size) {
        blob = file;
        ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        usedOriginal = true;
      }

      return { blob, ext, usedOriginal };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function baseName(name) {
    const dot = name.lastIndexOf(".");
    return dot > 0 ? name.slice(0, dot) : name;
  }

  function buildRow(id, file) {
    const li = document.createElement("li");
    li.className = "file-row";
    li.id = id;
    li.innerHTML = `
      <img class="thumb" alt="" src="${URL.createObjectURL(file)}">
      <div class="meta">
        <div class="name" title="${file.name}">${file.name}</div>
        <div class="sizes">
          <span class="orig">${formatBytes(file.size)}</span>
        </div>
      </div>
      <div class="status">Pressing&hellip;</div>
      <div class="row-actions">
        <button type="button" class="dl-btn" title="Download" disabled aria-label="Download compressed file">
          <svg viewBox="0 0 24 24"><path d="M12 3v13m0 0l-4-4m4 4l4-4M4 21h16"/></svg>
        </button>
        <button type="button" class="rm-btn" title="Remove" aria-label="Remove file">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    `;
    li.querySelector(".rm-btn").addEventListener("click", () => {
      items.delete(id);
      li.remove();
      updateTotals();
      if (!items.size) resultsSec.hidden = true;
    });
    return li;
  }

  function updateRow(id, blob, ext, usedOriginal) {
    const li = document.getElementById(id);
    if (!li) return;
    const record = items.get(id);
    const pct = Math.max(0, Math.round((1 - record.compressedSize / record.originalSize) * 100));
    li.querySelector(".sizes").innerHTML = usedOriginal
      ? `<span class="orig">${formatBytes(record.originalSize)}</span><span class="hint" style="margin:0;">already as small as it gets</span>`
      : `
      <span class="orig">${formatBytes(record.originalSize)}</span>
      <span class="arrow">&rarr;</span>
      <span>${formatBytes(record.compressedSize)}</span>
      <span class="down">-${pct}%</span>
    `;
    li.querySelector(".status").textContent = usedOriginal ? "Kept original" : "Done";
    const dlBtn = li.querySelector(".dl-btn");
    dlBtn.disabled = false;
    dlBtn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = baseName(record.name) + "-compressed." + ext;
      a.click();
    });
  }

  function updateTotals() {
    let before = 0, after = 0, doneCount = 0;
    items.forEach((r) => {
      before += r.originalSize;
      if (r.compressedBlob) { after += r.compressedSize; doneCount++; }
    });
    if (doneCount > 0 && before > 0) {
      const pct = Math.max(0, Math.round((1 - after / before) * 100));
      totalSavedEl.hidden = false;
      totalSavedEl.textContent = `Saved ${pct}% overall (${formatBytes(before)} → ${formatBytes(after)})`;
    } else {
      totalSavedEl.hidden = true;
    }
    downloadAllBtn.disabled = doneCount === 0;
  }

  clearAllBtn.addEventListener("click", () => {
    items.clear();
    fileList.innerHTML = "";
    resultsSec.hidden = true;
  });

  downloadAllBtn.addEventListener("click", async () => {
    const ready = Array.from(items.values()).filter((r) => r.compressedBlob);
    if (!ready.length) return;

    downloadAllBtn.disabled = true;
    const originalLabel = downloadAllBtn.textContent;
    downloadAllBtn.textContent = "Zipping…";

    try {
      if (!window.JSZip) await loadJSZip();
      const zip = new window.JSZip();
      ready.forEach((r) => {
        zip.file(baseName(r.name) + "-compressed." + r.ext, r.compressedBlob);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = "compressed-images.zip";
      a.click();
    } catch (err) {
      console.error(err);
      alert("Could not build the zip file. Try downloading images individually.");
    } finally {
      downloadAllBtn.disabled = false;
      downloadAllBtn.textContent = originalLabel;
    }
  });

  function loadJSZip() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load JSZip"));
      document.head.appendChild(script);
    });
  }
})();
