import { supabase } from "../js/supabase.js";
import { initStreak } from "./streak.js";

function calculatePercentage(correct, total) {
  if (!total) return 0;

  return Math.round((correct / total) * 100);
}

function getLocalDateKey(dateValue) {
  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function groupSessionsByDate(sessions) {
  const grouped = {};

  sessions.forEach((session) => {
    const dateKey = getLocalDateKey(session.created_at);

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        correct: 0,
        total: 0,
      };
    }

    grouped[dateKey].correct += Number(session.correct_answers);

    grouped[dateKey].total += Number(session.total_questions);
  });

  return grouped;
}

function getDailyProgress(sessions, days = 7) {
  const grouped = groupSessionsByDate(sessions);
  const result = [];

  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);

    date.setDate(today.getDate() - i);

    const dateKey = getLocalDateKey(date);
    const dayData = grouped[dateKey];

    result.push({
      date: dateKey,
      percentage: dayData
        ? calculatePercentage(dayData.correct, dayData.total)
        : null,
    });
  }

  return result;
}

function getCurrentProgress(sessions) {
  if (!sessions.length) {
    return 0;
  }

  let totalCorrect = 0;
  let totalQuestions = 0;

  sessions.forEach((session) => {
    totalCorrect += Number(session.correct_answers);

    totalQuestions += Number(session.total_questions);
  });

  return calculatePercentage(totalCorrect, totalQuestions);
}

