import { supabase } from "../../js/supabase.js";

const TOP_USERS_COUNT = 10;

let statsChannel = null;
let usersChannel = null;
let initialized = false;

export function init() {
  const topBoxes = document.querySelectorAll(".ovtopbox");

  if (!topBoxes.length) {
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

  async function getOverallLeaderboard() {
    try {
      const { data: stats, error: statsError } = await supabase
        .from("user_stats")
        .select("user_id, overall_xp")
        .order("overall_xp", {
          ascending: false,
        })
        .limit(TOP_USERS_COUNT);

      if (statsError) {
        console.error("Leaderboard stats error:", statsError);
        return [];
      }

      if (!stats || stats.length === 0) {
        return [];
      }

      const userIds = stats.map((user) => user.user_id);

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      if (usersError) {
        console.error("Leaderboard users error:", usersError);
        return [];
      }

      return stats.map((stat) => {
        const profile = users?.find((user) => user.user_id === stat.user_id);

        return {
          id: stat.user_id,
          full_name: profile?.full_name || "Unknown User",
          avatar_url: profile?.avatar_url || null,
          overall_xp: Number(stat.overall_xp || 0),
        };
      });
    } catch (error) {
      console.error("Unexpected leaderboard error:", error);
      return [];
    }
  }

  function highlightPodium(card, isCurrentUser) {
    if (!card) return;

    card.classList.toggle("current-user-podium", isCurrentUser);

    if (isCurrentUser) {
      card.setAttribute("data-current-user", "true");
    } else {
      card.removeAttribute("data-current-user");
    }
  }

  function updatePodiumCard(card, user, rank, currentUserId) {
    if (!card) return;

    const profileContainer = card.querySelector(".profileimage");
    const username = card.querySelector(".usernamebox p");
    const xpElement = card.querySelector(".totalscorebox p");
    const rankElement = card.querySelector(".firsticonbox p");

    highlightPodium(
      card,
      Boolean(user && currentUserId && user.id === currentUserId),
    );

    if (!user) {
      if (rankElement) {
        rankElement.textContent = rank;
      }

      if (username) {
        username.textContent = "No user";
      }

      if (xpElement) {
        xpElement.innerHTML = `
          0
          <span style="font-weight: 600">XP</span>
        `;
      }

      if (profileContainer) {
        profileContainer.innerHTML = "";

        const initial = document.createElement("p");
        initial.textContent = "?";

        profileContainer.appendChild(initial);
      }

      return;
    }

    if (rankElement) {
      rankElement.textContent = rank;
    }

    if (username) {
      username.textContent = user.full_name || "Unknown User";
    }

    if (xpElement) {
      xpElement.innerHTML = `
        ${formatXP(user.overall_xp)}
        <span style="font-weight: 600">XP</span>
      `;
    }

    if (profileContainer) {
      profileContainer.innerHTML = "";

      if (user.avatar_url) {
        const image = document.createElement("img");

        image.src = user.avatar_url;
        image.alt = `${user.full_name || "User"} profile picture`;

        image.onerror = () => {
          profileContainer.innerHTML = "";

          const initial = document.createElement("p");
          initial.textContent = getInitial(user.full_name);

          profileContainer.appendChild(initial);
        };

        profileContainer.appendChild(image);
      } else {
        const initial = document.createElement("p");
        initial.textContent = getInitial(user.full_name);

        profileContainer.appendChild(initial);
      }
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

  function updateGlobalRankings(users, currentUserId) {
    const container = document.querySelector(".globboxcon");

    if (!container) return;

    container.innerHTML = "";

    const remainingUsers = users.slice(3);

    if (remainingUsers.length === 0) {
      const emptyMessage = document.createElement("p");

      emptyMessage.textContent = "No more students yet.";
      emptyMessage.style.padding = "20px";
      emptyMessage.style.color = "#6b6b6b";
      emptyMessage.style.textAlign = "center";

      container.appendChild(emptyMessage);

      return;
    }

    remainingUsers.forEach((user, index) => {
      const actualRank = index + 4;

      const row = document.createElement("div");
      row.className = "globboxes";

      const isCurrentUser = currentUserId && user.id === currentUserId;

      if (isCurrentUser) {
        row.classList.add("current-user-ranking");
        row.setAttribute("data-current-user", "true");
      }

      const rank = document.createElement("p");
      rank.className = "globrank";
      rank.textContent = actualRank;

      const profile = document.createElement("div");
      profile.className = "globprofile";

      createProfile(profile, user);

      const name = document.createElement("p");
      name.className = "globname";
      name.textContent = user.full_name || "Unknown User";

      const xp = document.createElement("p");
      xp.className = "globxp";

      xp.innerHTML = `
        ${formatXP(user.overall_xp)}
        <span style="font-weight: 600">XP</span>
      `;

      row.appendChild(rank);
      row.appendChild(profile);
      row.appendChild(name);
      row.appendChild(xp);

      container.appendChild(row);
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

      xpElement.innerHTML = `
        0<span>XP</span>
      `;

      return;
    }

    const currentIndex = users.findIndex((user) => user.id === currentUser.id);

    if (currentIndex === -1) {
      positionElement.textContent = "—";
      nameElement.textContent = "Not ranked";

      xpElement.innerHTML = `
        0<span>XP</span>
      `;

      return;
    }

    const currentUserData = users[currentIndex];

    positionElement.textContent = `#${currentIndex + 1}`;

    nameElement.textContent = currentUserData.full_name || "Unknown User";

    xpElement.innerHTML = `
      ${formatXP(currentUserData.overall_xp)}
      <span>XP</span>
    `;
  }

  function showLoadingState() {
    topBoxes.forEach((card) => {
      card.classList.remove("current-user-podium");
      card.removeAttribute("data-current-user");

      const username = card.querySelector(".usernamebox p");
      const xp = card.querySelector(".totalscorebox p");

      if (username) {
        username.textContent = "Loading...";
      }

      if (xp) {
        xp.innerHTML = `
          <span style="font-weight: 600">...</span>
        `;
      }
    });

    const container = document.querySelector(".globboxcon");

    if (container) {
      container.innerHTML = `
        <div
          style="
            padding: 25px;
            text-align: center;
            color: #6b6b6b;
            font-size: 13px;
          "
        >
          Loading rankings...
        </div>
      `;
    }
  }

  async function loadOverallLeaderboard() {
    showLoadingState();

    const [leaderboard, currentUser] = await Promise.all([
      getOverallLeaderboard(),
      getCurrentUser(),
    ]);

    const currentUserId = currentUser?.id || null;

    if (!leaderboard.length) {
      updatePodiumCard(topBoxes[0], null, 1, currentUserId);
      updatePodiumCard(topBoxes[1], null, 2, currentUserId);
      updatePodiumCard(topBoxes[2], null, 3, currentUserId);

      const container = document.querySelector(".globboxcon");

      if (container) {
        container.innerHTML = `
          <div
            style="
              padding: 25px;
              text-align: center;
              color: #6b6b6b;
              font-size: 13px;
            "
          >
            No students yet.
          </div>
        `;
      }

      await updateFloatingUser([]);

      return;
    }

    updatePodiumCard(topBoxes[0], leaderboard[0], 1, currentUserId);

    updatePodiumCard(topBoxes[1], leaderboard[1], 2, currentUserId);

    updatePodiumCard(topBoxes[2], leaderboard[2], 3, currentUserId);

    updateGlobalRankings(leaderboard, currentUserId);

    await updateFloatingUser(leaderboard);
  }

  function subscribeToLeaderboard() {
    statsChannel = supabase
      .channel("overall-leaderboard-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_stats",
        },
        () => {
          loadOverallLeaderboard();
        },
      )
      .subscribe();

    usersChannel = supabase
      .channel("overall-leaderboard-users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        () => {
          loadOverallLeaderboard();
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

  loadOverallLeaderboard();
  subscribeToLeaderboard();

  return cleanup;
}
