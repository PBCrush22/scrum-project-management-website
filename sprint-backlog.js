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
  query as firestoreQuery,
  where,
  getDoc,
  setDoc,
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
const columns = document.querySelectorAll(".task-column");
const addButton = document.getElementById("addButton");
addButton.addEventListener("click", addTaskToColumn);
addButton.addEventListener("click", handleAddTask);
const sprintsCollection = collection(db, "sprints");
const sprintId = getSprintIdFromURL();
const sprintDocRef = doc(sprintsCollection, sprintId);
const sprintData = (await getDoc(sprintDocRef)).data();
const startSprintButton = document.getElementById("startSprintButton");
const sprintNameInput = document.getElementById("sprintNameInput");
const startDateInput = document.getElementById("startDateInput");
const endDateInput = document.getElementById("endDateInput");
const productBacklogButton = document.getElementById("product_backlog_button");
const scumboardButton = document.getElementById("scrum_board_button");
const createAccountButton = document.getElementById("create_account_button");
const teamMemberButton = document.getElementById("team_member_button");
const changePassButton = document.getElementById("changePasswordLink");
const checkAdmin = window.history.state.isAdmin;

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
} else {
  teamMemberButton.style.display = "hide"; // Hide the button
}

changePassButton.addEventListener("click", () => {
  const routeTo = "change-password.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState(
    { username: username, isAdmin: admin, previousPage: "sprint-backlog.html" },
    "",
    routeTo
  );
  window.location.href = routeTo; // Redirect to the desired page
});

if (checkAdmin === "true") {
  createAccountButton.style.display = "block"; // Show the button
  createAccountButton.addEventListener("click", () => {
    const routeTo = "account-creation.html";
    const username = window.history.state.username;
    const admin = window.history.state.isAdmin;
    window.history.pushState(
      {
        username: username,
        isAdmin: admin,
        previousPage: `sprint-backlog.html?id=${sprintId}`,
      },
      "",
      routeTo
    );
    window.location.href = routeTo;
  });
} else {
  createAccountButton.style.display = "hide"; // Hide the button
}

function disableAddTaskButton() {
  addButton.disabled = true;
}

if (sprintData && sprintData.isStarted) {
  disableAddTaskButton();
}

startSprintButton.addEventListener("click", async function () {
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (endDate < startDate) {
    alert("End date cannot be earlier than start date");
    endDateInput.value = "";
  } else {
    sprintData.startDate = startDateInput.value;
    sprintData.endDate = endDateInput.value;
    sprintData.isStarted = true;

    await updateDoc(sprintDocRef, sprintData);
    disableAddTaskButton();
  }
});

// Event listener for sprint name input
sprintNameInput.addEventListener("input", async function () {
  const sprintName = sprintNameInput.value;
  sprintData.name = sprintName;
  await updateDoc(sprintDocRef, sprintData);
});

// Event listener for start date input
startDateInput.addEventListener("change", async function () {
  const startDate = new Date(startDateInput.value);
  // Update the min attribute of endDateInput to restrict selection of dates earlier than start date
  endDateInput.min = startDate.toISOString().split("T")[0];
  sprintData.startDate = startDateInput.value;

  await updateDoc(sprintDocRef, sprintData);
});

// Event listener for end date input
endDateInput.addEventListener("change", async function () {
  const endDate = new Date(endDateInput.value);
  const startDate = new Date(startDateInput.value);

  if (endDate < startDate) {
    // If end date is earlier than start date, show an error message or handle it accordingly
    alert("End date cannot be earlier than start date");
    endDateInput.value = ""; // Reset the end date input field
  } 
  else {
    sprintData.endDate = endDateInput.value;
    await updateDoc(sprintDocRef, sprintData);
  }
});

// Get references to the hour and minute input elements
const hoursInput = document.getElementById("hours");
const minutesInput = document.getElementById("minutes");

// Add event listeners to the input elements for validation
hoursInput.addEventListener("input", validateHoursInput);
minutesInput.addEventListener("input", validateMinutesInput);

