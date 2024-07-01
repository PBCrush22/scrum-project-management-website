import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  getDoc,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbyuRShsNdaTzIcuKKzlvTDl8bCDr8pJY",
  authDomain: "fit2101-project-database.firebaseapp.com",
  databaseURL:
    "https://fit2101-project-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fit2101-project-database",
  storageBucket: "fit2101-project-database.appspot.com",
  messagingSenderId: "841276992676",
  appId: "1:841276992676:web:c7761b64a8d7d43d230a31",
  measurementId: "G-9936B4VLCD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "Data Diver");
const db = getFirestore(app);
const productBacklogButton = document.getElementById("product_backlog_button");
const scumboardButton = document.getElementById("scrum_board_button");
const teamMemberButton = document.getElementById("team_member_button");
const changePassButton = document.getElementById("changePasswordLink")
const checkAdmin = window.history.state.isAdmin;

console.log(window.history.state)

scumboardButton.addEventListener("click", () => {
  const routeTo = "scrum-board.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState({ username: username, isAdmin: admin }, "", routeTo);
  window.location.href = routeTo; // Redirect to the desired page
});

productBacklogButton.addEventListener("click", () => {
  const routeTo = "product-backlog.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState({ username: username, isAdmin: admin }, "", routeTo);
  window.location.href = routeTo; // Redirect to the desired page
});

if (checkAdmin === "true") {
  teamMemberButton.style.display = "block"; // Show the button
  teamMemberButton.addEventListener("click", () => {
    const routeTo = "team-member.html";
    const username = window.history.state.username;
    const admin = window.history.state.isAdmin;
    window.history.pushState(
      { username: username, isAdmin: admin },
      "",
      routeTo
    );
    window.location.href = routeTo; // Redirect to the desired page
  });
}
else{
  teamMemberButton.style.display = "hide"; // Hide the button
}

changePassButton.addEventListener("click", () => {
  const routeTo = "change-password.html"
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState(
    { username: username, isAdmin: admin, previousPage: "scrum-board.html" },
    "",
    routeTo
  );
  window.location.href = routeTo; // Redirect to the desired page
})

document
  .getElementById("createSprintButton")
  .addEventListener("click", async () => {
    try {
      // Get a reference to the "sprints" and "modals" collections in Firestore
      const sprintsCollection = collection(db, "sprints");
      const modalsCollection = collection(db, "modals");

      // Add a new document with a unique ID to the "sprints" collection
      const sprintDocRef = await addDoc(sprintsCollection, {
        name: "",
        startDate: "",
        endDate: "",
        notStarted: [],
        inProgress: [],
        completed: [],
        addedTaskID: [],
        removedTaskID: [],
        storyPoint: 0,
        modal: false,
      });

      // Add a new document with a unique ID to the "modals" collection
      const modalDocRef = await addDoc(modalsCollection, {
        sprint: sprintDocRef.id, // Store the sprint ID in the modal document
        sprintChartData: {},
      });

      // Redirect to the sprint backlog page with the sprint ID
      const routeTo = `sprint-backlog.html?id=${sprintDocRef.id}`
      const username = window.history.state.username;
      const admin = window.history.state.isAdmin;
      window.history.pushState(
        { username: username, isAdmin: admin },
        "",
        routeTo
      );
      window.location.href = routeTo;
    } catch (error) {
      console.error("Error adding sprint and modal: ", error);
    }
  });

