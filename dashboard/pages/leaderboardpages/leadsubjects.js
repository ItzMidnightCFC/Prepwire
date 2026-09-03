import { supabase } from "../../js/supabase.js";

const subjectNames = {
  english: "English Language",
  mathematics: "Mathematics",
  economics: "Economics",
  biology: "Biology",
  physics: "Physics",
  government: "Government",
  geography: "Geography",
  chemistry: "Chemistry",
  commerce: "Commerce",
  civiledu: "Civic Education",
  accounting: "Accounting",
  crk: "Christian Religious Knowledge",
  englishlit: "English Literature",
};

let subjectSelect = null;
let podiumContainer = null;
let rankingContainer = null;
let rankingDetails = null;
let floatingPosition = null;
let floatingXP = null;
let floatingUsername = null;

let currentUser = null;
let subjectChangeHandler = null;

function refreshDOM() {
  subjectSelect = document.getElementById("subject");
  podiumContainer = document.querySelector(".ovboxcons");
  rankingContainer = document.querySelector(".globboxcon");
  rankingDetails = document.querySelector(".globdetails");
  floatingPosition = document.getElementById("fPosition");
  floatingXP = document.getElementById("floatingXP");
  floatingUsername = document.querySelector(".floatingusername");
}

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitial(name) {
  if (!name) {
    return "?";
  }

  return name.trim().charAt(0).toUpperCase();
}

function formatNumber(number) {
  return Number(number || 0).toLocaleString();
}

async function initializeLeaderboard() {
  try {
    refreshDOM();

    if (!subjectSelect) {
      console.error("Subject leaderboard DOM was not found.");
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Unable to get current user:", error);
    }

    currentUser = user || null;

    await loadLeaderboard();
  } catch (error) {
    console.error("Leaderboard initialization error:", error);
    showError("Unable to load leaderboard.");
  }
}

async function loadLeaderboard() {
  refreshDOM();

  const selectedSubject = subjectSelect?.value;

  if (!selectedSubject) {
    showError("No subject selected.");
    return;
  }

  const subjectName = subjectNames[selectedSubject] || selectedSubject;

  if (rankingDetails) {
    rankingDetails.textContent = `Students with the highest XP on ${subjectName}`;
  }

  if (rankingContainer) {
    rankingContainer.innerHTML = `
      <div style="
        padding: 30px;
        text-align: center;
        color: #6b6b6b;
        font-size: 13px;
      ">
        Loading leaderboard...
      </div>
    `;
  }

  if (podiumContainer) {
    podiumContainer.innerHTML = `
      <div style="
        padding: 30px;
        text-align: center;
        color: #6b6b6b;
        font-size: 13px;
      ">
        Loading...
      </div>
    `;
  }

  const { data, error } = await supabase
    .from("leaderboard_profiles")
    .select(
      `
      user_id,
      subject,
      xp,
      full_name,
      avatar_url
    `,
    )
    .eq("subject", selectedSubject)
    .order("xp", { ascending: false });

  if (error) {
    console.error("Leaderboard error:", error);
    showError("Unable to load leaderboard.");
    return;
  }

  if (!data || data.length === 0) {
    showEmptyState(subjectName);
    return;
  }

  const leaderboard = data.map((student) => ({
    user_id: student.user_id,
    subject: student.subject,
    total_xp: Number(student.xp) || 0,
    full_name: student.full_name || "Student",
    avatar_url: student.avatar_url || null,
  }));

  leaderboard.sort((a, b) => {
    return b.total_xp - a.total_xp;
  });

  renderPodium(leaderboard);
  renderRankings(leaderboard);
  updateFloatingUser(leaderboard);
}

function renderPodium(leaderboard) {
  refreshDOM();

  if (!podiumContainer) {
    return;
  }

  const topThree = leaderboard.slice(0, 3);

  podiumContainer.innerHTML = "";

  if (topThree.length === 0) {
    podiumContainer.innerHTML = `
      <p style="
        padding: 30px;
        color: #6b6b6b;
      ">
        No students yet.
      </p>
    `;

    return;
  }

  topThree.forEach((student, index) => {
    const rank = index + 1;
    const card = createPodiumCard(student, rank);

    podiumContainer.appendChild(card);
  });
}