function validateHoursInput() {
  const hours = parseInt(hoursInput.value);
  if (isNaN(hours) || hours < 0 || hours > 23) {
    // Invalid input, reset to 0
    hoursInput.value = 0;
  }
}

function validateMinutesInput() {
  const minutes = parseInt(minutesInput.value);
  if (isNaN(minutes) || minutes < 0 || minutes > 59) {
    // Invalid input, reset to 0
    minutesInput.value = 0;
  }
}

// Inside sprint-backlog.js
function getSprintIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

const timeSpentEntriesMap = new Map(); // Map to store time spent entries for each task

async function populateDropdown() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  const dropdown = document.getElementById("taskDropdown");
  dropdown.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();

    if (
      !sprintData.addedTaskID.includes(id) ||
      sprintData.removedTaskID.includes(id)
    ) {
      console.log(typeof data.hide);
      const option = createDropdownOption(id, data.taskName);
      if (data.hide === 0) {
        dropdown.appendChild(option);
      }
    }
  });
}

function createDropdownOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

async function handleAddTask() {
  console.log(sprintId)
  const currentDate = new Date().toLocaleDateString();
  const modalCollection = collection(db, "modals");
  const querySnapshot = await getDocs(modalCollection);
  const formattedDate = currentDate.replace(/\//g, "-");
  const startDate = sprintData.startDate;
  const endDate = sprintData.endDate;
  const formattedStart = startDate.replace(/\//g, "-");
  const formattedEnd = endDate.replace(/\//g, "-");
  const dateRange = generateDateRange(formattedStart, formattedEnd);

  querySnapshot.forEach(async (docs) => {
    const data = docs.data();
    if (data.sprint === sprintId) {
      console.log(data)
      const modalRef = doc(db, "modals", docs.id);
      for (const dateKey of dateRange) {
        const dateField = `sprintChartData.${dateKey}`;
        console.log("Hi")
        if (!data.sprintChartData.hasOwnProperty(dateField)){
          const initialValue = 0;
        const updateData = {
          [dateField]: initialValue,
        };
        await updateDoc(modalRef, updateData)
        }
        else{
          console.log("Bye")
        }
      }
    }
  });
}

async function addTaskToColumn() {
  const dropdown = document.getElementById("taskDropdown");
  addButton.disabled = true; // Disable the button to prevent multiple clicks

  const selectedTaskId = dropdown.value;
  if (!selectedTaskId) {
    addButton.disabled = false; // Enable the button in case of error or no selection
    return; // No task selected
  }

  // Add to the set of added task IDs
  sprintData.addedTaskID.push(selectedTaskId);
  sprintData.notStarted.push(selectedTaskId);

  const taskRef = doc(db, "tasks", selectedTaskId);

  // Update task status to "Not Started" explicitly
  await updateTaskStatus(selectedTaskId, "Not Started");

  await updateDoc(taskRef, {
    hide: 1,
  });

  const docSnapshot = await getDoc(taskRef);

  // Check if the document exists
  if (docSnapshot.exists()) {
    // Extract the data from the document snapshot
    const taskData = docSnapshot.data();

    // Now taskData contains the data stored in the document
    console.log(taskData.hide);
  }

  try {
    await updateDoc(sprintDocRef, sprintData);
    // Repopulate the dropdown to remove the added task
    await populateDropdown();
    populateColumnsFromSprintData();
    calculateTotalStoryPoints();
  } catch (error) {
    console.error("Error adding task:", error);
  } finally {
    addButton.disabled = false; // Enable the button after the operation is complete
  }
}

async function fetchTaskData(taskId) {
  const taskDoc = await getDoc(doc(db, "tasks", taskId));
  return taskDoc.data();
}

const filterColumn1 = document.getElementById("filterColumn1");
const sortColumn1 = document.getElementById("sortColumn1");

filterColumn1.addEventListener("change", function () {
  populateColumnsFromSprintData();
});

sortColumn1.addEventListener("change", function () {
  populateColumnsFromSprintData();
});

function priorityToNumber(priority) {
  switch (priority) {
    case "Low":
      return 1;
    case "Medium":
      return 2;
    case "Important":
      return 3;
    case "Urgent":
      return 4;
    default:
      return 0;
  }
}

async function populateColumn(taskIds, columnTaskContainer) {
  columnTaskContainer.innerHTML = "";

  // Create an array to hold the task data for sorting
  const tasksDataArray = [];

  for (const taskId of taskIds) {
    const taskData = await fetchTaskData(taskId);
    tasksDataArray.push({ id: taskId, data: taskData });
  }

  // Filtering
  const filterValue = filterColumn1.value;

  let filteredTasks = tasksDataArray;

  if (filterValue !== "All") {
    filteredTasks = tasksDataArray.filter(
      (task) => task.data.tag && task.data.tag.includes(filterValue)
    );
  }

  // Sorting
  const sortValue = sortColumn1.value;
  filteredTasks.sort((a, b) => {
    if (sortValue === "Lowest to Urgent") {
      return (
        priorityToNumber(a.data.priority) - priorityToNumber(b.data.priority)
      );
    } else if (sortValue === "Urgent to Lowest") {
      return (
        priorityToNumber(b.data.priority) - priorityToNumber(a.data.priority)
      );
    } else if (sortValue === "Recent to Oldest") {
      return new Date(b.data.timestamp) - new Date(a.data.timestamp);
    } else if (sortValue === "Oldest to Recent") {
      return new Date(a.data.timestamp) - new Date(b.data.timestamp);
    }
    return 0;
  });

  // Populate column with sorted and filtered tasks
  for (const task of filteredTasks) {
    const coloredTags = getColoredTags(task.data.tag);
    const priorityClass = getPriorityClass(task.data.priority);
    const taskElement = createTaskElement(
      task.id,
      task.data,
      task.data.taskName
    );
    taskElement.innerHTML = `
    <p class="task-name">Name: ${task.data.taskName}</p>
    <p class="task-name">Tag: ${coloredTags}</p>
    <p>Story Point: ${task.data.storyPoint}</p>
    <p>Priority: <span class="${priorityClass}">${task.data.priority}</span></p>
  `;
    columnTaskContainer.appendChild(taskElement);
  }
}

function populateColumnsFromSprintData() {
  const column1TaskContainer = document.getElementById("taskContainer1");
  const column2TaskContainer = document.getElementById("taskContainer2");
  const column3TaskContainer = document.getElementById("taskContainer3");

  populateColumn(sprintData.notStarted, column1TaskContainer);
  populateColumn(sprintData.inProgress, column2TaskContainer);
  populateColumn(sprintData.completed, column3TaskContainer);
}

function createTaskElement(id, data, text) {
  const taskElement = document.createElement("div");
  taskElement.id = id;
  taskElement.className = "task";
  taskElement.textContent = text;
  taskElement.draggable = true;

  taskElement.addEventListener("click", () => {
    showTaskDetails(id, data);
  });

  taskElement.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", id);
  });
  return taskElement;
}

function handleDragAndDrop(column) {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  column.addEventListener("drop", async (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const taskElement = document.getElementById(taskId);

    if (e.target.classList.contains("task-column")) {
      const currentDate = new Date().toLocaleDateString();

      const sourceColumnId = taskElement.parentElement.parentElement.id;
      const targetColumnId = column.id;

      const taskContainerId = `taskContainer${targetColumnId.charAt(
        targetColumnId.length - 1
      )}`;
      const taskContainer = document.getElementById(taskContainerId);

      if (taskContainer) {
        // Append the taskElement to taskContainer
        taskContainer.appendChild(taskElement);
      }

      // Update sprintData based on the source and target columns
      if (sourceColumnId === "column1") {
        // Remove the task from sprintData.notStarted
        const indexToRemove = sprintData.notStarted.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.notStarted.splice(indexToRemove, 1);
        }
      } else if (sourceColumnId === "column2") {
        // Remove the task from sprintData.inProgress
        const indexToRemove = sprintData.inProgress.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.inProgress.splice(indexToRemove, 1);
        }
      } else if (sourceColumnId === "column3") {
        // Remove the task from sprintData.completed
        const indexToRemove = sprintData.completed.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.completed.splice(indexToRemove, 1);
        }
      }

      if (targetColumnId === "column1") {
        // Add the task to sprintData.notStarted
        sprintData.notStarted.push(taskId);
        // Update task status to "Not Started"
        await updateTaskStatus(taskId, "Not Started");
      } else if (targetColumnId === "column2") {
        // Add the task to sprintData.inProgress
        sprintData.inProgress.push(taskId);
        // Update task status to "In Progress"
        await updateTaskStatus(taskId, "In Progress");
      } else if (targetColumnId === "column3") {
        // Add the task to sprintData.completed
        sprintData.completed.push(taskId);
        // Update task status to "Completed"
        await updateTaskStatus(taskId, "Completed");

        const modalCollection = collection(db, "modals");

        const querySnapshot = await getDocs(modalCollection);

        const formattedDate = currentDate.replace(/\//g, "-");

        const endDate = sprintData.endDate;

        const formattedEnd = endDate.replace(/\//g, "-");

        const keyToCheck = formattedDate;

        const taskRef = doc(db, "tasks", taskId);

        const docSnap = await getDoc(taskRef);

        const taskData = docSnap.data();
        
        querySnapshot.forEach(async (docs) => {
          const data = docs.data();
          if (data.sprint === sprintId) {
            const modalRef = doc(db, "modals", docs.id);
            console.log(data.sprintChartData)
            if (keyToCheck in data.sprintChartData) {
              console.log(2, keyToCheck)
              const existingValue = data.sprintChartData[keyToCheck] || 0;
              const addStoryPoint =
                parseInt(existingValue) + parseInt(taskData.storyPoint);
    
              const updateData = {
                [`sprintChartData.${keyToCheck}`]: addStoryPoint,
              };
              await updateDoc(modalRef, updateData);
            } 
              else {
                // console.log(3, keyToCheck)
                const existingValue = data.sprintChartData[formattedEnd] || 0;
                const addStoryPoint =
                  parseInt(existingValue) + parseInt(taskData.storyPoint);
    
                const updateData = {
                  [`sprintChartData.${formattedEnd}`]: addStoryPoint,
                };
                await updateDoc(modalRef, updateData);
              }
          }})
      }

      // Update the Firestore document
      await updateDoc(sprintDocRef, sprintData);

      // Refresh local data
      populateColumnsFromSprintData();
    }
  });
}

function generateDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateRange = [];

  const options = { year: "numeric", month: "2-digit", day: "2-digit" };

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const formattedDate = currentDate
      .toLocaleDateString(undefined, options)
      .replace(/\//g, "-");
    dateRange.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateRange;
}
columns.forEach(handleDragAndDrop);

async function updateTaskStatus(taskId, newStatus) {
  try {
    const taskDocRef = doc(db, "tasks", taskId);
    const taskData = (await getDoc(taskDocRef)).data();

    if (taskData) {
      taskData.taskStatus = newStatus;
      await updateDoc(taskDocRef, taskData);

      // Update the task's appearance in the corresponding column
      const taskElement = document.getElementById(taskId);
      if (taskElement) {
        taskElement.dataset.status = newStatus;
      }
    } else {
      console.error("Task not found.");
    }
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}

const deleteArea = document.getElementById("deleteArea");
deleteArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

deleteArea.addEventListener("drop", async (e) => {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);
  const sourceColumnId = taskElement.parentElement.parentElement.id;

  taskElement.remove();
  const indexToRemove = sprintData.addedTaskID.indexOf(taskId);
  sprintData.addedTaskID.splice(indexToRemove, 1);
  sprintData.removedTaskID.push(taskId);

  const taskRef = doc(db, "tasks", taskId);

  await updateDoc(taskRef, {
    hide: 0,
  });

  // Update sprintData based on the source and target columns
  if (sourceColumnId === "column1") {
    // Remove the task from sprintData.notStarted
    const indexToRemove = sprintData.notStarted.indexOf(taskId);
    if (indexToRemove !== -1) {
      sprintData.notStarted.splice(indexToRemove, 1);
    }
  } else if (sourceColumnId === "column2") {
    // Remove the task from sprintData.inProgress
    const indexToRemove = sprintData.inProgress.indexOf(taskId);
    if (indexToRemove !== -1) {
      sprintData.inProgress.splice(indexToRemove, 1);
    }
  } else if (sourceColumnId === "column3") {
    // Remove the task from sprintData.inProgress
    const indexToRemove = sprintData.completed.indexOf(taskId);
    if (indexToRemove !== -1) {
      sprintData.completed.splice(indexToRemove, 1);
    }
  }

  await updateDoc(sprintDocRef, sprintData);
  await populateDropdown();
});

