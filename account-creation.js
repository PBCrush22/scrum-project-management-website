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
const db = getFirestore(app, { experimentalAutoDetectLongPolling: true, });

// Function to create a new user account in Firestore
function createAccount(username, password) {
    return addDoc(collection(db, "users"), {
      username: username,
      password: password,
      isAdmin: false,
    });
}

function redirectToPreviousPage() {
  const routeTo = window.history.state.previousPage
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState(
    { username: username, isAdmin: admin },
    "",
    routeTo
  );
  window.location.href = routeTo; // Redirect to the desired page

}

// Function to check if a username is already taken
async function isUsernameTaken(username) {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);

    let isTaken = false;

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.username === username) {
            isTaken = true;
        }
    });

    return isTaken;
}

const backButton = document.getElementById("back-button")
backButton.addEventListener("click", () => {
  redirectToPreviousPage();
})

const createAccountButton = document.getElementById("createAccountButton");

if (createAccountButton) {
    createAccountButton.addEventListener("click", async() => {
    const username = document.getElementById("create_username").value;
    const password = document.getElementById("create_password").value;

    if (username === "" ){
      alert("Please fill in username.");
      return
    }

    if (password === ""){
      alert("Please set password.");
      return
    }

    const isTaken = await isUsernameTaken(username);

    if (isTaken) {
        alert("Username is already taken. Please choose another one.")
        console.error("Username is already taken. Please choose another one.");
        // You can display an error message to the user indicating the username is taken
        return;
    }

    // Call the createAccount function when the button is clicked
    createAccount(username, password)
        .then(() => {
        console.log("Account created successfully!");
        redirectToPreviousPage()
        // Redirect or show a success message to the user
        })
        .catch((error) => {
        console.error("Error creating account: ", error);
        // Handle the error, e.g., show an error message to the user
        });
    });
}
