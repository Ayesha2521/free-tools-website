(function () {
  "use strict";

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const emptyState = document.getElementById("emptyState");
  const mergeBtn = document.getElementById("mergeBtn");
  const clearAllBtn = document.getElementById("clearAll");

  /** @type {{id:string, file:File}[]} */
  let queue = [];
  let seq = 0;

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
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
    addFiles(files);
  });
  fileInput.addEventListener("change", () => {
    addFiles(Array.from(fileInput.files));
    fileInput.value = "";
  });

  function addFiles(files) {
    files.forEach((file) => queue.push({ id: "p" + ++seq, file }));
    render();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function render() {
    emptyState.hidden = queue.length > 0;
    mergeBtn.disabled = queue.length < 2;
    fileList.innerHTML = "";
    if (!queue.length) { fileList.appendChild(emptyState); return; }

    queue.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "pdf-file-row";
      li.innerHTML = `
        <div class="order-actions">
          <button type="button" class="up-btn" aria-label="Move up" ${idx === 0 ? "disabled" : ""}>
            <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
          <button type="button" class="down-btn" aria-label="Move down" ${idx === queue.length - 1 ? "disabled" : ""}>
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </button>
        </div>
        <div class="thumb-icon">
          <svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/></svg>
        </div>
        <div class="meta">
          <div class="name" title="${item.file.name}">${idx + 1}. ${item.file.name}</div>
          <div class="sizes"><span>${formatBytes(item.file.size)}</span></div>
        </div>
        <div class="row-actions">
          <button type="button" class="rm-btn" title="Remove" aria-label="Remove file">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
      `;
      li.querySelector(".up-btn").addEventListener("click", () => { swap(idx, idx - 1); });
      li.querySelector(".down-btn").addEventListener("click", () => { swap(idx, idx + 1); });
      li.querySelector(".rm-btn").addEventListener("click", () => { queue.splice(idx, 1); render(); });
      fileList.appendChild(li);
    });
  }

  function swap(a, b) {
    if (b < 0 || b >= queue.length) return;
    [queue[a], queue[b]] = [queue[b], queue[a]];
    render();
  }

  clearAllBtn.addEventListener("click", () => { queue = []; render(); });

  mergeBtn.addEventListener("click", async () => {
    if (queue.length < 2) return;
    mergeBtn.disabled = true;
    const originalLabel = mergeBtn.textContent;
    mergeBtn.textContent = "Merging…";
    try {
      if (!window.PDFLib) await loadPdfLib();
      const { PDFDocument } = window.PDFLib;
      const merged = await PDFDocument.create();

      for (const item of queue) {
        const bytes = await item.file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }

      const mergedBytes = await merged.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "merged.pdf";
      a.click();
    } catch (err) {
      console.error(err);
      alert("Could not merge these PDFs. Make sure they are valid, non password-protected PDF files.");
    } finally {
      mergeBtn.disabled = false;
      mergeBtn.textContent = originalLabel;
    }
  });

  function loadPdfLib() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load pdf-lib"));
      document.head.appendChild(script);
    });
  }
})();