const getColoredTags = (tagString) => {
  const tagsArray = tagString.split(", ");
  const coloredTags = tagsArray
    .map((tag) => {
      const tagClass = `tag-${tag.toLowerCase()}`;
      return `<span class="${tagClass}">${tag}</span>`;
    })
    .join(", ");
  return coloredTags;
};

const getPriorityClass = (priority) => {
  let priorityClass = "priority-text-";
  switch (priority.toLowerCase()) {
    case "low":
      return (priorityClass += "low");
    case "medium":
      return (priorityClass += "medium");
    case "important":
      return (priorityClass += "important");
    case "urgent":
      return (priorityClass += "urgent");
    default:
      return (priorityClass += "default");
  }
};

// Function to display task details in the modal
async function showTaskDetails(id, taskData) {
  const taskDetailsWindow = document.getElementById("taskDetailsWindow");
  const taskDetailsContent = document.getElementById("taskDetailsContent");
  const priorityClass = getPriorityClass(taskData.priority);
  const coloredTags = getColoredTags(taskData.tag);

  taskDetailsContent.innerHTML = `
      <p>Name: ${taskData.taskName}</p>
      <p>Tag: ${coloredTags}</p>
      <p>Story Point: ${taskData.storyPoint}</p>
      <p>Category: ${taskData.category}</p>
      <p>Priority: <span class="${priorityClass}">${taskData.priority}</span></p>
      <p>Assignee: ${taskData.assignee}</p>
      <p>Task Stage: ${taskData.taskStage}</p>
      <p>Task Description: ${taskData.taskDescription}</p>
      <p>Task Status: ${taskData.taskStatus}</p>
    `;

  // Show the modal
  taskDetailsWindow.style.display = "block";

  // Create a div to display time spent details
  const timeSpentDiv = document.createElement("div");
  timeSpentDiv.id = "timeSpentDetails";

  // Append the time spent div to the task details content
  taskDetailsContent.appendChild(timeSpentDiv);

  // Fetch and display time spent entries from Firestore
  await displayTimeSpentEntries(taskData.taskName);

  // Edit Log button click event
  const editLogButton = document.getElementById("editLogButton");
  editLogButton.addEventListener("click", () => {
    // Open the edit task log window
    showEditTaskLogWindow(id, taskData);
  });

  // // Add an event listener to the "Show Effort Chart" button
  const showEffortChartButton = document.getElementById(
    "showEffortChartButton"
  );
  showEffortChartButton.addEventListener("click", async () => {
    await displayEffortChart(taskData.taskName);
  });

  // Close the modal when the close button or overlay is clicked
  // Add an event listener to close the pop-up window
  const closeTaskDetailsButton = document.getElementById("closeTaskDetails");
  closeTaskDetailsButton.addEventListener("click", () => {
    taskDetailsWindow.style.display = "none";
  });
}

