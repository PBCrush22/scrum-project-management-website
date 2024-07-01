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

const assigneeSelect = document.getElementById("assignee");

// Function to fetch users from the 'users_added' collection in Firebase
async function fetchUsers() {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const option = document.createElement("option");
      option.value = userData.username; // Assuming username is a property of the user object
      option.text = userData.username; // Assuming username is a property of the user object
      assigneeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Call the fetchUsers function to populate the select element
fetchUsers();

// Helper functions
const resetFormFields = (fields, initialValues) => {
  fields.forEach((field) => {
    field.value = initialValues[field.id] || "";
  });
};

const createButton = (text, position, eventHandler) => {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.style.position = "absolute";
  button.style[position.y] = "10px";
  button.style[position.x] = "10px";
  button.addEventListener("click", eventHandler);
  return button;
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

const isValidTaskData = (data) => {
  const requiredFields = [
    "taskName",
    "tag",
    "storyPoint",
    "priority",
    "assignee",
    "taskStage",
    "taskDescription",
    "taskStatus",
    "category",
  ];
  return requiredFields.every((field) => Boolean(data[field]));
};

const getUniqueTags = (tagSelect) => {
  const selectedTags = Array.from(tagSelect.selectedOptions).map(
    (option) => option.value
  );
  return Array.from(new Set(selectedTags)).join(", ");
};

const sortTasks = (querySnapshot, sortOrder) => {
  let sortedDocs;

  switch (sortOrder) {
    case "RecentToOldest":
      sortedDocs = querySnapshot.docs.sort(
        (a, b) => b.data().timestamp - a.data().timestamp
      );
      break;
    case "LowestToUrgent":
    case "UrgentToLowest":
      const priorityOrder =
        sortOrder === "LowestToUrgent"
          ? ["Low", "Medium", "Important", "Urgent"]
          : ["Urgent", "Important", "Medium", "Low"];
      sortedDocs = querySnapshot.docs.sort(
        (a, b) =>
          priorityOrder.indexOf(a.data().priority) -
          priorityOrder.indexOf(b.data().priority)
      );
      break;
    default:
      sortedDocs = querySnapshot.docs.sort(
        (a, b) => a.data().timestamp - b.data().timestamp
      );
  }

  return sortedDocs;
};

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
// Main code
document.addEventListener("DOMContentLoaded", function () {
  let editingTaskId = null;
  const formFields = document.querySelectorAll(".form-control");
  const tagSelect = document.getElementById("tag");
  const initialFormValues = {};
  formFields.forEach((field) => {
    initialFormValues[field.id] = field.value;
  });
  // console.log('pb', window.history.state.username);
  displayTasksRealtime();
  console.log(window.history.state.username);

  async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  }

  async function updateTask(taskId, newData) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, newData);
  }

  const filterDropdown = document.getElementById("filter");
  filterDropdown.addEventListener("change", () => {
    displayTasksRealtime();
  });

  const sortingDropdown = document.getElementById("sorting");
  sortingDropdown.addEventListener("change", () => {
    const selectedValue = sortingDropdown.value;
    switch (selectedValue) {
      case "Recent to Oldest":
        displayTasksRealtime("RecentToOldest");
        break;
      case "Oldest to Recent":
        displayTasksRealtime("OldestToRecent");
        break;
      case "Lowest to Urgent":
        displayTasksRealtime("LowestToUrgent");
        break;
      case "Urgent to Lowest":
        displayTasksRealtime("UrgentToLowest");
        break;
      default:
        displayTasksRealtime();
    }
  });

  function displayTask(taskData, taskId) {
    const taskList = document.getElementById("taskList");
    const taskItem = document.createElement("div");
    taskItem.id = taskId;
    taskItem.addEventListener("click", () => {
      displayTaskDetails(taskData); // Call a function to display task details
    });

    taskItem.className = "task-item";

    const deleteButton = createButton(
      "X",
      { x: "left", y: "bottom" },
      (event) => {
        event.stopPropagation();
        const confirmDelete = confirm("Do you want to delete this task?");
        if (confirmDelete) {
          deleteTask(taskId);
        }
      }
    );

    const editButton = createButton(
      "Edit",
      { x: "right", y: "bottom" },
      (event) => {
        event.stopPropagation();
        Object.keys(taskData).forEach((key) => {
          const field = document.getElementById(key);
          if (field) {
            field.value = taskData[key];
          }
        });
        editingTaskId = taskId;
        floatingWindow.style.display = "block";
      }
    );

    const priorityClass = getPriorityClass(taskData.priority);
    const coloredTags = getColoredTags(taskData.tag);

    taskItem.innerHTML = `
      <p class="task-name">Name: ${taskData.taskName}</p>
      <p class="task-name">Tag: ${coloredTags}</p>
      <p>Story Point: ${taskData.storyPoint}</p>
      <p>Priority: <span class="${priorityClass}">${taskData.priority}</span></p>
    `;

    [deleteButton, editButton].forEach((button) =>
      taskItem.appendChild(button)
    );
    taskList.appendChild(taskItem);

    console.log(taskData);

    if (taskData.hide === 1) {
      taskItem.style.display = "none";
    }
  }

  function displayTaskDetails(taskData) {
    const taskDetailsContent = document.getElementById("taskDetailsContent");
    const priorityClass = getPriorityClass(taskData.priority);
    const coloredTags = getColoredTags(taskData.tag);

    // Populate the task details in the pop-up window
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

    const taskDetailsWindow = document.getElementById("taskDetailsWindow");
    taskDetailsWindow.style.display = "block";

    // Add an event listener to close the pop-up window
    const closeTaskDetailsButton = document.getElementById("closeTaskDetails");
    closeTaskDetailsButton.addEventListener("click", () => {
      taskDetailsWindow.style.display = "none";
    });
  }

  function displayTasksRealtime(sortOrder = "OldestToRecent") {
    const tasksCollection = collection(db, "tasks");
    const filterValue = document
      .getElementById("filter")
      .value.replace("-filter", "");

    onSnapshot(tasksCollection, (querySnapshot) => {
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";

      const sortedDocs = sortTasks(querySnapshot, sortOrder);

      sortedDocs.forEach((doc) => {
        const taskData = doc.data();
        if (
          filterValue === "All" ||
          filterValue === "" ||
          taskData.tag.includes(filterValue)
        ) {
          displayTask(taskData, doc.id); // Assuming displayTask is defined elsewhere
        }
      });
    });
  }

  // Event listeners for buttons and windows
  const addTaskButton = document.getElementById("addTaskButton");
  const floatingWindow = document.getElementById("floatingWindow");
  const closeFloatingWindow = document.getElementById("closeFloatingWindow");
  const saveTaskButton = document.getElementById("saveTaskButton");
  const productBacklogButton = document.getElementById(
    "product_backlog_button"
  );
  const scumboardButton = document.getElementById("scrum_board_button");
  const createAccountButton = document.getElementById("create_account_button");
  const teamMemberButton = document.getElementById("team_member_button");
  const changePassButton = document.getElementById("changePasswordLink");
  const checkAdmin = window.history.state.isAdmin;

  addTaskButton.addEventListener("click", () => {
    floatingWindow.style.display = "block";
    resetFormFields(formFields, initialFormValues);
  });

  closeFloatingWindow.addEventListener("click", () => {
    floatingWindow.style.display = "none";
  });

  saveTaskButton.addEventListener("click", () => {
    const taskData = Object.fromEntries(
      Array.from(formFields).map((field) => [field.id, field.value])
    );
    taskData.tag = getUniqueTags(tagSelect);
    taskData.hide = 0;

    if (!isValidTaskData(taskData)) {
      alert("Please fill out all fields.");
      return;
    }

    taskData.timestamp = Date.now();

    if (editingTaskId) {
      updateTask(editingTaskId, taskData);
      floatingWindow.style.display = "none";
      editingTaskId = null;
    } else {
      const tasksCollection = collection(db, "tasks");
      addDoc(tasksCollection, taskData).then(() => {
        floatingWindow.style.display = "none";
      });
    }
  });

  scumboardButton.addEventListener("click", () => {
    const routeTo = "scrum-board.html";
    const username = window.history.state.username;
    const admin = window.history.state.isAdmin;
    window.history.pushState(
      { username: username, isAdmin: admin },
      "",
      routeTo
    );
    window.location.href = routeTo; // Redirect to the desired page
  });

  productBacklogButton.addEventListener("click", () => {
    const routeTo = "product-backlog.html";
    const username = window.history.state.username;
    const admin = window.history.state.isAdmin;
    window.history.pushState(
      { username: username, isAdmin: admin },
      "",
      routeTo
    );
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
      {
        username: username,
        isAdmin: admin,
        previousPage: "product-backlog.html",
      },
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
          previousPage: "product-backlog.html",
        },
        "",
        routeTo
      );
      window.location.href = routeTo;
    });
  } else {
    createAccountButton.style.display = "hide"; // Hide the button
  }
});