function displaySprintBacklogs() {
  const sprintsContainer = document.getElementById("sprintsContainer");
  const sprintsCollection = collection(db, "sprints");

  // Get all documents in the "sprints" collection
  getDocs(sprintsCollection)
    .then((querySnapshot) => {
      querySnapshot.forEach(async (docs) => {
        const sprintData = docs.data();
        const sprintId = docs.id; // Extract the sprintId here

        // Create a card or element to display sprintData.name and sprintData.date
        const sprintCard = document.createElement("div");
        sprintCard.className = "card"; // Add class for styling
        sprintCard.setAttribute("data-sprint-id", sprintId);

        // Close button
        const closeButton = document.createElement("div");
        closeButton.className = "close-button";
        closeButton.innerText = "x";
        closeButton.addEventListener("click", async (event) => {
          // Prevent the click event from propagating to the card click event
          event.stopPropagation();
          const confirmDelete = confirm("Do you want to delete this sprint?");
          if (confirmDelete) {
            await deleteDoc(doc(db, "sprints", sprintId));

            sprintCard.remove();
          }
        });

        const chartButton = document.createElement("div");
        chartButton.className = "chart-button";
        chartButton.innerText = "Burndown Chart";
        chartButton.addEventListener("click", async (event) => {
          // Prevent the click event from propagating to the card click event
          event.stopPropagation();
          if (sprintData.modal === false) {
            const modal = createAndDisplayModal(sprintId);
            // modal.style.display = "block";
          }
        });

        // Card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.innerHTML = `
          <h5 class="card-title">${sprintData.name}</h5>
          <p class="card-text">${sprintData.startDate} - ${sprintData.endDate}</p>
        `;

        // Append close button and card body to the card
        sprintCard.appendChild(closeButton);
        sprintCard.appendChild(cardBody);
        sprintCard.appendChild(chartButton);

        // Append the card to the container
        sprintsContainer.appendChild(sprintCard);

        // Attach a click event listener to the card
        sprintCard.addEventListener("click", () => {
          // Construct the URL with the sprintId parameter and navigate to the Sprint Backlog page
          const routeTo = `sprint-backlog.html?id=${sprintId}`;
          const username = window.history.state.username;
          const admin = window.history.state.isAdmin;
          window.history.pushState(
            { username: username, isAdmin: admin },
            "",
            routeTo
          );
          window.location.href = routeTo; // Redirect to the desired page
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching sprint backlogs: ", error);
    });
}

async function createAndDisplayModal(sprintId) {
  // Create modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <canvas id="burndownChart-${sprintId}" width="400" height="200"></canvas>
    </div>
  `;

  // Modal close button functionality
  const closeButton = modal.querySelector(".close");
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Append the modal to the body or another container
  document.body.appendChild(modal);

  try {
    // Display the modal if it's not already displayed
    if (!modal.style.display || modal.style.display === "none") {
      modal.style.display = "block";
    }
  } catch (error) {
    console.error("Error displaying modal: ", error);
  }

  // Fetch and display data
  try {

    // Generate burndown chart using Chart.js
    const ctx = modal
      .querySelector(`#burndownChart-${sprintId}`)
      .getContext("2d");
    const dates = await getDatesForSprint(sprintId);
    const idealBurndownData=await createIdealBurndownChartData(sprintId)
    const actualBurndownData = []
    const totalStoryPoints = await calculateTotalStoryPoints(sprintId);

    const modalCollection = collection(db, "modals");
    const querySnapshot = await getDocs(modalCollection);
    querySnapshot.forEach((docs) => {
      const data = docs.data();
      if (data.sprint=== sprintId) {
        const sprintChartData = data.sprintChartData;
        const entries = Object.entries(sprintChartData);

        // Sort the array of key-value pairs based on the dates (assuming date format is DD-MM-YYYY)
        entries.sort((a, b) => {
            const dateA = new Date(a[0].split('-').reverse().join('-'));
            const dateB = new Date(b[0].split('-').reverse().join('-'));
            return dateA - dateB;
        });

        // Convert the sorted array back to an object
        const sortedSprintChartData = Object.fromEntries(entries);

        const dates = Object.keys(sortedSprintChartData);
        const storyPoints = Object.values(sortedSprintChartData);

        console.log(storyPoints)

        let cumulativeSum = totalStoryPoints;
        const accumulatedValues = [];

        for (const value of storyPoints) {
            cumulativeSum -= value;
            accumulatedValues.push(cumulativeSum);
        }

        actualBurndownData.push(...accumulatedValues);
      }
    })
    console.log(actualBurndownData)

    renderBurndownChart(ctx, dates, idealBurndownData, actualBurndownData);
  } catch (error) {
    console.error("Error fetching and displaying data: ", error);
  }

  return modal;
}

async function calculateTotalStoryPoints(sprintID) {
  const sprintData = await getSprintDataBySprintID(sprintID);

  let totalStoryPoints = 0;

  // Combine all task objects into a single list
  const allTasks = [...sprintData.notStarted, ...sprintData.inProgress, ...sprintData.completed];

  for (const taskID of allTasks) {
    const taskRef = doc(db, "tasks", taskID);
    const docSnapshot = await getDoc(taskRef);

    if (docSnapshot.exists()) {
      const taskData = docSnapshot.data();
      const taskStoryPoint = parseInt(taskData.storyPoint);
      totalStoryPoints += taskStoryPoint;
    }
  }

  // Update the sprint document with the total story points
  const sprintDocRef = doc(db, "sprints", sprintID);
  await updateDoc(sprintDocRef, {
    storyPoint: totalStoryPoints,
  });

  return totalStoryPoints;
}

async function createIdealBurndownChartData(sprintID) {
  const sprintData = await getSprintDataBySprintID(sprintID);
  const totalStoryPoints = await calculateTotalStoryPoints(sprintID);

  const startDate = new Date(sprintData.startDate);
  const endDate = new Date(sprintData.endDate);
  const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const idealNumberDecrease = totalStoryPoints / (dayDiff - 1);;

  const idealChartData = [];
  for (let i = 0; i < dayDiff; i++) {
      idealChartData.push(Math.max(totalStoryPoints - i * idealNumberDecrease, 0));
  }
  idealChartData.push(0);

  return idealChartData;
}

function renderBurndownChart(
  ctx,
  dates,
  idealRemainingTasks,
  actualRemainingTasks
) {
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Actual Remaining Story Points",
          data: actualRemainingTasks,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
        },
        {
          label: "Ideal Remaining Story Points",
          data: idealRemainingTasks,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: "time",
          time: { unit: "day" },
          title: {
            display: true,
            text: "Date",
            font: { weight: "bold", size: 18 },
          },
          ticks: {
            font: { weight: "bold" },
          },
        },
        y: {
          title: {
            display: true,
            text: "Remaining Story Points",
            font: { weight: "bold", size: 18 },
          },
          ticks: {
            font: { weight: "bold" },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "black",
            font: {
              size: 20,
            },
          },
        },
        title: {
          display: true,
          text: "Burndown Chart",
          font: {
            size: 23,
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const datasetLabel = tooltipItem.dataset.label || "";
              const dataIndex = tooltipItem.dataIndex;
              const timeSpent =
                tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data[
                  dataIndex
                ];
              return `${datasetLabel}: ${timeSpent}`;
            },
          },
        },
      },
    },
  });
  return chart;
}