async function displayTimeSpentEntries(taskName) {
  const timeSpentDiv = document.getElementById("timeSpentDetails");

  // Initialize the content with "Total Time Spent:"
  let content = "";

  let totalHours = 0;
  let totalMinutes = 0;

  // Check if the task already exists in the timeSpentEntriesMap, and initialize if not
  if (!timeSpentEntriesMap.has(taskName)) {
    timeSpentEntriesMap.set(taskName, []);
  }

  try {
    const taskLogsCollection = collection(db, "task_logs");
    const q = firestoreQuery(
      taskLogsCollection,
      where("taskName", "==", taskName)
    );
    const querySnapshot = await getDocs(q);

    const timeSpentEntries = [];

    querySnapshot.forEach((doc) => {
      const logData = doc.data();
      timeSpentEntries.push({
        logDate: logData.logDate,
        assignee: logData.assignee,
        hours: Math.floor(logData.timeSpent),
        minutes: (logData.timeSpent - Math.floor(logData.timeSpent)) * 60,
      });

      // Update total time spent
      totalHours += Math.floor(logData.timeSpent);
      totalMinutes += (logData.timeSpent - Math.floor(logData.timeSpent)) * 60;
    });

    // Calculate total hours and minutes
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    // Retrieve existing time spent entries from the map
    const existingTimeSpentEntries = timeSpentEntriesMap.get(taskName) || [];

    // Combine existing entries with new entries
    const updatedTimeSpentEntries = [
      ...existingTimeSpentEntries,
      ...timeSpentEntries,
    ];

    // Update the timeSpentEntriesMap with the combined entries
    timeSpentEntriesMap.set(taskName, updatedTimeSpentEntries);

    // Add the "Total Time Spent" to the content
    const formattedTotalTimeSpent = formatTotalTimeSpent(
      totalHours,
      totalMinutes
    );
    content += formattedTotalTimeSpent;

    // Update the total time spent display in the modal
    updateTimeSpentDisplay(taskName, totalHours, totalMinutes);
  } catch (error) {
    console.error("Error fetching time spent entries: ", error);
  }

  // Set the innerHTML with the constructed content
  timeSpentDiv.innerHTML = content;
}