function createChartPoints(data) {
  const width = 300;
  const height = 120;

  const paddingX = 4;
  const paddingY = 10;

  const usableWidth = width - paddingX * 2;

  const usableHeight = height - paddingY * 2;

  const validIndexes = data
    .map((item, index) => (item.percentage !== null ? index : null))
    .filter((index) => index !== null);

  if (!validIndexes.length) {
    return "";
  }

  if (validIndexes.length === 1) {
    const index = validIndexes[0];
    const item = data[index];

    const x =
      data.length === 1
        ? width / 2
        : paddingX + (index / (data.length - 1)) * usableWidth;

    const y = height - paddingY - (item.percentage / 100) * usableHeight;

    return `${x},${y}`;
  }

  return data
    .map((item, index) => {
      if (item.percentage === null) {
        return null;
      }

      const x = paddingX + (index / (data.length - 1)) * usableWidth;

      const y = height - paddingY - (item.percentage / 100) * usableHeight;

      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");
}

function createChart(data) {
  const points = createChartPoints(data);

  if (!points) {
    return `
      <svg
        viewBox="0 0 300 120"
        preserveAspectRatio="none"
        aria-label="No practice data"
      >
        <text
          x="150"
          y="65"
          text-anchor="middle"
          font-size="12"
          fill="currentColor"
        >
          No practice data
        </text>
      </svg>
    `;
  }

  const pointList = points.split(" ");

  const circles = pointList
    .map((point) => {
      const [x, y] = point.split(",");

      return `
        <circle
          cx="${x}"
          cy="${y}"
          r="3"
          fill="currentColor"
        />
      `;
    })
    .join("");

  return `
    <svg
      viewBox="0 0 300 120"
      preserveAspectRatio="none"
      aria-label="Subject progress chart"
    >
      <polyline
        points="${points}"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      ${circles}
    </svg>
  `;
}

function formatDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function createLabels(data) {
  return data
    .map((item) => {
      return `
        <span>
          ${formatDay(item.date)}
        </span>
      `;
    })
    .join("");
}

function getProgressQuote(percentage) {
  if (percentage >= 90) {
    return "Excellence is not an accident. You are building proof that you belong at the top.";
  }

  if (percentage >= 80) {
    return "You are close to mastery. Keep pushing until your results leave no room for doubt.";
  }

  if (percentage >= 70) {
    return "Progress is visible. Do not slow down now—the gap between good and great is consistency.";
  }

  if (percentage >= 60) {
    return "You have the foundation. Now sharpen it. Every mistake is another step toward mastery.";
  }

  if (percentage >= 40) {
    return "This result is not your limit. Study the weakness, attack it, and come back stronger.";
  }

  if (percentage > 0) {
    return "Do not let a score define you. Let it expose what needs to be conquered.";
  }

  return "Every expert was once a beginner. Start again, learn harder, and refuse to stay here.";
}

function createSubjectCard(subjectName, sessions) {
  const dailyProgress = getDailyProgress(sessions);

  const currentProgress = getCurrentProgress(sessions);

  const progressQuote = getProgressQuote(currentProgress);

  const formattedSubject =
    subjectName.charAt(0).toUpperCase() + subjectName.slice(1);

  const card = document.createElement("div");

  card.className = "subject-progress-card";

  card.innerHTML = `
    <div class="subject-progress-card-top">
      <div>
        <span>${formattedSubject}</span>
        <strong>${currentProgress}%</strong>
      </div>
    </div>

    <div class="subject-chart">
      ${createChart(dailyProgress)}
    </div>

    <div class="subject-progress-labels">
      ${createLabels(dailyProgress)}
    </div>

    <p class="subject-progress-quote">
      ${progressQuote}
    </p>
  `;

  return card;
}
function groupSessionsBySubject(sessions) {
  const subjects = {};

  sessions.forEach((session) => {
    const subjectKey = session.subject.trim().toLowerCase();

    if (!subjects[subjectKey]) {
      subjects[subjectKey] = {
        name: session.subject,
        sessions: [],
      };
    }

    subjects[subjectKey].sessions.push(session);
  });

  return subjects;
}

function renderEmptyState() {
  const container = document.getElementById("subjectProgressScroll");

  if (!container) return;

  container.innerHTML = `
    <div class="subject-progress-card">
      <div class="subject-progress-card-top">
        <div>
          <span>Subject Progress</span>
          <strong>—</strong>
        </div>
      </div>

      <div class="subject-chart">
        <svg
          viewBox="0 0 300 120"
          preserveAspectRatio="none"
        >
          <text
            x="150"
            y="65"
            text-anchor="middle"
            font-size="12"
            fill="currentColor"
          >
            Complete a practice to see progress
          </text>
        </svg>
      </div>
    </div>
  `;
}

function renderLoadingState() {
  const container = document.getElementById("subjectProgressScroll");

  if (!container) return;

  container.innerHTML = `
    <div class="subject-progress-card">
      <div class="subject-progress-card-top">
        <div>
          <span>Subject Progress</span>
          <strong>...</strong>
        </div>
      </div>

      <div class="subject-chart">
        <svg
          viewBox="0 0 300 120"
          preserveAspectRatio="none"
        >
          <text
            x="150"
            y="65"
            text-anchor="middle"
            font-size="12"
            fill="currentColor"
          >
            Loading progress...
          </text>
        </svg>
      </div>
    </div>
  `;
}

function renderErrorState() {
  const container = document.getElementById("subjectProgressScroll");

  if (!container) return;

  container.innerHTML = `
    <div class="subject-progress-card">
      <div class="subject-progress-card-top">
        <div>
          <span>Subject Progress</span>
          <strong>—</strong>
        </div>
      </div>

      <div class="subject-chart">
        <svg
          viewBox="0 0 300 120"
          preserveAspectRatio="none"
        >
          <text
            x="150"
            y="65"
            text-anchor="middle"
            font-size="12"
            fill="currentColor"
          >
            Unable to load progress
          </text>
        </svg>
      </div>
    </div>
  `;
}

function renderSubjectProgress(sessions) {
  const container = document.getElementById("subjectProgressScroll");

  if (!container) return;

  container.innerHTML = "";

  if (!sessions.length) {
    renderEmptyState();
    return;
  }

  const subjects = groupSessionsBySubject(sessions);

  Object.values(subjects).forEach((subject) => {
    const card = createSubjectCard(subject.name, subject.sessions);

    container.appendChild(card);
  });
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

async function fetchPracticeSessions(userId) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(
      `
      id,
      subject,
      correct_answers,
      total_questions,
      created_at
    `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function init() {
  renderLoadingState();

  await initStreak();

  try {
    const user = await getCurrentUser();

    if (!user) {
      renderEmptyState();
      return;
    }

    const sessions = await fetchPracticeSessions(user.id);

    renderSubjectProgress(sessions);
  } catch (error) {
    console.error("Progress initialization failed:", error);

    renderErrorState();
  }
}