function createPodiumCard(student, rank) {
  const card = document.createElement("div");

  card.className = "ovtopbox";

  if (currentUser && currentUser.id === student.user_id) {
    card.classList.add("current-user-podium");
  }

  let profileHTML;

  if (student.avatar_url) {
    profileHTML = `
      <img
        src="${escapeHTML(student.avatar_url)}"
        alt="${escapeHTML(student.full_name)}"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      >
      <p style="display:none;">
        ${escapeHTML(getInitial(student.full_name))}
      </p>
    `;
  } else {
    profileHTML = `
      <p>
        ${escapeHTML(getInitial(student.full_name))}
      </p>
    `;
  }

  card.innerHTML = `
    <div class="firsticonbox">
      <p>${rank}</p>
    </div>

    <div class="profileimage">
      ${profileHTML}
    </div>

    <div class="usernamebox">
      <p title="${escapeHTML(student.full_name)}">
        ${escapeHTML(student.full_name)}
      </p>
    </div>

    <div class="totalscorebox">
      <p>
        ${formatNumber(student.total_xp)}
        <span style="font-weight: 600">XP</span>
      </p>
    </div>

    <div class="svgposbox">
      ${createMedalSVG(rank)}
    </div>
  `;

  return card;
}

function renderRankings(leaderboard) {
  refreshDOM();

  if (!rankingContainer) {
    return;
  }

  rankingContainer.innerHTML = "";

  const remaining = leaderboard.slice(3);

  if (remaining.length === 0) {
    rankingContainer.innerHTML = `
      <div style="
        padding: 20px;
        text-align: center;
        color: #6b6b6b;
        font-size: 13px;
      ">
        No more students to display.
      </div>
    `;

    return;
  }

  remaining.forEach((student, index) => {
    const rank = index + 4;

    const row = createRankingRow(student, rank);

    rankingContainer.appendChild(row);
  });
}

function createRankingRow(student, rank) {
  const row = document.createElement("div");

  row.className = "globboxes";

  if (currentUser && currentUser.id === student.user_id) {
    row.classList.add("current-user-ranking");
  }

  let profileHTML;

  if (student.avatar_url) {
    profileHTML = `
      <img
        src="${escapeHTML(student.avatar_url)}"
        alt="${escapeHTML(student.full_name)}"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      >
      <p style="display:none;">
        ${escapeHTML(getInitial(student.full_name))}
      </p>
    `;
  } else {
    profileHTML = `
      <p>
        ${escapeHTML(getInitial(student.full_name))}
      </p>
    `;
  }

  row.innerHTML = `
    <p class="globrank">
      ${rank}
    </p>

    <div class="globprofile">
      ${profileHTML}
    </div>

    <p
      class="globname"
      title="${escapeHTML(student.full_name)}"
    >
      ${escapeHTML(student.full_name)}
    </p>

    <p class="globxp">
      ${formatNumber(student.total_xp)}
      <span style="font-weight: 600">XP</span>
    </p>
  `;

  return row;
}

function updateFloatingUser(leaderboard) {
  refreshDOM();

  if (!floatingPosition || !floatingXP) {
    return;
  }

  if (!currentUser) {
    floatingPosition.textContent = "--";
    floatingXP.innerHTML = `0<span>XP</span>`;

    if (floatingUsername) {
      floatingUsername.textContent = "You";
    }

    return;
  }

  const index = leaderboard.findIndex(
    (student) => student.user_id === currentUser.id,
  );

  if (index === -1) {
    floatingPosition.textContent = "--";

    floatingXP.innerHTML = `
      0<span>XP</span>
    `;

    if (floatingUsername) {
      floatingUsername.textContent = "You";
    }

    return;
  }

  const student = leaderboard[index];

  floatingPosition.textContent = `#${index + 1}`;

  floatingXP.innerHTML = `
    ${formatNumber(student.total_xp)}
    <span>XP</span>
  `;

  if (floatingUsername) {
    floatingUsername.textContent = student.full_name;
  }
}