// async function sortedChartData(sprintId) {
//   const modalId = await findModalIdBySprintId(sprintId);

//   if (modalId) {
//     const modalDocRef = doc(db, "modals", modalId);
//     const modalDoc = await getDoc(modalDocRef);

//     if (modalDoc.exists()) {
//       const modalData = modalDoc.data();

//       // Fetch the subcollection data within the modal document
//       const rowsCollection = collection(db, "modals", modalId, "rows");
//       const rowsSnapshot = await getDocs(rowsCollection);

//       modalData.sprintChartData = [];
//       const rowContainer = [];
//       const temp = [];

//       // Iterate through subcollection documents and add them to modalData.rows
//       rowsSnapshot.forEach((doc) => {
//         modalData.sprintChartData.push(doc.data());
//       });
//       const entriesToRemove = modalData.sprintChartData.length;

//       await updateDoc(modalDocRef, {
//         sprintChartData: modalData.sprintChartData,
//       });

//       for (let i = 0; i < entriesToRemove; i++) {
//         const data = modalData.sprintChartData.pop();
//         temp.push(data);
//       }
//       temp.sort((a, b) => {
//         // Convert the date strings to Date objects for comparison
//         const dateA = new Date(a.date);
//         const dateB = new Date(b.date);

//         // Compare the dates and return the result of the comparison
//         return dateA - dateB;
//       });
//       return temp;
//     }
//   }
// }

function findModalIdBySprintId(sprintId) {
  const modalsCollection = collection(db, "modals");

  // Get all documents in the "modals" collection
  return getDocs(modalsCollection)
    .then((querySnapshot) => {
      let modalId = null;
      querySnapshot.forEach((doc) => {
        const modalData = doc.data();
        if (modalData.sprint === sprintId) {
          modalId = doc.id;
        }
      });
      return modalId;
    })
    .catch((error) => {
      console.error("Error finding modal ID: ", error);
      return null;
    });
}

async function getSprintDataBySprintID(sprintId) {
  const sprintsCollection = collection(db, "sprints");
  const sprintDocRef = doc(sprintsCollection, sprintId);

  try {
    const sprintSnapshot = await getDoc(sprintDocRef);
    const sprintData = sprintSnapshot.data();
    return sprintData;
  } catch (error) {
    // Handle errors here
    console.error("Error getting sprint data:", error);
    throw error; // Re-throw the error to propagate it to the caller
  }
}

async function getDatesForSprint(sprintId) {
  try {
    // Assuming you have a function getSprintDataBySprintID(sprintId) that retrieves sprint data.
    const sprintData = await getSprintDataBySprintID(sprintId);

    const startDate = new Date(sprintData.startDate);
    const endDate = new Date(sprintData.endDate);

    // Validate dates
    if (isNaN(startDate) || isNaN(endDate)) {
      throw new Error("Invalid startDate or endDate.");
    }

    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  } catch (error) {
    console.error("Error getting dates for sprint:", error);
    throw error; // Re-throw error to allow calling code to handle it.
  }
}

const createAccountButton = document.getElementById("create_account_button");
if (checkAdmin === "true") {
  createAccountButton.style.display = "block"; // Show the button
  createAccountButton.addEventListener("click", () => {
    const routeTo = "account-creation.html";
    const username = window.history.state.username;
    const admin = window.history.state.isAdmin;
    window.history.pushState(
      { username: username, isAdmin: admin, previousPage: "scrum-board.html" },
      "",
      routeTo
    );
    window.location.href = routeTo;
  });
} else {
  createAccountButton.style.display = "hide"; // Hide the button
}

// Call the function to display Sprint Backlogs when the page loads
window.addEventListener("load", () => {
  displaySprintBacklogs();
});
