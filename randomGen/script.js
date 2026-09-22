const typeButton = document.getElementById("typeButton");
const typeDropDown = document.getElementById("typeDropDown");

const chooseBoulder = document.getElementById("chooseBoulder");
const chooseSport = document.getElementById("chooseSport");

const sportGrade = document.getElementById("sportGrade");
const boulderGrade = document.getElementById("boulderGrade");

const climbingDisplay = document.getElementById("climbingDisplay");

let selectedDiscipline = "sport";

//the random pages on wikipedia
const webCragQueries = [
  "Yosemite_Valley",
  "Bishop,_California",
  "Red_River_Gorge",
  "Fontainebleau_rock_climbing",
  "Kalymnos",
  "Frankenjura",
  "Joshua_Tree_National_Park",
  "El_Potrero_Chico"
];

async function fetchAndDisplayRandomRoute(minGrade, maxGrade) {
  climbingDisplay.innerHTML = "<p>Fetching live crag data from the web.....</p>";

  const randomCrag = webCragQueries[Math.floor(Math.random() * webCragQueries.length)];

  //use good old wikipedia
  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${randomCrag}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    const routeGrade = generateGrade(selectedDiscipline, minGrade, maxGrade);

    renderRouteCard({
      areaName: data.title,
      description: data.extract,
      thumbnail: data.thumbnail ? data.thumbnail.source : null,
      wikiUrl: data.content_urls.desktop.page,
      grade: routeGrade,
      type: selectedDiscipline.toUpperCase()
    });

  } catch (error) {
    console.error("Error fetching web data:", error);
    climbingDisplay.innerHTML = "<p style='color: red;'>Failed to fetch crag data from the web. Try again!</p>";
  }
}

function generateGrade(discipline, min, max) {
  const val = Math.floor(Math.random() * (max - min + 1)) + min;
  return discipline === "boulder" ? `V${val}` : `5.${val}`;
}

function renderRouteCard(info) {
  climbingDisplay.innerHTML = "";

  const card = document.createElement("div");
  card.className = "route-card";

  const title = document.createElement("h2");
  title.textContent = `Recommended Area: ${info.areaName}`;

  const gradeInfo = document.createElement("p");
  gradeInfo.innerHTML = `<strong>Grade:</strong> ${info.grade} | <strong>Type:</strong> ${info.type}`;

  const desc = document.createElement("p");
  desc.textContent = info.description;

  card.appendChild(title);
  card.appendChild(gradeInfo);

  //image to add
  if (info.thumbnail) {
    const img = document.createElement("img");
    img.src = info.thumbnail;
    img.alt = info.areaName;
    img.style.width = "100%";
    img.style.borderRadius = "8px";
    img.style.margin = "0.5rem 0";
    card.appendChild(img);
  }

  card.appendChild(desc);

  climbingDisplay.appendChild(card);
}

//ui
typeButton.addEventListener("click", () => {
  typeDropDown.style.display =
    typeDropDown.style.display === "block" ? "none" : "block";
});

chooseBoulder.addEventListener("click", () => {
  selectedDiscipline = "boulder";
  boulderGrade.style.display = "block";
  sportGrade.style.display = "none";
});

chooseSport.addEventListener("click", () => {
  selectedDiscipline = "sport";
  sportGrade.style.display = "block";
  boulderGrade.style.display = "none";
});

//the grade listeners
document.getElementById("five8").addEventListener("click", () => fetchAndDisplayRandomRoute(8, 9));
document.getElementById("five9").addEventListener("click", () => fetchAndDisplayRandomRoute(9, 10));
document.getElementById("five10").addEventListener("click", () => fetchAndDisplayRandomRoute(10, 11));
document.getElementById("five11").addEventListener("click", () => fetchAndDisplayRandomRoute(12, 13));
document.getElementById("five14").addEventListener("click", () => fetchAndDisplayRandomRoute(14, 14));
document.getElementById("five14plus").addEventListener("click", () => fetchAndDisplayRandomRoute(14, 15));

document.getElementById("v1").addEventListener("click", () => fetchAndDisplayRandomRoute(1, 3));
document.getElementById("v4").addEventListener("click", () => fetchAndDisplayRandomRoute(4, 6));
document.getElementById("v7").addEventListener("click", () => fetchAndDisplayRandomRoute(7, 8));
document.getElementById("v9").addEventListener("click", () => fetchAndDisplayRandomRoute(9, 10));
document.getElementById("v11").addEventListener("click", () => fetchAndDisplayRandomRoute(11, 11));
document.getElementById("v12").addEventListener("click", () => fetchAndDisplayRandomRoute(12, 12));
document.getElementById("v13").addEventListener("click", () => fetchAndDisplayRandomRoute(13, 13));
document.getElementById("v14").addEventListener("click", () => fetchAndDisplayRandomRoute(14, 17));