function createMedalSVG(rank) {
  if (rank === 1) {
    return `
      <svg
        width="60"
        height="60"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 45C34 41 30 35 28 28C22 28 17 30 13 34C19 33 24 35 28 39C23 39 18 41 14 45C20 43 26 44 31 47C27 50 24 53 22 57C28 54 34 51 40 49Z"
          fill="#2563EB"
        />

        <path
          d="M56 45C62 41 66 35 68 28C74 28 79 30 83 34C77 33 72 35 68 39C73 39 78 41 82 45C76 43 70 44 65 47C69 50 72 53 74 57C68 54 62 51 56 49Z"
          fill="#2563EB"
        />

        <path
          d="M32 30L35 15L41 23L48 10L55 23L61 15L64 30Z"
          fill="#F59E0B"
        />

        <path
          d="M36 25L41 27L48 17L55 27L60 25"
          stroke="#FDE68A"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle
          cx="48"
          cy="51"
          r="18"
          fill="#FBBF24"
          stroke="#D97706"
          stroke-width="3"
        />

        <circle
          cx="48"
          cy="51"
          r="13"
          stroke="#FDE68A"
          stroke-width="2.5"
        />

        <text
          x="48"
          y="58"
          text-anchor="middle"
          font-family="Arial"
          font-size="22"
          font-weight="800"
          fill="#2563EB"
        >1</text>

        <path
          d="M29 80H67"
          stroke="#2563EB"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  if (rank === 2) {
    return `
      <svg
        width="50"
        height="50"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 45C34 41 30 35 28 28C22 28 17 30 13 34C19 33 24 35 28 39C23 39 18 41 14 45C20 43 26 44 31 47C27 50 24 53 22 57C28 54 34 51 40 49Z"
          fill="#64748B"
        />

        <path
          d="M56 45C62 41 66 35 68 28C74 28 79 30 83 34C77 33 72 35 68 39C73 39 78 41 82 45C76 43 70 44 65 47C69 50 72 53 74 57C68 54 62 51 56 49Z"
          fill="#64748B"
        />

        <path
          d="M32 30L35 15L41 23L48 10L55 23L61 15L64 30Z"
          fill="#CBD5E1"
        />

        <circle
          cx="48"
          cy="51"
          r="18"
          fill="#CBD5E1"
          stroke="#94A3B8"
          stroke-width="3"
        />

        <circle
          cx="48"
          cy="51"
          r="13"
          stroke="#F8FAFC"
          stroke-width="2.5"
        />

        <text
          x="48"
          y="58"
          text-anchor="middle"
          font-family="Arial"
          font-size="22"
          font-weight="800"
          fill="#334155"
        >2</text>

        <path
          d="M29 80H67"
          stroke="#2563EB"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  return `
    <svg
      width="40"
      height="40"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 45C34 41 30 35 28 28C22 28 17 30 13 34C19 33 24 35 28 39C23 39 18 41 14 45C20 43 26 44 31 47C27 50 24 53 22 57C28 54 34 51 40 49Z"
        fill="#92400E"
      />

      <path
        d="M56 45C62 41 66 35 68 28C74 28 79 30 83 34C77 33 72 35 68 39C73 39 78 41 82 45C76 43 70 44 65 47C69 50 72 53 74 57C68 54 62 51 56 49Z"
        fill="#92400E"
      />

      <path
        d="M32 30L35 15L41 23L48 10L55 23L61 15L64 30Z"
        fill="#B45309"
      />

      <circle
        cx="48"
        cy="51"
        r="18"
        fill="#CD7F32"
        stroke="#92400E"
        stroke-width="3"
      />

      <circle
        cx="48"
        cy="51"
        r="13"
        stroke="#FDE68A"
        stroke-width="2.5"
      />

      <text
        x="48"
        y="58"
        text-anchor="middle"
        font-family="Arial"
        font-size="22"
        font-weight="800"
        fill="#7C2D12"
      >3</text>

      <path
        d="M29 80H67"
        stroke="#2563EB"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function showEmptyState(subjectName) {
  refreshDOM();

  if (rankingContainer) {
    rankingContainer.innerHTML = `
      <div style="
        padding: 30px;
        text-align: center;
        color: #6b6b6b;
        font-size: 13px;
      ">
        No practice records for
        ${escapeHTML(subjectName)} yet.
      </div>
    `;
  }

  if (podiumContainer) {
    podiumContainer.innerHTML = "";
  }

  if (floatingPosition) {
    floatingPosition.textContent = "--";
  }

  if (floatingXP) {
    floatingXP.innerHTML = `
      0<span>XP</span>
    `;
  }

  if (floatingUsername) {
    floatingUsername.textContent = "You";
  }
}

function showError(message) {
  refreshDOM();

  if (rankingContainer) {
    rankingContainer.innerHTML = `
      <div style="
        padding: 30px;
        text-align: center;
        color: #dc2626;
        font-size: 13px;
      ">
        ${escapeHTML(message)}
      </div>
    `;
  }

  if (podiumContainer) {
    podiumContainer.innerHTML = "";
  }
}

function setupSubjectListener() {
  refreshDOM();

  if (!subjectSelect) {
    return;
  }

  if (subjectChangeHandler) {
    subjectSelect.removeEventListener("change", subjectChangeHandler);
  }

  subjectChangeHandler = async () => {
    await loadLeaderboard();
  };

  subjectSelect.addEventListener("change", subjectChangeHandler);
}

export async function init() {
  refreshDOM();

  if (!subjectSelect) {
    console.error(
      "Subject leaderboard cannot initialize because #subject does not exist.",
    );
    return;
  }

  setupSubjectListener();

  await initializeLeaderboard();
}
