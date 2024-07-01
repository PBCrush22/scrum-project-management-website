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
  query,
  where,
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
const changePassButton = document.getElementById("changePasswordLink");
const createAccountButton = document.getElementById("create_account_button");
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

// const addTeamMemberButton = document.getElementById("addTeamMemberButton");

// addTeamMemberButton.addEventListener("click", () => {
//   const dropdownMenu = document.getElementById("teamMemberDropdown");
//   const selectedUser = dropdownMenu.value; // Assuming you have a dropdown menu with the id 'dropdownMenu'

//   // Fetch the user data from the 'users' collection based on the selectedUser
//   const usersCollection = collection(db, "users");
//   const userQuery = query(
//     usersCollection,
//     where("username", "==", selectedUser)
//   ); // Rename the variable here
//   getDocs(userQuery) // Use the new variable here
//     .then((querySnapshot) => {
//       querySnapshot.forEach((doc) => {
//         const userData = doc.data();
//         saveToUsersAdded(userData);
//       });
//     })
//     .catch((error) => {
//       console.error("Error fetching user: ", error);
//     });
// });

function saveToUsersAdded(userData) {
  const usersAddedCollection = collection(db, "users_added");
  const { username, isAdmin } = userData; // Extract the necessary fields from the userData
  const data = { username, isAdmin };

  addDoc(usersAddedCollection, data)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      displayTeamMembers(); // Call the display function after the new member is added
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

async function displayTeamMembersInDropdown() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const usersAddedSnapshot = await getDocs(collection(db, "users_added"));
  const dropdown = document.getElementById("teamMemberDropdown");
  dropdown.innerHTML = "";

  const usersAddedUsernames = usersAddedSnapshot.docs.map(
    (doc) => doc.data().username
  );

  if (usersAddedUsernames.length === usersSnapshot.size) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "All team members added";
    dropdown.appendChild(defaultOption);
  } else {
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!usersAddedUsernames.includes(data.username)) {
        const option = document.createElement("option");
        option.value = data.username;
        option.text = data.username;
        dropdown.appendChild(option);
      }
    });
  }
}

function createDeleteButton(memberId) {
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.innerHTML = "X";
  deleteButton.onclick = (event) => {
    event.stopPropagation();
    deleteTeamMember(memberId);
  };
  // deleteButton.onclick = () => deleteTeamMember(memberId); // Call the delete function
  return deleteButton;
}

async function deleteTeamMember(memberId) {
  try {
    const query = await getDoc(doc(db, "users", memberId));
    const username = query.data().username;

    const userCollection = collection(db, "users");

    getDocs(userCollection)
      .then((querySnapshot) => {
        querySnapshot.forEach(async (docs) => {
          const data = docs.data();
          if (data.username === username) {
            await deleteDoc(docs.ref);
            co;
          }
        });
      })
      .catch((error) => {
        console.error("Error getting documents: ", error);
      });

    await deleteDoc(doc(db, "users_added", memberId));
    console.log("Document successfully deleted!");
    displayTeamMembers(); // Refresh the display after deletion
    displayTeamMembersInDropdown(); // Refresh the dropdown options after deletion
  } catch (error) {
    console.error("Error removing document: ", error);
  }
}

function displayTeamMembers() {
  const teamMembersContainer = document.getElementById("teamMembersContainer");
  teamMembersContainer.innerHTML = ""; // Clear the container before adding new members

  const usersAddedCollection = collection(db, "users");

  getDocs(usersAddedCollection)
    .then((querySnapshot) => {
      querySnapshot.forEach((docs) => {
        const teamMemberData = docs.data();
        const teamMemberId = docs.id; // Extract the team member's ID here

        // Create a card or element to display the team member's data
        const teamMemberCard = document.createElement("div");
        teamMemberCard.className = "card"; // Add class for styling
        teamMemberCard.setAttribute("data-team-member-id", teamMemberId);

        // Card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.innerHTML = `
          <h6 class="card-title">${teamMemberData.username}</h6>
          <p class="card-text">${
            teamMemberData.isAdmin ? "Admin" : "Member"
          }</p>
        `;

        // Append card body to the card
        teamMemberCard.appendChild(cardBody);

        const deleteButton = createDeleteButton(teamMemberId);
        teamMemberCard.appendChild(deleteButton);

        // Append the card to the container
        teamMembersContainer.appendChild(teamMemberCard);

        teamMemberCard.addEventListener("click", (event) => {
          event.stopPropagation();
          event.preventDefault();
          openPopup(teamMemberData);
        });

        async function openPopup(teamMemberData) {
          const popupWindow = document.getElementById("teamMemberWindow");
          const closeTeamMemberPopupButton = document.getElementById(
            "closeTeamMemberPopup"
          );
          popupWindow.classList.add("shifted-popup");

          const usernameElement = document.createElement("p");
          usernameElement.textContent = `Username: ${teamMemberData.username}`;
          usernameElement.style.marginTop = "30px";

          const isAdminElement = document.createElement("p");
          isAdminElement.textContent = `Role: ${
            teamMemberData.isAdmin ? "Admin" : "Member"
          }`;
          isAdminElement.style.marginBottom = "50px";

          const completedTask = {};

          const taskLogCollection = collection(db, "task_logs");

          const querySnapshot = await getDocs(taskLogCollection);

          // Iterate through all documents using forEach
          querySnapshot.forEach((docs) => {
            const data = docs.data();

            if (data.assignee === teamMemberData.username) {
              completedTask[data.taskName] = [data.logDate, data.timeSpent];
            }
          });

          const completedTasksArray = Object.entries(completedTask).map(
            ([taskName, [logDate, timeSpent]]) => {
              const hours = Math.floor(timeSpent);
              const minutes = Math.round((timeSpent - hours) * 60);
              return `${taskName} (Date: ${logDate}, Time Spent: ${hours} hours and ${minutes} minutes)`;
            }
          );

          const taskCompletedElement = document.createElement("div");

          const taskCompletedTitle = document.createElement("p");
          taskCompletedTitle.textContent = "Task Completed:";
          taskCompletedElement.appendChild(taskCompletedTitle);
          taskCompletedTitle.style.marginBottom = "20px";

          // Add Task completed and Time spent elements
          completedTasksArray.forEach((task) => {
            const taskElement = document.createElement("p");
            taskElement.textContent = task;
            taskCompletedElement.appendChild(taskElement);
          });

          // Clear existing content
          popupWindow.innerHTML = "";

          // Append new content
          popupWindow.appendChild(usernameElement);
          popupWindow.appendChild(isAdminElement);
          popupWindow.appendChild(taskCompletedElement);
          popupWindow.appendChild(closeTeamMemberPopupButton);

          // Display the pop-up window
          popupWindow.style.display = "block";

          // Add event listener to the close button
          closeTeamMemberPopupButton.addEventListener("click", () => {
            // Hide the teamMemberPopup when the close button is clicked
            document.getElementById("teamMemberWindow").style.display = "none";
          });
        }

        // Function to close the pop-up window
        function closePopup() {
          const popupWindow = document.getElementById("teamMemberWindow");
          popupWindow.style.display = "none";
        }

        document.addEventListener("click", (event) => {
          if (event.target === document.getElementById("teamMemberWindow")) {
            closePopup();
          }
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching team member: ", error);
    });
}

// Call the function to display Sprint Backlogs when the page loads
window.addEventListener("load", () => {
  displayTeamMembersInDropdown();
  displayTeamMembers();

  const usersAddedCollection = collection(db, "users_added");
  onSnapshot(usersAddedCollection, () => {
    displayTeamMembersInDropdown();
  });
});