// Create a new function to format total time spent
function formatTotalTimeSpent(hours, minutes) {
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = Math.round(minutes).toString().padStart(2, "0");

  return `<p class="total-time-spent">Total Time Spent: <span class="time-spent">${formattedHours} hours ${formattedMinutes} mins</span></p>`;
}

// Inside showEditTaskLogWindow function
function showEditTaskLogWindow(id, taskData) {
  const editTaskLogWindow = document.getElementById("editTaskLogWindow");
  const taskSelected = document.getElementById("taskSelected");
  const teamMemberSelect = document.getElementById("teamMember");
  const logDateInput = document.getElementById("logDate");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");

  const assigneeSelect = document.getElementById("teamMember");

  // Function to fetch users from the 'users_added' collection in Firebase
  async function fetchUsers() {
    try {
      assigneeSelect.innerHTML = ""; // Clear the select element
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (!optionExists(userData.username, assigneeSelect)) {
          const option = document.createElement("option");
          option.value = userData.username; // Assuming username is a property of the user object
          option.text = userData.username; // Assuming username is a property of the user object
          assigneeSelect.appendChild(option);
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Check if the option already exists in the select element
  function optionExists(username, selectElement) {
    for (let i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === username) {
        return true;
      }
    }
    return false;
  }

  // Call the fetchUsers function to populate the select element
  fetchUsers();

  // Set today's date as the default value for the date input
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  logDateInput.value = formattedDate;

  // Populate input fields with existing task data
  taskSelected.value = taskData.taskName;
  teamMemberSelect.value = taskData.assignee; // Assignee can be used as the team member here
  hoursInput.value = Math.floor(taskData.timeSpent) || 0;
  minutesInput.value = (taskData.timeSpent - hoursInput.value) * 60 || 0;

  // Show the edit task log window
  editTaskLogWindow.style.display = "block";

  saveLogButton.removeEventListener("click", saveTaskLog);
  saveLogButton.addEventListener("click", () => {
    saveTaskLog(id, taskData); // Save the task log data
  });

  const cancelLogButton = document.getElementById("cancelLogButton");
  cancelLogButton.addEventListener("click", () => {
    // Close the edit task log window
    const editTaskLogWindow = document.getElementById("editTaskLogWindow");
    editTaskLogWindow.style.display = "none";
  });
}

// Function to format time spent details
function formatTimeSpentDetails(logDate, hours, minutes) {
  const formattedLogDate = new Date(logDate);
  const formattedDate = formattedLogDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = Math.round(minutes).toString().padStart(2, "0");

  return `<div class="time-spent-entry">${formattedDate}<span class="time-spent">${formattedHours} hours ${formattedMinutes} mins</span></div>`;
}

function updateTimeSpentDisplay(taskName, totalHours, totalMinutes) {
  const timeSpentDiv = document.getElementById("timeSpentDetails");

  // Find the existing total time spent element
  const totalTimeSpentElement = timeSpentDiv.querySelector(".total-time-spent");

  if (totalTimeSpentElement) {
    // Update the total time spent display
    const formattedHours = totalHours.toString().padStart(2, "0");
    const formattedMinutes = Math.round(totalMinutes)
      .toString()
      .padStart(2, "0");
    const totalTimeSpent = `${formattedHours} hours ${formattedMinutes} mins`;
    totalTimeSpentElement.innerHTML = `Total Time Spent: <span class="time-spent">${totalTimeSpent}</span>`;
  }
}

let isSaving = false;

// Function to save task log to the database
async function saveTaskLog(id, taskData) {
  const taskSelect = document.getElementById("taskSelected");
  const teamMemberSelect = document.getElementById("teamMember");
  const logDateInput = document.getElementById("logDate");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");

  if (
    !teamMemberSelect.value ||
    !logDateInput.value ||
    !hoursInput.value ||
    !minutesInput.value
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  const taskName = taskSelect.value;
  const teamMember = teamMemberSelect.value;
  const logDate = logDateInput.value;
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const timeSpent = hours + minutes / 60;

  const log = {
    taskName,
    assignee: teamMember,
    logDate,
    timeSpent,
  };

  if (isSaving) {
    // If a save operation is already in progress, ignore the click
    return;
  }

  isSaving = true;

  saveLogButton.disabled = true;

  const taskLogsCollection = collection(db, "task_logs");

  const taskRef = doc(db, "tasks", id);

  const newData = { assignee: teamMember };

  await updateDoc(taskRef, newData);

  try {
    // Check if the user wants to delete the time spent
    if (timeSpent === 0) {
      // If timeSpent is 0, delete the existing log entry
      await deleteTaskLogEntry(taskName, logDate, teamMember);
      console.log("Task log entry deleted successfully.");
    } else {
      // Query the "task_logs" collection for a document with the same task name and logDate
      const q = firestoreQuery(
        taskLogsCollection,
        where("taskName", "==", log.taskName),
        where("logDate", "==", log.logDate),
        where("assignee", "==", log.assignee)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no matching documents found, add a new document to the collection
        await addDoc(taskLogsCollection, log);
        console.log("Task log entry saved successfully.");
      } else {
        // If matching documents found, update the first matching document
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          timeSpent: log.timeSpent, // Update the timeSpent field
        });
        console.log("Task log entry updated successfully.");
      }
    }

    const updatedTaskData = { ...taskData, assignee: teamMember };
    // Update the display immediately
    await displayTimeSpentEntries(taskName);
    await showTaskDetails(id, updatedTaskData);

    // Update the timeSpentEntriesMap immediately
    const timeSpentEntries = timeSpentEntriesMap.get(taskName) || [];
    timeSpentEntries.push({
      logDate,
      hours,
      minutes,
    });
    timeSpentEntriesMap.set(taskName, timeSpentEntries);
  } catch (error) {
    console.error("Error saving or updating task log entry: ", error);
  }

  isSaving = false;

  // Close the edit task log window after saving
  const editTaskLogWindow = document.getElementById("editTaskLogWindow");
  editTaskLogWindow.style.display = "none";
  saveLogButton.disabled = false;
}

// Function to delete a task log entry
async function deleteTaskLogEntry(taskName, logDate, assignee) {
  try {
    const taskLogsCollection = collection(db, "task_logs");
    const q = firestoreQuery(
      taskLogsCollection,
      where("taskName", "==", taskName),
      where("logDate", "==", logDate),
      where("assignee", "==", assignee)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If matching documents found, delete the first matching document
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error("Error deleting task log entry: ", error);
  }
}

// Function to display the accumulation of effort chart
async function displayEffortChart(taskName) {
  // Fetch data for the accumulation of effort chart from the database
  const effortChartData = await fetchEffortChartData(taskName);

  // Check if effortChartData is successfully obtained
  if (
    effortChartData.dates &&
    effortChartData.members &&
    effortChartData.timeSpent
  ) {
    // Get the chart container
    const chartContainer = document.getElementById("effortChartCanvas");

    // Check if a chart already exists
    const existingChart = Chart.getChart(chartContainer);

    // Destroy the existing chart if it exists
    if (existingChart) {
      existingChart.destroy();
    }

    // Create the line chart
    const ctx = chartContainer.getContext("2d");

    // Create the new chart
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: effortChartData.dates,
        datasets: effortChartData.members.map((member, index) => ({
          label: member,
          borderColor: getRandomColor(),
          data: effortChartData.timeSpent[index],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              text: "Accumulated Time Spent (hours)",
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
            text: "Accumulation of Effort Chart",
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
                  tooltipItem.chart.data.datasets[tooltipItem.datasetIndex]
                    .data[dataIndex];
                return `${datasetLabel}: ${timeSpent} hours`;
              },
            },
          },
        },
      },
    });

    // Show the modal
    const modal = document.getElementById("effortChartModal");
    modal.style.display = "block";

    // Close modal event
    const closeEffortChart = document.getElementById("closeEffortChart");
    closeEffortChart.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  } else {
    console.error("Failed to fetch effortChartData");
  }
}

