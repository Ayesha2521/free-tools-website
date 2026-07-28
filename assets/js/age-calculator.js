(function () {
  "use strict";

  const birthDateEl = document.getElementById("birthDate");
  const asOfDateEl = document.getElementById("asOfDate");
  const calcBtn = document.getElementById("calcBtn");
  const errorMsg = document.getElementById("errorMsg");
  const mainStat = document.getElementById("mainStat");
  const mainLabel = document.getElementById("mainLabel");
  const statMonths = document.getElementById("statMonths");
  const statWeeks = document.getElementById("statWeeks");
  const statDays = document.getElementById("statDays");
  const nextBirthday = document.getElementById("nextBirthday");

  const today = new Date();
  asOfDateEl.value = today.toISOString().slice(0, 10);

  function diffYMD(start, end) {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years, months, days };
  }

  calcBtn.addEventListener("click", () => {
    errorMsg.textContent = "";
    const birth = birthDateEl.value ? new Date(birthDateEl.value + "T00:00:00") : null;
    const asOf = asOfDateEl.value ? new Date(asOfDateEl.value + "T00:00:00") : new Date();

    if (!birth) { errorMsg.textContent = "Pick a date of birth first."; return; }
    if (birth > asOf) { errorMsg.textContent = "The birth date is after the 'as of' date."; return; }

    const { years, months, days } = diffYMD(birth, asOf);
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((asOf - birth) / msPerDay);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    mainStat.textContent = years;
    mainLabel.textContent = `years, ${months} months, ${days} days old`;
    statMonths.textContent = totalMonths.toLocaleString();
    statWeeks.textContent = totalWeeks.toLocaleString();
    statDays.textContent = totalDays.toLocaleString();

    const nextBday = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < asOf) nextBday.setFullYear(asOf.getFullYear() + 1);
    const daysToGo = Math.round((nextBday - asOf) / msPerDay);
    nextBirthday.textContent = daysToGo === 0
      ? "Happy birthday, that's today!"
      : `${daysToGo.toLocaleString()} day${daysToGo === 1 ? "" : "s"} until the next birthday.`;
  });
})();
