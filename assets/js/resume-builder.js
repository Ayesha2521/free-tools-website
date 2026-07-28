(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const expList = $("expList");
  const eduList = $("eduList");
  let expSeq = 0, eduSeq = 0;

  function expItemTemplate(id) {
    const div = document.createElement("div");
    div.className = "repeatable-item";
    div.dataset.id = id;
    div.innerHTML = `
      <button type="button" class="remove-item" aria-label="Remove"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <div class="field-row">
        <div class="field"><label>Role</label><input type="text" class="exp-role" placeholder="Frontend Developer"></div>
        <div class="field"><label>Company</label><input type="text" class="exp-company" placeholder="Acme Co."></div>
      </div>
      <div class="field"><label>Dates</label><input type="text" class="exp-dates" placeholder="Jan 2023 — Present"></div>
      <div class="field" style="margin-bottom:0;"><label>Description</label><textarea class="exp-desc" rows="2" placeholder="What you did and what changed because of it."></textarea></div>
    `;
    return div;
  }

  function eduItemTemplate(id) {
    const div = document.createElement("div");
    div.className = "repeatable-item";
    div.dataset.id = id;
    div.innerHTML = `
      <button type="button" class="remove-item" aria-label="Remove"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <div class="field-row">
        <div class="field"><label>Degree</label><input type="text" class="edu-degree" placeholder="BSc Computer Science"></div>
        <div class="field"><label>School</label><input type="text" class="edu-school" placeholder="University name"></div>
      </div>
      <div class="field" style="margin-bottom:0;"><label>Dates</label><input type="text" class="edu-dates" placeholder="2019 — 2023"></div>
    `;
    return div;
  }

  function addExp() {
    const el = expItemTemplate(++expSeq);
    expList.appendChild(el);
    wireItem(el);
  }
  function addEdu() {
    const el = eduItemTemplate(++eduSeq);
    eduList.appendChild(el);
    wireItem(el);
  }

  function wireItem(el) {
    el.querySelector(".remove-item").addEventListener("click", () => { el.remove(); render(); });
    el.querySelectorAll("input, textarea").forEach((inp) => inp.addEventListener("input", render));
  }

  $("addExp").addEventListener("click", () => { addExp(); render(); });
  $("addEdu").addEventListener("click", () => { addEdu(); render(); });

  const basicIds = ["rName", "rTitle", "rEmail", "rPhone", "rLocation", "rSummary", "rSkills"];
  basicIds.forEach((id) => $(id).addEventListener("input", render));

  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }

  function render() {
    $("pName").textContent = $("rName").value.trim() || "Your Name";
    $("pTitle").textContent = $("rTitle").value.trim() || "Job title";

    const contacts = [$("rEmail").value.trim(), $("rPhone").value.trim(), $("rLocation").value.trim()].filter(Boolean);
    $("pContact").innerHTML = contacts.map((c) => `<span>${esc(c)}</span>`).join("<span>&middot;</span>");

    const summary = $("rSummary").value.trim();
    $("pSummary").textContent = summary || "Your summary will appear here.";
    $("pSummary").classList.toggle("r-empty", !summary);

    // Experience
    const expEntries = Array.from(expList.children).map((el) => ({
      role: el.querySelector(".exp-role").value.trim(),
      company: el.querySelector(".exp-company").value.trim(),
      dates: el.querySelector(".exp-dates").value.trim(),
      desc: el.querySelector(".exp-desc").value.trim(),
    })).filter((e) => e.role || e.company || e.desc);

    const pExp = $("pExp");
    pExp.innerHTML = expEntries.length ? expEntries.map((e) => `
      <div class="r-entry">
        <div class="r-entry-head"><span>${esc(e.role || "Role")}</span><span>${esc(e.dates)}</span></div>
        <div class="r-entry-sub">${esc(e.company)}</div>
        ${e.desc ? `<p>${esc(e.desc)}</p>` : ""}
      </div>
    `).join("") : `<p class="r-empty">Add a role to see it here.</p>`;

    // Education
    const eduEntries = Array.from(eduList.children).map((el) => ({
      degree: el.querySelector(".edu-degree").value.trim(),
      school: el.querySelector(".edu-school").value.trim(),
      dates: el.querySelector(".edu-dates").value.trim(),
    })).filter((e) => e.degree || e.school);

    const pEdu = $("pEdu");
    pEdu.innerHTML = eduEntries.length ? eduEntries.map((e) => `
      <div class="r-entry">
        <div class="r-entry-head"><span>${esc(e.degree || "Degree")}</span><span>${esc(e.dates)}</span></div>
        <div class="r-entry-sub">${esc(e.school)}</div>
      </div>
    `).join("") : `<p class="r-empty">Add a school to see it here.</p>`;

    // Skills
    const skills = $("rSkills").value.split(",").map((s) => s.trim()).filter(Boolean);
    $("pSkills").innerHTML = skills.length
      ? skills.map((s) => `<span class="r-skill-pill">${esc(s)}</span>`).join("")
      : `<span class="r-empty">List your skills above.</span>`;
  }

  $("downloadBtn").addEventListener("click", () => {
    document.getElementById("printClone").innerHTML = document.getElementById("printArea").outerHTML;
    window.print();
  });

  // Start with one blank entry of each so the form doesn't look empty.
  addExp();
  addEdu();
  render();
})();
