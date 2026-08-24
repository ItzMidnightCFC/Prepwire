import { supabase } from "../js/supabase.js";

const STREAK_KEY = "acecbt_streak";

function getData() {
  const saved = localStorage.getItem(STREAK_KEY);

  if (!saved) {
    return {
      dates: [],
      current: 0,
      best: 0,
    };
  }

  try {
    const data = JSON.parse(saved);

    return {
      dates: Array.isArray(data.dates) ? data.dates : [],
      current: Number(data.current) || 0,
      best: Number(data.best) || 0,
    };
  } catch {
    return {
      dates: [],
      current: 0,
      best: 0,
    };
  }
}

function saveLocalData(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentStreak(dates) {
  const set = new Set(dates);
  let date = new Date();

  if (!set.has(dateKey(date))) {
    date.setDate(date.getDate() - 1);
  }

  let streak = 0;

  while (set.has(dateKey(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function getBestStreak(dates) {
  if (!dates.length) {
    return 0;
  }

  const sorted = [...new Set(dates)].sort();

  let best = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const previous = new Date(`${sorted[i - 1]}T00:00:00`);
    const currentDate = new Date(`${sorted[i]}T00:00:00`);

    const difference = (currentDate - previous) / 86400000;

    if (difference === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function getWeek() {
  const today = new Date();
  const day = today.getDay();

  const monday = new Date(today);

  monday.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    return date;
  });
}

function updateDashboardUI(data) {
  const streak = document.querySelector(".quick-streak-top h3");
  const days = document.querySelectorAll(".quick-day");
  const message = document.querySelector(".quick-streak-message");

  if (!streak || days.length !== 7) {
    return;
  }

  const completed = new Set(data.dates);
  const week = getWeek();
  const today = dateKey();

  days.forEach((element, index) => {
    const key = dateKey(week[index]);

    element.classList.remove("active", "today");

    if (completed.has(key)) {
      element.classList.add("active");
    } else if (key === today) {
      element.classList.add("today");
    }

    element.textContent = week[index]
      .toLocaleDateString("en-US", {
        weekday: "short",
      })
      .charAt(0);
  });

  streak.textContent = `${data.current} day(s)`;

  if (message) {
    if (data.current === 0) {
      message.textContent = "Start your streak today!";
    } else if (data.current < 3) {
      message.textContent = "Great start! Keep going!";
    } else if (data.current < 7) {
      message.textContent = "You're building momentum!";
    } else if (data.current < 14) {
      message.textContent = "One week strong! 🔥";
    } else {
      message.textContent = "You're on fire! 🔥";
    }
  }
}

function updateProgressUI(data) {
  const streak = document.querySelector(".streak-header h2");
  const days = document.querySelectorAll(".streak-day");
  const footerValues = document.querySelectorAll(".streak-footer strong");

  if (!streak || days.length !== 7) {
    return;
  }

  const completed = new Set(data.dates);
  const week = getWeek();
  const today = dateKey();

  days.forEach((element, index) => {
    const key = dateKey(week[index]);
    const circle = element.querySelector(".day-circle");

    element.classList.remove("completed", "today");

    if (completed.has(key)) {
      element.classList.add("completed");
    } else if (key === today) {
      element.classList.add("today");
    }

    if (circle) {
      circle.textContent = week[index]
        .toLocaleDateString("en-US", {
          weekday: "short",
        })
        .charAt(0);
    }
  });

  streak.textContent = `${data.current} day(s)`;

  if (footerValues.length >= 2) {
    footerValues[0].textContent = `${data.current} day(s)`;
    footerValues[1].textContent = `${data.best} day(s)`;
  }

  const description = document.querySelector(".streak-header p");

  if (description) {
    if (data.current === 0) {
      description.textContent = "Start your streak today!";
    } else if (data.current < 3) {
      description.textContent = "Great start! Keep going!";
    } else if (data.current < 7) {
      description.textContent = "You're building momentum!";
    } else if (data.current < 14) {
      description.textContent = "One week strong! 🔥";
    } else {
      description.textContent = "You're on fire! 🔥";
    }
  }
}

function updateUI(data) {
  updateDashboardUI(data);
  updateProgressUI(data);
}

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("No authenticated user");
  }

  return user;
}

async function saveToSupabase(data) {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("users")
    .update({
      streak_dates: data.dates,
      current_streak: data.current,
      best_streak: data.best,
    })
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}

async function loadFromSupabase() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("users")
    .select("streak_dates, current_streak, best_streak")
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return {
    dates: Array.isArray(data.streak_dates) ? data.streak_dates : [],
    current: Number(data.current_streak) || 0,
    best: Number(data.best_streak) || 0,
  };
}

export async function initStreak() {
  try {
    const data = await loadFromSupabase();

    data.current = getCurrentStreak(data.dates);
    data.best = getBestStreak(data.dates);

    await saveToSupabase(data);

    saveLocalData(data);

    updateUI(data);

    return data;
  } catch (error) {
    console.error("Streak initialization failed:", error);

    const data = getData();

    data.current = getCurrentStreak(data.dates);
    data.best = getBestStreak(data.dates);

    saveLocalData(data);

    updateUI(data);

    return data;
  }
}

export async function recordStreak() {
  try {
    const data = await loadFromSupabase();
    const today = dateKey();

    if (!data.dates.includes(today)) {
      data.dates.push(today);
    }

    data.current = getCurrentStreak(data.dates);
    data.best = getBestStreak(data.dates);

    await saveToSupabase(data);

    saveLocalData(data);

    updateUI(data);

    return data;
  } catch (error) {
    console.error("Failed to record streak:", error);
    throw error;
  }
}