// Function to fetch data for the accumulation of effort chart
async function fetchEffortChartData(taskName) {
  const datesSet = new Set(); // Use a set to store unique dates
  const members = [];
  const timeSpent = [];

  try {
    const taskLogsCollection = collection(db, "task_logs");
    const q = firestoreQuery(
      taskLogsCollection,
      where("taskName", "==", taskName)
    );
    const querySnapshot = await getDocs(q);

    const memberDataMap = new Map();

    querySnapshot.forEach((doc) => {
      const logData = doc.data();
      const logDate = new Date(logData.logDate);

      // Format the date as YYYY-MM-DD
      const formattedDate = `${logDate.getFullYear()}-${(logDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${logDate.getDate().toString().padStart(2, "0")}`;

      datesSet.add(formattedDate); // Add each date to the set

      if (!memberDataMap.has(logData.assignee)) {
        memberDataMap.set(logData.assignee, {
          member: logData.assignee,
          data: new Map(),
        });
      }

      const memberData = memberDataMap.get(logData.assignee);

      if (!memberData.data.has(formattedDate)) {
        memberData.data.set(formattedDate, 0);
      }

      memberData.data.set(
        formattedDate,
        memberData.data.get(formattedDate) + logData.timeSpent
      );
    });

    const sortedDates = Array.from(datesSet).sort(); // Sort unique dates

    memberDataMap.forEach((memberData) => {
      members.push(memberData.member);

      let accumulatedTimeSpent = 0;
      const memberTimeSpentData = sortedDates.map((date) => {
        accumulatedTimeSpent += memberData.data.get(date) || 0;
        return accumulatedTimeSpent;
      });

      timeSpent.push(memberTimeSpentData);
    });

    return { dates: sortedDates, members, timeSpent };
  } catch (error) {
    console.error("Error fetching effort chart data: ", error);
    return { dates: [], members: [], timeSpent: [] };
  }
}

// Function to generate a random color for chart lines
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

async function calculateTotalStoryPoints() {
  let totalStoryPoints = 0;
  for (const taskId of sprintData.addedTaskID) {
    // Fetch task data for each taskId
    const taskData = await fetchTaskData(taskId);

    totalStoryPoints += parseInt(taskData.storyPoint, 10);
  }
  await updateDoc(sprintDocRef, {
    storyPoint: totalStoryPoints,
  });
}

populateDropdown();
populateColumnsFromSprintData();
calculateTotalStoryPoints();

sprintNameInput.value = sprintData.name || ""; // Use empty string as fallback if name is null or undefined
startDateInput.value = sprintData.startDate || "";
endDateInput.value = sprintData.endDate || "";
