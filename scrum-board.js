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
const productBacklogButton = document.getElementById("product_backlog_button")
const scumboardButton = document.getElementById("scrum_board_button")

console.log('scrumboard', window.history.state.username);

scumboardButton.addEventListener("click", () => {
  const routeTo = "scrum-board.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState({username: username, isAdmin: admin}, "", routeTo)
  window.location.href = routeTo; // Redirect to the desired page
})

productBacklogButton.addEventListener("click", () => {
  const routeTo = "product-backlog.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState({username: username, isAdmin: admin}, "", routeTo)
  window.location.href = routeTo; // Redirect to the desired page
})


document.getElementById("createSprintButton").addEventListener("click", async () => {
  try {
      // Get a reference to the "sprints" and "modals" collections in Firestore
      const sprintsCollection = collection(db, "sprints");
      const modalsCollection = collection(db, "modals");

      // Add a new document with a unique ID to the "sprints" collection
      const sprintDocRef = await addDoc(sprintsCollection, {
          name: '',
          startDate: '', 
          endDate: '',
          notStarted: [],
          inProgress: [],
          completed: [],
          addedTaskID:[],
          removedTaskID: [],
          storyPoint: 0,
          modal: false,
      });

      // Add a new document with a unique ID to the "modals" collection
      const modalDocRef = await addDoc(modalsCollection, {
          sprint: sprintDocRef.id, // Store the sprint ID in the modal document
          sprintChartData: [],
      });

      // Redirect to the sprint backlog page with the sprint ID
      window.location.href = `sprint-backlog.html?id=${sprintDocRef.id}`;
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
      querySnapshot.forEach((docs) => {
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
        closeButton.addEventListener("click", async(event) => {
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
        chartButton.addEventListener("click", async(event) => {
          // Prevent the click event from propagating to the card click event
          event.stopPropagation();
          if(sprintData.modal === false) {
            const modal = createAndDisplayModal(sprintId);
            // modal.style.display = "block";
          }
          else {
            
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
          window.history.pushState({username: username, isAdmin: admin}, "", routeTo)
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
      <table class="table" style="background-color: white; margin-top: 20px;">
        <thead>
          <tr>
            <th style="text-align: center;">Date</th>
            <th style="text-align: center;">Ideal Remaining Tasks</th>
            <th style="text-align: center;">Actual Remaining Tasks</th>
          </tr>
        </thead>
        <tbody id="tableBody-${sprintId}" style="text-align: center;"></tbody>
      </table>
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
    const sortedData = await sortedChartData(sprintId);
    const tableBody = modal.querySelector(`#tableBody-${sprintId}`);
    sortedData.forEach(data => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${data.date}</td>
        <td>${data.idealRemainingTasks}</td>
        <td>${data.actualRemainingTasks}</td>
      `;
      tableBody.appendChild(newRow);
    });

    // Generate burndown chart using Chart.js
    const ctx = modal.querySelector(`#burndownChart-${sprintId}`).getContext("2d");
    const dates = createBurndownChartLabels(sprintId);
    const idealRemainingTasks = sortedData.map((data) => data.idealRemainingTasks);
    const actualRemainingTasks = sortedData.map((data) => data.actualRemainingTasks);

    renderBurndownChart(ctx, [2,4,3,7], [1,1,5,2], [6,2,4,3]);

  } catch (error) {
    console.error("Error fetching and displaying data: ", error);
  }

  return modal;
}

function createBurndownChartLabels(sprintId) {
  // Parse the start and end dates
  const sprintData=getSprintDataBySprintID(sprintId)
  const startDate = new Date(sprintData.startDate);
  const endDate = new Date(sprintData.endDate);
  
  // Validate the dates
  if (isNaN(startDate) || isNaN(endDate)) {
      throw new Error("Invalid start or end date");
  }

  // Initialize an array to store the dates
  const dateArray = [];
  
  // Loop through each date between startDate and endDate
  for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      // Push a copy of currentDate to dateArray
      dateArray.push(new Date(currentDate));
  }
  
  // Convert the date objects into a string format (optional, depending on your use-case)
  const formattedDates = dateArray.map(date => date.toISOString().split('T')[0]);
  
  return formattedDates;

}

function renderBurndownChart(ctx, dates, idealRemainingTasks, actualRemainingTasks) {
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Actual Remaining Tasks",
          data: actualRemainingTasks,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false
        },
        {
          label: "Ideal Remaining Tasks",
          data: idealRemainingTasks,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false
        }
      ]
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
            text: "Time Spent (hours)",
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
          text: 'Burndown Chart',
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
              const timeSpent = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data[dataIndex];
              return `${datasetLabel}: ${timeSpent} hours`;
            },
          },
        },
      },
    },
  });
  return chart;
}

async function sortedChartData(sprintId) {
  const modalId = await findModalIdBySprintId(sprintId);

  if (modalId) {
    const modalDocRef = doc(db, "modals", modalId);
    const modalDoc = await getDoc(modalDocRef);

    if (modalDoc.exists()) {
      const modalData = modalDoc.data();

      // Fetch the subcollection data within the modal document
      const rowsCollection = collection(db, "modals", modalId, "rows");
      const rowsSnapshot = await getDocs(rowsCollection);

      modalData.sprintChartData = [];
      const rowContainer = [];
      const temp = [];

      // Iterate through subcollection documents and add them to modalData.rows
      rowsSnapshot.forEach((doc) => {
        modalData.sprintChartData.push(doc.data());
      });
      const entriesToRemove = modalData.sprintChartData.length;

      await updateDoc(modalDocRef, { sprintChartData: modalData.sprintChartData });

      for (let i = 0; i < entriesToRemove; i++) {
        const data = modalData.sprintChartData.pop();
        temp.push(data)
      } 
      temp.sort((a, b) => {
        // Convert the date strings to Date objects for comparison
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
      
        // Compare the dates and return the result of the comparison
        return dateA - dateB;
      });
      return temp;
    }
  }
}

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

async function getSprintDataBySprintID(sprintId){
  const sprintsCollection = collection(db, "sprints");
  const sprintDocRef = doc(sprintsCollection, sprintId);
  const sprintData = (await getDoc(sprintDocRef)).data();
  return sprintData
}

// Call the function to display Sprint Backlogs when the page loads
window.addEventListener("load", () => {
  displaySprintBacklogs();
});
