import { supabase } from "../../js/supabase.js";

const TOP_USERS_COUNT = 20;

let statsChannel = null;
let usersChannel = null;
let initialized = false;

export function init() {
  const weeklyBox = document.querySelector(".weeklybox");
  if (!weeklyBox) {
    return null;
  }

  if (initialized) {
    cleanup();
  }

  initialized = true;

  function getInitial(fullName) {
    if (!fullName) return "?";

    return fullName.trim().charAt(0).toUpperCase();
  }

  function formatXP(xp) {
    return Number(xp || 0).toLocaleString();
  }

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  }

  async function getWeeklyLeaderboard() {
    try {
      const { data: stats, error: statsError } = await supabase
        .from("user_stats")
        .select("user_id, weekly_xp")
        .order("weekly_xp", {
          ascending: false,
        })
        .limit(TOP_USERS_COUNT);

      if (statsError) {
        console.error("Weekly leaderboard stats error:", statsError);

        return [];
      }

      if (!stats || stats.length === 0) {
        return [];
      }

      const userIds = stats.map((user) => user.user_id).filter(Boolean);

      if (!userIds.length) {
        return [];
      }

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      if (usersError) {
        console.error("Weekly leaderboard users error:", usersError);

        return [];
      }

      return stats.map((stat) => {
        const profile = users?.find(
          (user) => user.user_id === stat.user_id,
        );

        return {
          id: stat.user_id,
          full_name: profile?.full_name || "Unknown User",
          avatar_url: profile?.avatar_url || null,
          weekly_xp: Number(stat.weekly_xp || 0),
        };
      });
    } catch (error) {
      console.error("Unexpected weekly leaderboard error:", error);

      return [];
    }
  }

  function highlightRow(row, isCurrentUser) {
    if (!row) return;

    row.classList.toggle("current-user", isCurrentUser);

    if (isCurrentUser) {
      row.setAttribute("data-current-user", "true");
    } else {
      row.removeAttribute("data-current-user");
    }
  }

  function createProfile(profile, user) {
    if (user.avatar_url) {
      const image = document.createElement("img");

      image.src = user.avatar_url;

      image.alt = `${user.full_name || "User"} profile picture`;

      image.onerror = () => {
        profile.innerHTML = "";

        const initial = document.createElement("p");

        initial.textContent = getInitial(user.full_name);

        profile.appendChild(initial);
      };

      profile.appendChild(image);
    } else {
      const initial = document.createElement("p");

      initial.textContent = getInitial(user.full_name);

      profile.appendChild(initial);
    }
  }

  const medalSVGs = {
  1: `
    <svg width="50px" height="50px" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 8L24 31L36 17L48 31L59 8" fill="#2563EB"/>
      <path d="M13 8L24 31L36 17L48 31L59 8" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 8L31 22" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <path d="M47 8L41 22" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>

      <circle cx="36" cy="45" r="20" fill="#F5B942" stroke="#D89A16" stroke-width="3"/>
      <circle cx="36" cy="45" r="15" fill="#FFD76A"/>

      <text
        x="36"
        y="51"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="18"
        font-weight="700"
        fill="#8A5A00"
      >1</text>
    </svg>
  `,

  2: `
    <svg width="50px" height="50px" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 8L24 31L36 17L48 31L59 8" fill="#2563EB"/>
      <path d="M13 8L24 31L36 17L48 31L59 8" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 8L31 22" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <path d="M47 8L41 22" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>

      <circle cx="36" cy="45" r="20" fill="#BFC3C9" stroke="#969BA3" stroke-width="3"/>
      <circle cx="36" cy="45" r="15" fill="#E1E4E8"/>

      <text
        x="36"
        y="51"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="18"
        font-weight="700"
        fill="#686D75"
      >2</text>
    </svg>
  `,

  3: `
    <svg width="50px" height="50px" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 8L24 31L36 17L48 31L59 8" fill="#2563EB"/>
      <path d="M13 8L24 31L36 17L48 31L59 8" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 8L31 22" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <path d="M47 8L41 22" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>

      <circle cx="36" cy="45" r="20" fill="#B87333" stroke="#965A25" stroke-width="3"/>
      <circle cx="36" cy="45" r="15" fill="#D89A63"/>

      <text
        x="36"
        y="51"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="18"
        font-weight="700"
        fill="#70401F"
      >3</text>
    </svg>
  `,
};

  function createSimpleRankSVG(rank) {
    return `
      <svg width="40px" height="40px" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="24" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3"/>
        <circle cx="36" cy="36" r="19" fill="white"/>
        <text
          x="36"
          y="43"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="21"
          font-weight="700"
          fill="#2563EB"
        >${rank}</text>
      </svg>
    `;
  }

  function createWeeklyRow(user, rank, currentUserId) {
    const row = document.createElement("div");

    row.className = "weekboxes";

    const isCurrentUser = Boolean(
      currentUserId && user.id === currentUserId,
    );

    highlightRow(row, isCurrentUser);

    const icon = document.createElement("div");

    icon.className = "weekicons";

    icon.innerHTML =
      medalSVGs[rank] || createSimpleRankSVG(rank);

    const profile = document.createElement("div");

    profile.className = "weekprofile";

    createProfile(profile, user);

    const name = document.createElement("p");

    name.className = "weekname";

    name.textContent = user.full_name || "Unknown User";

    const xp = document.createElement("p");

    xp.className = "weekxp";

    xp.innerHTML = `
      ${formatXP(user.weekly_xp)}
      <span style="font-weight: 600">XP</span>
    `;

    row.appendChild(icon);

    row.appendChild(profile);

    row.appendChild(name);

    row.appendChild(xp);

    return row;
  }

  function updateWeeklyRankings(users, currentUserId) {
    weeklyBox.querySelectorAll(".weekboxes").forEach((row) => {
      row.remove();
    });

    if (!users.length) {
      const empty = document.createElement("div");

      empty.className = "weekboxes";

      empty.innerHTML = `
        <p
          style="
            width:100%;
            text-align:center;
            color:#6b6b6b;
            font-size:13px;
            margin:10px 0;
          "
        >
          No weekly rankings yet.
        </p>
      `;

      weeklyBox.appendChild(empty);

      return;
    }

    users.forEach((user, index) => {
      const row = createWeeklyRow(
        user,
        index + 1,
        currentUserId,
      );

      weeklyBox.appendChild(row);
    });
  }

  async function updateFloatingUser(users) {
    const positionElement = document.getElementById("fPosition");

    const nameElement = document.querySelector(".floatingusername");

    const xpElement = document.getElementById("floatingXP");

    if (!positionElement || !nameElement || !xpElement) {
      return;
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      positionElement.textContent = "—";

      nameElement.textContent = "Not logged in";

      xpElement.innerHTML = `0<span>XP</span>`;

      return;
    }

    const currentIndex = users.findIndex(
      (user) => user.id === currentUser.id,
    );

    if (currentIndex === -1) {
      positionElement.textContent = "—";

      nameElement.textContent = "Not ranked";

      xpElement.innerHTML = `0<span>XP</span>`;

      return;
    }

    const currentUserData = users[currentIndex];

    positionElement.textContent = `#${currentIndex + 1}`;

    nameElement.textContent =
      currentUserData.full_name || "Unknown User";

    xpElement.innerHTML = `
      ${formatXP(currentUserData.weekly_xp)}
      <span>XP</span>
    `;
  }

  function showLoadingState() {
    weeklyBox.querySelectorAll(".weekboxes").forEach((row) => {
      row.remove();
    });

    const loading = document.createElement("div");

    loading.className = "weekboxes";

    loading.innerHTML = `
      <p
        style="
          width:100%;
          text-align:center;
          color:#6b6b6b;
          font-size:13px;
          margin:10px 0;
        "
      >
        Loading rankings...
      </p>
    `;

    weeklyBox.appendChild(loading);
  }

  async function loadWeeklyLeaderboard() {
    showLoadingState();

    const [leaderboard, currentUser] = await Promise.all([
      getWeeklyLeaderboard(),
      getCurrentUser(),
    ]);

    const currentUserId = currentUser?.id || null;

    updateWeeklyRankings(
      leaderboard,
      currentUserId,
    );

    await updateFloatingUser(leaderboard);
  }

  function subscribeToLeaderboard() {
    statsChannel = supabase
      .channel("weekly-leaderboard-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_stats",
        },
        () => {
          loadWeeklyLeaderboard();
        },
      )
      .subscribe();

    usersChannel = supabase
      .channel("weekly-leaderboard-users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        () => {
          loadWeeklyLeaderboard();
        },
      )
      .subscribe();
  }

  function cleanup() {
    if (statsChannel) {
      supabase.removeChannel(statsChannel);

      statsChannel = null;
    }

    if (usersChannel) {
      supabase.removeChannel(usersChannel);

      usersChannel = null;
    }

    initialized = false;
  }

  loadWeeklyLeaderboard();

  subscribeToLeaderboard();

  return cleanup;
          }
