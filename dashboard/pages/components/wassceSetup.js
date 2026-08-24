export function wasscebody(body) {
  body.innerHTML = `<h1 class="questtext" id='red' >WASSCE Practice Preference </h1>
    <div class="questbody" id="questbody">
      <div class="firstrow">
      <div>
          <label for="Subject" class="preflabels"
            >Exam Mode </label
          >
          <div id="selectcover">
            <select name="examMode">
              <option value="practice">Practice Mode</option>
              <option value="rExam" disabled>Real Exam Mode</option>
            </select>
          </div>
        </div>
        <div>
          <label for="Subject" class="preflabels"
            >Select Subject </label
          >
          <div id="selectcover" onclick='alert('hi')'>
            <select name="Subject" id="subject">
              <option value="english">English Language</option>
              <option value="mathematics">Mathematics</option>
              <option value="economics">Economics</option>
              <option value="biology">Biology</option>
              <option value="physics">Physics</option>
              <option value="government">Government</option>
              <option value="geography">Geography</option>
              <option value="chemistry">Chemistry</option>
              <option value="commerce">Commerce</option>
              <option value="civiledu">Civic Education</option>
              <option value="accounting">Accounting</option>
              <option value="crk">
                Cristian Religious Knowledge
              </option>
              <option value="englishlit">English Literature</option>
            </select>
          </div>
        </div>

      </div>

      <div class="secondrow">
        <div>
          <label for="Subject" class="preflabels"
            >Number Of Questions </label
          >
          <div id="selectcover">
            <select name="noOfquest" id='questionSelect'>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
              <option value="30">30 Questions</option>
            </select>
          </div>
        </div>

        <div>
          <label for="Subject" class="preflabels"
            >Select Time </label
          >
          <div id="selectcover">
            <select name="Time" id='timeSelect'>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
            </select>
          </div>
        </div>
      </div>

      <button class="startbtn" id='startbtn'>Start</button>
    </div>


    
`;

  const questionSelect = document.getElementById("questionSelect");
  const timeSelect = document.getElementById("timeSelect");

  questionSelect.addEventListener("change", function () {
    const value = parseInt(this.value);

    // clear previous options
    timeSelect.innerHTML = "";

    let times = [];

    if (value === 30) {
      times = [5, 10, 15, 20];
    } else if (value === 20) {
      times = [5, 10, 15];
    } else if (value === 15 || value === 10) {
      times = [5, 10];
    }

    // add options
    times.forEach((time) => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time + " minutes";
      timeSelect.appendChild(option);
    });
  });

  startbtn.onclick = () => {
    const savesubject = document.getElementById("subject").value;
    const savenquest = document.getElementById("questionSelect").value;
    const savetime = document.getElementById("timeSelect").value;
    const savesubjecttext = subject.options[subject.selectedIndex].text;

    sessionStorage.setItem("wsubject", savesubject);
    sessionStorage.setItem("wsnq", savenquest);
    sessionStorage.setItem("wtime", savetime);
    sessionStorage.setItem("wtsubject", savesubjecttext);
    sessionStorage.setItem("WexamType", "WASSCE");

    window.open("../../Practice/WASSCE", "_blank");
  };
}
