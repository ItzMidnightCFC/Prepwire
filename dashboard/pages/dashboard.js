import { supabase } from "../js/supabase.js";
import { initStreak } from "./streak.js";

export async function init() {
  async function loadUsername() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError.message);
      return;
    }

    if (!user) {
      window.location.href = "";
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("full_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(error.message);
      return;
    }

    let name = data.full_name.trim();

    if (name.length > 0) {
      const words = name.split(" ");

      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

      name = words.join(" ");
    }

    const usernameEl = document.getElementById("username");
    const profileImage = document.getElementById("profileImage");
    const profileText = document.getElementById("profiletext");

    if (usernameEl) {
      usernameEl.textContent = name;

      const firstLetter = usernameEl.textContent.trim().charAt(0);

      if (profileText) {
        profileText.textContent = firstLetter;
      }
    }

    if (profileImage && data.avatar_url) {
      profileImage.src = data.avatar_url;
      profileImage.style.display = "block";

      if (profileText) {
        profileText.style.display = "none";
      }
    }
  }

  async function setDashboardTitle() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error(error.message);
      return;
    }

    if (!user) {
      return;
    }

    const profileEmail = document.getElementById("profileemail");

    if (profileEmail) {
      profileEmail.textContent = user.email;
    }
  }

  async function loadOverallProgress() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError.message);
      return;
    }

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("correct_answers, total_questions")
      .eq("user_id", user.id);

    if (error) {
      console.error(error.message);
      return;
    }

    let totalCorrect = 0;
    let totalQuestions = 0;

    (data || []).forEach((session) => {
      totalCorrect += Number(session.correct_answers) || 0;
      totalQuestions += Number(session.total_questions) || 0;
    });

    let overallProgress = 0;

    if (totalQuestions > 0) {
      overallProgress = Math.round((totalCorrect / totalQuestions) * 100);
    }

    const container = document.querySelector(".progress-container");

    if (!container) {
      return;
    }

    const progress = container.querySelector(".progress");
    const percentText = container.querySelector(".percent");

    if (!progress || !percentText) {
      return;
    }

    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    const offset = circumference - (overallProgress / 100) * circumference;

    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = offset;

    percentText.textContent = `${overallProgress}%`;

    container.dataset.value = overallProgress;
  }

  async function loadTestsCompleted() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError.message);
      return;
    }

    if (!user) {
      return;
    }

    const { count, error } = await supabase
      .from("practice_sessions")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error(error.message);
      return;
    }

    const testsCompleted = document.getElementById("testsCompleted");

    if (testsCompleted) {
      testsCompleted.textContent = count ?? 0;
    }
  }

  async function loadTotalScore() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError.message);
      return;
    }

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("correct_answers")
      .eq("user_id", user.id);

    if (error) {
      console.error(error.message);
      return;
    }

    let totalScore = 0;

    (data || []).forEach((session) => {
      totalScore += Number(session.correct_answers) || 0;
    });

    const totalScoreElement = document.getElementById("totalScore");

    if (totalScoreElement) {
      totalScoreElement.textContent = totalScore;
    }
  }

  setDashboardTitle();
  loadTestsCompleted();
  loadTotalScore();
  initStreak();
  loadUsername();
  loadOverallProgress();

  const phrases = [
    "Sharpen your mind, one question at a time. 💪🏼",
    "Your journey to CBT mastery starts here. 🚃",
    "Practice, learn, succeed. 👍",
    "Turning past questions into future success. 🥳",
    "Where learning meets excellence. 👋🏼",
    "Step in. Level up. Ace it. 👨‍💻",
    "CBT practice made simple and smart. 👌",
    "Every question counts towards greatness. 🙌",
    "Learn. Practice. Conquer. 💪🏼",
    "Small steps today, big wins tomorrow. 👨‍🎓",
  ];

  const randomIndex = Math.floor(Math.random() * phrases.length);

  const phrasesElement = document.getElementById("phrases");

  if (phrasesElement) {
    phrasesElement.textContent = phrases[randomIndex];
  }

  return null;
}
