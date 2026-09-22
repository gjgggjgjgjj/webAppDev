const typeButton = document.getElementById("typeButton");
const typeDropDown = document.getElementById("typeDropDown");

const chooseBoulder = document.getElementById("chooseBoulder");
const chooseSport = document.getElementById("chooseSport");

const sportGrade = document.getElementById("sportGrade");
const boulderGrade = document.getElementById("boulderGrade");

const five8 = document.getElementById("five8")
const five9 = document.getElementById("five9")
const five10 = document.getElementById("five10")
const five11 = document.getElementById("five11")
const five14 = document.getElementById("five14")
const five14plus = document.getElementById("five14plus")

const v1 = document.getElementById("v1")
const v4 = document.getElementById("v4")
const v7 = document.getElementById("v7")
const v9 = document.getElementById("v9")
const v11 = document.getElementById("v11")
const v12 = document.getElementById("v12")
const v13 = document.getElementById("v13")
const v14 = document.getElementById("v14")
     
}


//the main fetch function that we will use
sync function fetchAndDisplay() {
      try {
            const response = await fetch("https://")
            const data = await response.json();
            console.log(data);
      }
      catch (error) {
            console.error("Error fetching data:", error);
      }
}







typeButton.addEventListener("click", () => {
    typeDropDown.style.display =
        typeDropDown.style.display === "block" ? "none" : "block";
});

chooseBoulder.addEventListener("click", () => {
    boulderGrade.style.display = "block";
    sportGrade.style.display = "none";
});

chooseSport.addEventListener("click", () => {
    sportGrade.style.display = "block";
    boulderGrade.style.display = "none";
});

