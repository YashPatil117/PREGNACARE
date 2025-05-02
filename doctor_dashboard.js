// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
  authDomain: "pregnacare-70aed.firebaseapp.com",
  projectId: "pregnacare-70aed",
  storageBucket: "pregnacare-70aed.appspot.com",
  messagingSenderId: "375969305451",
  appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e",
  measurementId: "G-34LJE5R27W"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Doctor's unique ID (dummy)
const doctorID = "doc123";

// Messages per pregnancy month
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

// Load patients assigned to this doctor
function loadPatients() {
  db.collection("patients")
    .where("doctorID", "==", doctorID)
    .get()
    .then(snapshot => {
      const ul = document.getElementById("patientList");
      ul.innerHTML = "";

      if (snapshot.empty) {
        ul.innerHTML = "<li>No patients assigned.</li>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const patient = {
          id: doc.id,
          name: data.name,
          email: data.email,
          pregnancyMonth: data.pregnancyMonth,
          lastEmailSent: data.lastEmailSent
        };
        addPatientToUI(patient);
      });
    })
    .catch(error => {
      alert("Error loading patients: " + error.message);
    });
}

// Add patient to the HTML
function addPatientToUI(patient) {
  const ul = document.getElementById("patientList");
  const li = document.createElement("li");
  li.setAttribute("data-id", patient.id);
  li.innerHTML = `
    <strong>${patient.name}</strong><br>
    Email: ${patient.email}<br>
    Month: ${patient.pregnancyMonth}<br>
    Last Email Sent: ${patient.lastEmailSent ? new Date(patient.lastEmailSent.toDate()).toLocaleDateString() : "N/A"}
  `;
  ul.appendChild(li);
}

// Send email via SMTP.js
function sendEmailToPatient(patient) {
  const month = patient.pregnancyMonth;
  const message = pregnancyMessages[month - 1];

  const params = {
    SecureToken: "YOUR_SMTP_SECURE_TOKEN", // use secure token from smtpjs.com (or your own config)
    To: patient.email,
    From: "YOUR_EMAIL@example.com",
    Subject: `Pregnancy Update - Month ${month}`,
    Body: `Hi ${patient.name},<br><br>You're in month ${month} of your pregnancy. Here's what to expect:<br><br>${message}<br><br>Stay healthy!<br>~ Pregnacare`
  };

  Email.send(params)
    .then(() => {
      // Update Firestore
      db.collection("patients")
        .doc(patient.id)
        .update({
          lastEmailSent: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => alert(`Email sent to ${patient.name}`))
        .catch(err => alert("Firestore update failed: " + err.message));
    })
    .catch(err => alert("Email failed: " + err.message));
}

// Send monthly emails (if not already sent this month)
function sendMonthlyEmails() {
  const patientElements = document.querySelectorAll("#patientList li");
  patientElements.forEach(el => {
    const id = el.getAttribute("data-id");
    db.collection("patients").doc(id).get().then(doc => {
      const data = doc.data();
      const lastSent = data.lastEmailSent ? new Date(data.lastEmailSent.toDate()) : null;
      const now = new Date();

      if (!lastSent || lastSent.getMonth() !== now.getMonth() || lastSent.getFullYear() !== now.getFullYear()) {
        sendEmailToPatient({ ...data, id });
      }
    });
  });
}

// Initialize after DOM loads
window.onload = function () {
  loadPatients();
  document.getElementById("sendEmailsBtn").addEventListener("click", sendMonthlyEmails);
};
