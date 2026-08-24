export function init() {
  const selectyear = document.getElementById("selectyear");
  const subjectSelect = document.getElementById("subject");
  const selecttype = document.getElementById("selecttype");
  const searchbtn = document.getElementById("searchbtn");
  const questLoadBody = document.getElementById("questLoadBody");
  const loadpquestsbox = questLoadBody?.querySelector(".loadpquestsbox");

  const API_KEY = "ALOC-042dc5afca780faf2da4";

  const subjectYears = {
    "English language": [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
    Mathematics: [2006, 2007, 2008, 2009, 2013],
    Commerce: [
      1900, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
      2011, 2012, 2013, 2016,
    ],
    Accounting: [
      1997, 2004, 2006, 2007, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
    ],
    Biology: [2003, 2004, 2005, 2006, 2008, 2009, 2010, 2011, 2012],
    Physics: [2006, 2007, 2009, 2010, 2011, 2012],
    Chemistry: [2001, 2002, 2003, 2004, 2005, 2006, 2010],
    "English literature": [2006, 2007, 2008, 2009, 2010, 2012, 2013, 2015],
    Government: [
      1999, 2000, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2016,
    ],
    "Christian Religious Knowledge": [
      2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2015,
    ],
    Geography: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
    Economics: [
      2001, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
    ],
  };

  function updateYears() {
    const selectedSubject = subjectSelect.value;
    const allowedYears = subjectYears[selectedSubject] || [];

    selectyear.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "All";
    allOption.textContent = "All";
    allOption.selected = true;

    selectyear.appendChild(allOption);

    [...allowedYears]
      .sort((a, b) => b - a)
      .forEach((year) => {
        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        selectyear.appendChild(option);
      });
  }

  function showLoader() {
    searchbtn.disabled = true;

    searchbtn.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        width="25px"
        height="25px"
        style="
          shape-rendering: auto;
          display: block;
          background: transparent;
        "
      >
        <g>
          <circle
            stroke-dasharray="188.49555921538757 64.83185307179586"
            r="40"
            stroke-width="9"
            stroke="#2563eb"
            fill="none"
            cy="50"
            cx="50"
          >
            <animateTransform
              keyTimes="0;1"
              values="0 50 50;360 50 50"
              dur="1s"
              repeatCount="indefinite"
              type="rotate"
              attributeName="transform"
            />
          </circle>
        </g>
      </svg>
    `;
  }

  function resetSearchButton() {
    searchbtn.disabled = false;
    searchbtn.textContent = "Search";
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

  function showMessage(message) {
    if (!loadpquestsbox) return;

    loadpquestsbox.innerHTML = `
      <div
        style="
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #6d6d6d;
          padding: 20px;
        "
      >
        <p>${escapeHTML(message)}</p>
      </div>
    `;
  }

  function getQuestionYear(question) {
    return question.year || question.exam_year || question.examYear || "";
  }

  function updateResultHeader(subject, year, examType, count) {
    const header = questLoadBody?.querySelector(".topload");

    if (!header) return;

    header.innerHTML = `
      <div>
        <h2>Search Result</h2>
      </div>

      <div class="loaddetails">
        <h3>${escapeHTML(subject)}</h3>

        <div class="fld">
          <p>
            ${year === "All" ? "All Years" : escapeHTML(year)}
          </p>

          <li>
            ${escapeHTML(examType)}
          </li>

          <p>
            ${count}
            ${count === 1 ? "question" : "questions"}
          </p>
        </div>
      </div>
    `;
  }

  function renderQuestions(questions) {
    if (!loadpquestsbox) return;

    loadpquestsbox.innerHTML = "";

    questions.forEach((q, index) => {
      const questionElement = document.createElement("div");

      questionElement.className = "past-question";

      const year = getQuestionYear(q);

      questionElement.innerHTML = `
        <div class="past-question-number">
          <span>
            Question ${index + 1}
          </span>

          ${
            year
              ? `
                <span class="past-question-year">
                  ${escapeHTML(year)}
                </span>
              `
              : ""
          }
        </div>

        <div class="past-question-text">
          ${escapeHTML(q.question)}
        </div>

        <div class="past-question-options">

          <div class="past-question-option">
            <strong>A.</strong>
            <span>
              ${escapeHTML(q.option?.a)}
            </span>
          </div>

          <div class="past-question-option">
            <strong>B.</strong>
            <span>
              ${escapeHTML(q.option?.b)}
            </span>
          </div>

          <div class="past-question-option">
            <strong>C.</strong>
            <span>
              ${escapeHTML(q.option?.c)}
            </span>
          </div>

          <div class="past-question-option">
            <strong>D.</strong>
            <span>
              ${escapeHTML(q.option?.d)}
            </span>
          </div>

        </div>
      `;

      loadpquestsbox.appendChild(questionElement);
    });
  }

  async function getQuestion(subject, type) {
    const API_URL = `https://questions.aloc.com.ng/api/v2/q?subject=${encodeURIComponent(
      subject,
    )}&type=${type}`;

    console.log("ALOC request:", API_URL);

    const response = await fetch(API_URL, {
      method: "GET",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        AccessToken: API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("ALOC error:", response.status, errorText);

      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    console.log("ALOC response:", data);

    return data.data;
  }

  async function searchQuestions() {
    const subject = subjectSelect.value;
    const selectedYear = selectyear.value;
    const examType = selecttype.value;

    if (!subject) {
      showMessage("Please select a subject.");
      return;
    }

    showLoader();

    showMessage("Loading questions...");

    try {
      const type = examType === "JAMB" ? "UTME" : "WASSCE";

      const questions = [];

      const numberOfRequests = 5;

      for (let i = 0; i < numberOfRequests; i++) {
        try {
          const question = await getQuestion(subject, type);

          if (question) {
            questions.push(question);
          }

          if (selectedYear !== "All") {
            const questionYear = getQuestionYear(question);

            if (String(questionYear) === String(selectedYear)) {
              continue;
            }
          }
        } catch (error) {
          console.error(`Question ${i + 1} failed:`, error);
        }
      }

      let filteredQuestions = questions;

      if (selectedYear !== "All") {
        filteredQuestions = questions.filter((question) => {
          return String(getQuestionYear(question)) === String(selectedYear);
        });
      }

      if (!filteredQuestions.length) {
        showMessage(
          selectedYear === "All"
            ? "No questions were found."
            : `No ${subject} questions were found for ${selectedYear}.`,
        );

        return;
      }

      const uniqueQuestions = [];
      const seen = new Set();

      filteredQuestions.forEach((question) => {
        const key = question.id || question.question;

        if (!key || !seen.has(key)) {
          if (key) {
            seen.add(key);
          }

          uniqueQuestions.push(question);
        }
      });

      updateResultHeader(
        subject,
        selectedYear,
        examType,
        uniqueQuestions.length,
      );

      renderQuestions(uniqueQuestions);
    } catch (error) {
      console.error("Past questions request failed:", error);

      showMessage("Unable to load questions right now. Please try again.");
    } finally {
      resetSearchButton();
    }
  }

  subjectSelect.addEventListener("change", updateYears);

  searchbtn.addEventListener("click", searchQuestions);

  updateYears();

  return null;
}
