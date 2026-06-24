const SUBJECTS = ["Maths", "English", "Biology", "Chemistry", "Physics", "Geography", "History", "German", "RE"];
const STORAGE_KEY = "gcseRevisionTracker.sessions";
const THEME_KEY = "gcseRevisionTracker.theme";
const SUBJECT_GOAL_HOURS = 20;

const elements = {
  form: document.querySelector("#sessionForm"),
  subject: document.querySelector("#subject"),
  date: document.querySelector("#date"),
  duration: document.querySelector("#duration"),
  topic: document.querySelector("#topic"),
  subjectsGrid: document.querySelector("#subjectsGrid"),
  sessionList: document.querySelector("#sessionList"),
  emptyState: document.querySelector("#emptyState"),
  totalHours: document.querySelector("#totalHours"),
  currentStreak: document.querySelector("#currentStreak"),
  bestStreak: document.querySelector("#bestStreak"),
  themeToggle: document.querySelector("#themeToggle"),
  clearData: document.querySelector("#clearData"),
  goalHoursLabel: document.querySelector("#goalHoursLabel"),
};

let sessions = loadSessions();

elements.goalHoursLabel.textContent = SUBJECT_GOAL_HOURS;
elements.date.valueAsDate = new Date();
SUBJECTS.forEach((subject) => elements.subject.add(new Option(subject, subject)));
applySavedTheme();
render();

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const session = {
    id: crypto.randomUUID(),
    subject: elements.subject.value,
    date: elements.date.value,
    duration: Number(elements.duration.value),
    topic: elements.topic.value.trim(),
  };

  sessions.push(session);
  saveSessions();
  elements.form.reset();
  elements.date.valueAsDate = new Date();
  render();
});

elements.sessionList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  sessions = sessions.filter((session) => session.id !== button.dataset.id);
  saveSessions();
  render();
});

elements.clearData.addEventListener("click", () => {
  if (!sessions.length || !confirm("Delete all saved revision sessions?")) return;
  sessions = [];
  saveSessions();
  render();
});

elements.themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  updateThemeButton(isDark);
});

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme ? savedTheme === "dark" : prefersDark;
  document.body.classList.toggle("dark", isDark);
  updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
  elements.themeToggle.innerHTML = `<span aria-hidden="true">${isDark ? "☀️" : "🌙"}</span><span>${isDark ? "Light" : "Dark"} mode</span>`;
}

function render() {
  const totalsBySubject = SUBJECTS.reduce((totals, subject) => ({ ...totals, [subject]: 0 }), {});
  sessions.forEach((session) => {
    totalsBySubject[session.subject] += session.duration / 60;
  });

  renderSummary(totalsBySubject);
  renderSubjects(totalsBySubject);
  renderSessions();
}

function renderSummary(totalsBySubject) {
  const total = Object.values(totalsBySubject).reduce((sum, hours) => sum + hours, 0);
  const streaks = calculateStreaks(sessions.map((session) => session.date));
  elements.totalHours.textContent = formatHours(total);
  elements.currentStreak.textContent = pluraliseDays(streaks.current);
  elements.bestStreak.textContent = pluraliseDays(streaks.best);
}

function renderSubjects(totalsBySubject) {
  elements.subjectsGrid.innerHTML = SUBJECTS.map((subject) => {
    const hours = totalsBySubject[subject];
    const percentage = Math.min((hours / SUBJECT_GOAL_HOURS) * 100, 100);
    return `
      <article class="subject-card">
        <div class="subject-row">
          <strong>${subject}</strong>
          <span>${formatHours(hours)} / ${SUBJECT_GOAL_HOURS}h</span>
        </div>
        <div class="progress-track" aria-label="${subject} progress">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </article>
    `;
  }).join("");
}

function renderSessions() {
  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  elements.emptyState.classList.toggle("hidden", sortedSessions.length > 0);
  elements.sessionList.innerHTML = sortedSessions.map((session) => `
    <li class="session-item">
      <div>
        <strong>${session.subject}: ${escapeHtml(session.topic)}</strong>
        <small>${formatDate(session.date)} • ${session.duration} minutes</small>
      </div>
      <button class="delete-button" type="button" data-id="${session.id}" aria-label="Delete ${escapeHtml(session.topic)}">Delete</button>
    </li>
  `).join("");
}

function calculateStreaks(dates) {
  const uniqueDates = [...new Set(dates)].sort();
  if (!uniqueDates.length) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = new Date(`${uniqueDates[index - 1]}T00:00:00`);
    const current = new Date(`${uniqueDates[index]}T00:00:00`);
    const dayDifference = (current - previous) / 86400000;
    run = dayDifference === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const today = toDateInputValue(new Date());
  const yesterday = toDateInputValue(new Date(Date.now() - 86400000));
  let current = 0;
  if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
    current = 1;
    for (let index = uniqueDates.length - 1; index > 0; index -= 1) {
      const currentDate = new Date(`${uniqueDates[index]}T00:00:00`);
      const previousDate = new Date(`${uniqueDates[index - 1]}T00:00:00`);
      if ((currentDate - previousDate) / 86400000 === 1) current += 1;
      else break;
    }
  }

  return { current, best };
}

function formatHours(hours) {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function pluraliseDays(days) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[character]));
}
