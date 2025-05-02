// Firebase config
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
const db = firebase.firestore();
const auth = firebase.auth();

const doctorID = "doc123"; // Replace with dynamic ID on login

const pregnancyMessages = [
  "Congratulations on your pregnancy! It's still early, but your baby is beginning to form.",
  "The first trimester is almost over! Your baby's heart is now beating and growing fast.",
  "By now, your baby is the size of a peach! Expecting some movements soon.",
  "Your baby is growing stronger! Their organs are now functioning and they’re becoming more active.",
  "Halfway there! Your baby can now hear sounds and may even respond to your touch.",
  "The baby is getting bigger and stronger. They are starting to recognize voices!",
  "Almost there! Your baby is practicing breathing and moving more vigorously.",
  "In the final stretch! Your baby is preparing for birth and continues to grow.",
  "It's time! Get ready for your baby's arrival, your little one is about to make their debut."
];

function loadPatients() {
  db.collection("patients")
    .where("doctorID", "==", doctorID)
    .get()
    .then(snapshot => {
      const ul = document.getElementById("patientList");
      ul.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.setAttribute("data-id", doc.id);
        li.innerHTML = `
          <strong>${data.name}</strong><br>
          Email: ${data.email}<br>
          Month: ${data.pregnancyMonth}<br>
          Last Email Sent: ${data.lastEmailSent ? new Date(data.lastEmailSent).toLocaleDateString() : "N/A"}
        `;
        ul.appendChild(li);
      });
    })
    .catch(error => {
      alert("Error loading patients: " + error.message);
    });
}

function sendEmailToPatient(patient) {
  const message = pregnancyMessages[patient.pregnancyMonth - 1];
  const params = {
    Host: "smtp.yourprovider.com",
    Username: "YOUR_EMAIL",
    Password: "YOUR_PASSWORD",
    To: patient.email,
    From: "YOUR_EMAIL",
    Subject: `Pregnancy Update - Month ${patient.pregnancyMonth}`,
    Body: `Hi ${patient.name},\n\nYou're in month ${patient.pregnancyMonth} of your pregnancy. Here's what to expect:\n\n${message}`
  };

  Email.send(params)
    .then(() => {
      db.collection("patients").doc(patient.id).update({
        lastEmailSent: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert("Email sent to " + patient.name);
    })
    .catch(error => {
      alert("Failed to send email: " + error.message);
    });
}

function sendMonthlyEmails() {
  const patients = document.querySelectorAll("#patientList li");
  patients.forEach(el => {
    const id = el.getAttribute("data-id");
    db.collection("patients").doc(id).get()
      .then(doc => {
        const data = doc.data();
        const last = data.lastEmailSent ? new Date(data.lastEmailSent) : null;
        const now = new Date();
        if (!last || last.getMonth() !== now.getMonth()) {
          sendEmailToPatient({ ...data, id });
        }
      });
  });
}

document.getElementById("sendEmailsBtn").addEventListener("click", sendMonthlyEmails);

// Change Password Modal Functions
function openChangePasswordModal() {
  document.getElementById("changePasswordModal").style.display = "flex";
}

function closeChangePasswordModal() {
  document.getElementById("changePasswordModal").style.display = "none";
}

function changePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const user = auth.currentUser;

  if (!newPassword || newPassword.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  user.updatePassword(newPassword)
    .then(() => {
      alert("Password changed successfully.");
      closeChangePasswordModal();
    })
    .catch(error => {
      alert("Error changing password: " + error.message);
    });
}

// Simulated login - you must implement real auth logic
auth.signInWithEmailAndPassword("doctor@example.com", "testpassword")
  .then(() => loadPatients())
  .catch(error => console.log("Auth error:", error));

  function logout() {
    auth.signOut().then(() => {
      window.location.href = "doctorlogin.html"; // Redirect to login page
    }).catch(error => {
      alert("Logout failed: " + error.message);
    });
  }
