// dashboard.js

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
  authDomain: "pregnacare-70aed.firebaseapp.com",
  projectId: "pregnacare-70aed",
  storageBucket: "pregnacare-70aed.firebasestorage.app",
  messagingSenderId: "375969305451",
  appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e",
  measurementId: "G-34LJE5R27W"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// On page load, get the doctor
auth.onAuthStateChanged(user => {
  if (user) {
    const email = user.email;

    // Find doctor info by email
    db.ref("doctors").orderByChild("email").equalTo(email).once("value", snapshot => {
      if (snapshot.exists()) {
        const doctorData = Object.values(snapshot.val())[0];
        const doctorName = doctorData.name;
        const doctorId = doctorData.doctorId;

        document.getElementById("doctor-name").innerText = doctorName;

        // Now fetch patients assigned to this doctor
        fetchPatients(doctorId);
      } else {
        alert("Doctor profile not found!");
      }
    });
  } else {
    window.location.href = "doctorlogin.html"; // Not logged in
  }
});

// Fetch patients assigned to this doctor
function fetchPatients(doctorId) {
  const patientsTable = document.getElementById("patients-table").querySelector("tbody");

  db.ref("patients").orderByChild("doctorId").equalTo(doctorId).on("value", snapshot => {
    patientsTable.innerHTML = "";

    if (snapshot.exists()) {
      snapshot.forEach(childSnapshot => {
        const patient = childSnapshot.val();

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${patient.name}</td>
          <td>${patient.mobile}</td>
          <td>${patient.email}</td>
          <td>${patient.pregnancyStatus || 'Not Reported'}</td>
        `;

        patientsTable.appendChild(row);
      });
    } else {
      patientsTable.innerHTML = "<tr><td colspan='4'>No patients assigned yet.</td></tr>";
    }
  });
}

// Logout button
document.getElementById("logout-button").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "doctorlogin.html";
  });
});
