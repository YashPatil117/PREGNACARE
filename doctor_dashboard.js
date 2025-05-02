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
const auth = firebase.auth();

// EmailJS init
emailjs.init("t3u-O3DqYyw900CBp"); // Replace with your public key

let doctorID = "";

function loadPatients() {
  db.collection("patients")
      .where("doctorId", "==", doctorID)
      .get()
      .then(snapshot => {
          const ul = document.getElementById("patientList");
          ul.innerHTML = "";
          snapshot.forEach(doc => {
              const data = doc.data();
              const li = document.createElement("li");
              li.setAttribute("data-id", doc.id);
              li.innerHTML = `
                  <strong>${data.fname} ${data.lname}</strong><br>
                  Email: ${data.email}<br>
                  Month: ${data.month}<br>
                  Last Email Sent: ${data.lastEmailSent ? new Date(data.lastEmailSent.toDate()).toLocaleDateString() : "N/A"}
              `;
              ul.appendChild(li);
          });
      })
      .catch(error => {
          alert("Error loading patients: " + error.message);
      });
}

function sendEmailToPatient(patientData) { // Renamed parameter to clarify it's the document data
  const monthNum = parseInt(patientData.month);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 9) {
      alert("Invalid pregnancy month for " + patientData.fname);
      return;
  }

  const templateId = `template_month${monthNum}`; // Ensure this matches your template ID

  // *** IMPORTANT: Adjust these keys to match your EmailJS template variables! ***
  const emailParams = {
      to_email: patientData.email, // Using the 'email' field from your Firestore document
      patient_name: patientData.fname, // Using the 'fname' (first name) field
      // You can add other patient data here if your EmailJS template uses them,
      // for example:
      // husband_name: patientData.husbandName,
      // pregnancy_month: patientData.month,
      reply_to: patientData.email // If you want replies to go to the patient's email
  };

  emailjs.send("service_2yyas18", templateId, emailParams)
      .then(() => {
          db.collection("patients").doc(patientData.id).update({ // Ensure you have the document ID
              lastEmailSent: firebase.firestore.FieldValue.serverTimestamp()
          });
          alert("Email sent to " + patientData.fname);
      })
      .catch(error => {
          alert("Failed to send email to " + patientData.fname + ": " + error.message);
          console.error(error);
      });
}

function sendMonthlyEmails() {
  const patients = document.querySelectorAll("#patientList li");
  patients.forEach(el => {
      const id = el.getAttribute("data-id");
      db.collection("patients").doc(id).get()
          .then(doc => {
              if (doc.exists) {
                  const data = doc.data();
                  const last = data.lastEmailSent ? new Date(data.lastEmailSent.toDate()) : null;
                  const now = new Date();
                  if (!last || last.getMonth() !== now.getMonth()) {
                      sendEmailToPatient({ ...data, id: doc.id }); // Pass the document data and ID
                  }
              }
          });
  });
}

document.getElementById("sendEmailsBtn").addEventListener("click", sendMonthlyEmails);

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

// Login logic
auth.signInWithEmailAndPassword("doctor@example.com", "testpassword")
  .then(userCredential => {
      const uid = userCredential.user.uid;
      return db.collection("doctors").doc(uid).get();
  })
  .then(doc => {
      if (doc.exists) {
          doctorID = doc.data().doctorId;
          loadPatients();
      } else {
          throw new Error("Doctor data not found.");
      }
  })
  .catch(error => {
      console.error("Auth error:", error);
  });

function logout() {
  auth.signOut().then(() => {
      window.location.href = "doctorlogin.html";
  }).catch(error => {
      alert("Logout failed: " + error.message);
  });
}