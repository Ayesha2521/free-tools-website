(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const lineItems = $("lineItems");
  let lineSeq = 0;

  $("invDate").value = new Date().toISOString().slice(0, 10);

  function lineTemplate(id) {
    const div = document.createElement("div");
    div.className = "line-item-row";
    div.dataset.id = id;
    div.innerHTML = `
      <input type="text" class="line-desc" placeholder="Design work">
      <input type="number" class="line-qty" value="1" min="0" step="1">
      <input type="number" class="line-price" value="0" min="0" step="0.01">
      <span class="amt">0.00</span>
      <button type="button" class="rm-line" aria-label="Remove line"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    `;
    return div;
  }

  function addLine() {
    const el = lineTemplate(++lineSeq);
    lineItems.appendChild(el);
    el.querySelector(".rm-line").addEventListener("click", () => { el.remove(); render(); });
    el.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", () => {
      const qty = parseFloat(el.querySelector(".line-qty").value) || 0;
      const price = parseFloat(el.querySelector(".line-price").value) || 0;
      el.querySelector(".amt").textContent = (qty * price).toFixed(2);
      render();
    }));
  }

  $("addLine").addEventListener("click", () => { addLine(); render(); });

  ["invNumber", "invDate", "fromInfo", "toInfo", "taxRate", "currency", "invNotes"].forEach((id) =>
    $(id).addEventListener("input", render)
  );

  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }

  function money(n, symbol) {
    return `${symbol}${n.toFixed(2)}`;
  }

  function render() {
    const symbol = $("currency").value.trim() || "$";
    $("pInvNumber").textContent = $("invNumber").value.trim() || "INV-0001";
    const dateVal = $("invDate").value;
    $("pInvDate").textContent = dateVal ? new Date(dateVal + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

    const from = $("fromInfo").value.trim();
    const to = $("toInfo").value.trim();
    $("pFrom").textContent = from || "Your business details";
    $("pFrom").classList.toggle("r-empty", !from);
    $("pTo").textContent = to || "Client details";
    $("pTo").classList.toggle("r-empty", !to);

    const rows = Array.from(lineItems.children).map((el) => ({
      desc: el.querySelector(".line-desc").value.trim(),
      qty: parseFloat(el.querySelector(".line-qty").value) || 0,
      price: parseFloat(el.querySelector(".line-price").value) || 0,
    })).filter((r) => r.desc || r.qty || r.price);

    const pLines = $("pLines");
    pLines.innerHTML = rows.length ? rows.map((r) => `
      <tr>
        <td>${esc(r.desc || "Item")}</td>
        <td class="num">${r.qty}</td>
        <td class="num">${money(r.price, symbol)}</td>
        <td class="num">${money(r.qty * r.price, symbol)}</td>
      </tr>
    `).join("") : `<tr><td colspan="4" class="r-empty">Add a line item to see it here.</td></tr>`;

    const subtotal = rows.reduce((sum, r) => sum + r.qty * r.price, 0);
    const taxRate = parseFloat($("taxRate").value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    $("pSubtotal").textContent = money(subtotal, symbol);
    $("pTax").textContent = `${money(tax, symbol)} (${taxRate}%)`;
    $("pTotal").textContent = money(total, symbol);
    $("pNotes").textContent = $("invNotes").value.trim();
  }

  $("downloadBtn").addEventListener("click", () => {
    document.getElementById("printClone").innerHTML = document.getElementById("printArea").outerHTML;
    window.print();
  });

  addLine();
  render();
})();
