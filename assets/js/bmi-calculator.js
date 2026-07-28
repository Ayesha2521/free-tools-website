(function () {
  "use strict";

  const heightUnit = document.getElementById("heightUnit");
  const weightUnit = document.getElementById("weightUnit");
  const weightLabel = document.getElementById("weightLabel");
  const heightPanels = document.querySelectorAll("[data-height-panel]");
  const calcBtn = document.getElementById("calcBtn");
  const errorMsg = document.getElementById("errorMsg");
  const bmiValue = document.getElementById("bmiValue");
  const bmiCategory = document.getElementById("bmiCategory");
  const bmiMarker = document.getElementById("bmiMarker");

  heightUnit.addEventListener("change", () => {
    heightPanels.forEach((p) => { p.hidden = p.dataset.heightPanel !== heightUnit.value; });
  });

  weightUnit.addEventListener("change", () => {
    weightLabel.textContent = weightUnit.value === "kg" ? "Weight (kg)" : "Weight (lb)";
  });

  function categoryFor(bmi) {
    if (bmi < 18.5) return { label: "Underweight", pos: (bmi / 18.5) * 18 };
    if (bmi < 25)   return { label: "Healthy weight", pos: 18 + ((bmi - 18.5) / (25 - 18.5)) * 22 };
    if (bmi < 30)   return { label: "Overweight", pos: 40 + ((bmi - 25) / (30 - 25)) * 22 };
    if (bmi < 35)   return { label: "Obese (class I)", pos: 62 + ((bmi - 30) / (35 - 30)) * 18 };
    return { label: "Obese (class II+)", pos: Math.min(80 + ((bmi - 35) / 10) * 20, 100) };
  }

  calcBtn.addEventListener("click", () => {
    errorMsg.textContent = "";
    let heightM;

    if (heightUnit.value === "cm") {
      const cm = parseFloat(document.getElementById("heightCm").value);
      if (!cm) { errorMsg.textContent = "Enter your height."; return; }
      heightM = cm / 100;
    } else {
      const ft = parseFloat(document.getElementById("heightFt").value) || 0;
      const inch = parseFloat(document.getElementById("heightIn").value) || 0;
      if (!ft && !inch) { errorMsg.textContent = "Enter your height."; return; }
      heightM = ((ft * 12) + inch) * 0.0254;
    }

    const weightRaw = parseFloat(document.getElementById("weightValue").value);
    if (!weightRaw) { errorMsg.textContent = "Enter your weight."; return; }
    const weightKg = weightUnit.value === "kg" ? weightRaw : weightRaw * 0.453592;

    if (heightM <= 0) { errorMsg.textContent = "Height must be greater than zero."; return; }

    const bmi = weightKg / (heightM * heightM);
    const { label, pos } = categoryFor(bmi);

    bmiValue.textContent = bmi.toFixed(1);
    bmiCategory.textContent = label;
    bmiMarker.style.left = Math.min(Math.max(pos, 2), 98) + "%";
  });
})();
