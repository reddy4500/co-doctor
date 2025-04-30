import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAUCDNMGGGRMjfq3_-2MY5P_rUMt6a7rfs",
  authDomain: "riims-45a22.firebaseapp.com",
  projectId: "riims-45a22",
  storageBucket: "riims-45a22.appspot.com",
  messagingSenderId: "65833594122",
  appId: "1:65833594122:web:7ef63f955aff3bbd09def3",
  measurementId: "G-HH550FMYZQ"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------- User Registration -----------
async function register() {
  const fullname = document.getElementById('reg-fullname').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const errorElem = document.getElementById('register-error');
  errorElem.innerText = "";

  if (!fullname || !phone || !username || !password) {
    errorElem.style.color = "red";
    errorElem.innerText = "Please fill in all fields.";
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    errorElem.style.color = "red";
    errorElem.innerText = "Please enter a valid 10-digit phone number.";
    return;
  }

  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    errorElem.style.color = "red";
    errorElem.innerText = "Username already exists. Please choose another.";
    return;
  }

  await setDoc(userRef, { fullname, phone, password });
  errorElem.style.color = "green";
  errorElem.innerText = "Registration successful! Redirecting to login...";
  setTimeout(() => { window.location.href = 'login.html'; }, 1200);
}

// ----------- User Login -----------
async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorElem = document.getElementById('login-error');
  errorElem.innerText = "";

  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().password === password) {
    sessionStorage.setItem('loggedIn', 'true');
    sessionStorage.setItem('username', username);
    window.location.href = 'form.html';
  } else {
    errorElem.style.color = "red";
    errorElem.innerText = "Invalid credentials!";
  }
}

// ----------- Logout -----------
function logout() {
  sessionStorage.removeItem('loggedIn');
  sessionStorage.removeItem('username');
  window.location.href = 'login.html';
}

// ----------- Assignment Functions -----------

// Assign user to system/subsystem
async function submitAssignment() {
  const systemId = document.getElementById('system-select').value;
  const subsystem = document.getElementById('subsystem-select').value;
  const msg = document.getElementById('success-message');
  msg.textContent = "";

  if (!systemId || !subsystem) {
    msg.style.color = "#c0392b";
    msg.innerText = "Please select both system and subsystem!";
    return;
  }

  const username = sessionStorage.getItem('username');
  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    msg.style.color = "#c0392b";
    msg.innerText = "User not found!";
    return;
  }
  const user = userSnap.data();

  // Remove user from all previous assignments
  const assignmentsCol = collection(db, "assignments");
  const assignmentsSnap = await getDocs(assignmentsCol);
  for (const docSnap of assignmentsSnap.docs) {
    const data = docSnap.data();
    if (data.users && data.users.some(u => u.username === username)) {
      await updateDoc(doc(db, "assignments", docSnap.id), {
        users: arrayRemove({ fullname: user.fullname, phone: user.phone, username: username })
      });
    }
  }

  // Assign to new system/subsystem
  const assignmentId = `${systemId}_${subsystem}`;
  const assignmentRef = doc(db, "assignments", assignmentId);
  const assignmentSnap = await getDoc(assignmentRef);

  if (assignmentSnap.exists()) {
    await updateDoc(assignmentRef, {
      users: arrayUnion({ fullname: user.fullname, phone: user.phone, username: username })
    });
  } else {
    await setDoc(assignmentRef, {
      users: [{ fullname: user.fullname, phone: user.phone, username: username }]
    });
  }

  msg.style.color = "#27ae60";
  msg.innerText = "Assignment successful!";
  setTimeout(() => {
    msg.innerText = "";
    showAssignmentInfo();
  }, 700);
}

// Remove user from their assignment
async function leaveAssignment(systemId, subsystem, username) {
  const assignmentId = `${systemId}_${subsystem}`;
  const assignmentRef = doc(db, "assignments", assignmentId);

  // Get user data
  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const user = userSnap.data();

  await updateDoc(assignmentRef, {
    users: arrayRemove({ fullname: user.fullname, phone: user.phone, username: username })
  });

  const msg = document.getElementById('success-message');
  msg.style.color = "#c0392b";
  msg.innerText = "You have left the subsystem.";
  setTimeout(() => {
    msg.innerText = "";
    showAssignmentInfo();
  }, 1000);
}

// Display the user's current assignment and show "Leave" button
async function showAssignmentInfo() {
  const username = sessionStorage.getItem('username');
  const assignmentsCol = collection(db, "assignments");
  const assignmentsSnap = await getDocs(assignmentsCol);

  let assigned = false;
  let assignedSystem = '', assignedSubsystem = '', assignedSystemId = '';

  for (const docSnap of assignmentsSnap.docs) {
    const data = docSnap.data();
    if (data.users && data.users.some(u => u.username === username)) {
      assigned = true;
      const [sysId, sub] = docSnap.id.split('_');
      assignedSystemId = sysId;
      assignedSystem = typeof systems !== "undefined" && systems.find(s => s.id == sysId) ? systems.find(s => s.id == sysId).name : sysId;
      assignedSubsystem = sub;
      break;
    }
  }

  const assignmentDiv = document.getElementById('assignment-info');
  const formSection = document.getElementById('form-section');

  if (assigned) {
    if (formSection) formSection.style.display = 'none';
    assignmentDiv.innerHTML = `
      You are assigned to:<br>
      System: ${assignedSystem}<br>
      Subsystem: ${assignedSubsystem}<br>
      <button id="leave-btn">Leave</button>
    `;
    document.getElementById('leave-btn').onclick = function() {
      leaveAssignment(assignedSystemId, assignedSubsystem, username);
    };
  } else {
    if (formSection) formSection.style.display = '';
    assignmentDiv.innerHTML = '';
  }
}

// ----------- Greeting on Form Page -----------
async function greetUser() {
  const username = sessionStorage.getItem('username');
  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists() && document.getElementById('greeting')) {
    const user = userSnap.data();
    document.getElementById('greeting').innerHTML =
      `Welcome, Dr. ${user.fullname}<br>Phone: ${user.phone}`;
  }
}

// ----------- Page Initialization -----------
async function initFormPage() {
  await greetUser();
  if (typeof populateSystems === "function") populateSystems();
  await showAssignmentInfo();
}

// ----------- Event Listeners for Buttons -----------
document.addEventListener('DOMContentLoaded', function () {
  // Register page
  if (document.getElementById('register-btn')) {
    document.getElementById('register-btn').addEventListener('click', function(e) {
      e.preventDefault();
      register();
    });
  }
  // Login page
  if (document.getElementById('login-btn')) {
    document.getElementById('login-btn').addEventListener('click', function(e) {
      e.preventDefault();
      login();
    });
  }
  // Form page (assignment submit)
  if (document.getElementById('assignment-submit-btn')) {
    document.getElementById('assignment-submit-btn').addEventListener('click', function(e) {
      e.preventDefault();
      submitAssignment();
    });
  }
  // Logout button (if present)
  if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
  // Form page initialization
  if (typeof initFormPage === "function" && document.getElementById('form-section')) {
    initFormPage();
  }
});


