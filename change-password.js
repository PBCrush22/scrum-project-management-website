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

console.log(window.history.state)
// Initialize Firebase
const app = initializeApp(firebaseConfig, "Data Diver");
const db = getFirestore(app, { experimentalAutoDetectLongPolling: true, });

const usersCollection = collection(db, "users");

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

// Function to update password and redirect
async function updatePasswordAndRedirect(username, newPassword) {
    const query = firestoreQuery(usersCollection, where("username", "==", username));
    const querySnapshot = await getDocs(query);
  
    querySnapshot.forEach(async (doc) => {
      // Update password in the matching document
      await updateDoc(doc.ref, {
        password: newPassword,
      });
  
      // Redirect to the login page
      redirectToPreviousPage();
    });
  
    // If the loop completes without finding a matching username, you can handle it here (e.g., show an error message).
}
const backButton = document.getElementById("back-button")
backButton.addEventListener("click", () => {
  redirectToPreviousPage();
})
const changePasswordBtn = document.getElementById("change_new_password");
changePasswordBtn.addEventListener("click", () => {
  const username = window.history.state.username;
  const newPassword = document.getElementById("new_password").value;
  const confirmPassword = document.getElementById("check_new_password").value;

  if (newPassword === "") {
    alert("Please fill in password.");
    return;
  }

  if (newPassword === confirmPassword) {
    // Call the function to update password and redirect
    updatePasswordAndRedirect(username, newPassword);
  } else {
    // Handle password mismatch error (e.g., display an error message to the user)
    alert("Passwords do not match. Please try again.");
  }
});