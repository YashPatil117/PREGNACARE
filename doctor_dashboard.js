import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, query, where, getDocs, collection, FieldValue } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import emailjs from 'emailjs-com'; // Import EmailJS

const firebaseConfig = {
    apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
    authDomain: "pregnacare-70aed.firebaseapp.com",
    projectId: "pregnacare-70aed",
    storageBucket: "pregnacare-70aed.appspot.com",
    messagingSenderId: "375969305451",
    appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e",
    measurementId: "G-34LJE5R27W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// EmailJS init
emailjs.init("t3u-O3DqYyw900CBp"); // Replace with your public key

let doctorID = "";
let currentUser; // To store the logged-in user

// Function to load patients for the logged-in doctor
function loadPatients() {
    if (!currentUser) {
        console.warn("loadPatients called before user authentication.");
        return; // Exit if no user is logged in
    }

    db.collection("patients")
        .where("doctorId", "==", doctorID)
        .get()
        .then(snapshot => {
            const ul = document.getElementById("patientList");
            ul.innerHTML = ""; // Clear the list before adding patients
            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement("li");
                li.setAttribute("data-id", doc.id);
                const lastEmailSent = data.lastEmailSent
                    ? new Date(data.lastEmailSent.toDate()).toLocaleDateString()
                    : "N/A";
                li.innerHTML = `
                    <strong>${data.fname} ${data.lname}</strong><br>
                    Email: ${data.email}<br>
                    Month: ${data.month}<br>
                    Last Email Sent: ${lastEmailSent}
                `;
                ul.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error loading patients:", error);
            alert("Error loading patients: " + error.message);
        });
}

// Function to send an email to a patient
function sendEmailToPatient(patientData) {
    const monthNum = parseInt(patientData.month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 9) {
        alert("Invalid pregnancy month for " + patientData.fname);
        return;
    }

    let templateId = '';
    if (monthNum >= 1 && monthNum <= 4) {
        templateId = 'template_xun19bp';
    } else if (monthNum >= 5 && monthNum <= 9) {
        templateId = 'template_panjjcp';
    }

    const emailParams = {
        to_email: patientData.email,
        patient_name: patientData.fname,
        reply_to: patientData.email,
    };

    console.log("EmailJS templateId:", templateId);  // Debugging: Check templateId
    console.log("EmailJS emailParams:", emailParams); // Debugging: Check emailParams

    emailjs.send("service_2yyas18", templateId, emailParams)
        .then(response => {
            console.log('Email sent successfully:', response);
            return db.collection("patients").doc(patientData.id).update({
                lastEmailSent: FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert("Email sent to " + patientData.fname);
        })
        .catch(error => {
            console.error("Failed to send email:", error);
            alert("Failed to send email to " + patientData.fname + ": " + error.message);
        });
}

// Function to send monthly emails to all patients
function sendMonthlyEmails() {
    const patients = document.querySelectorAll("#patientList li");
    patients.forEach(el => {
        const id = el.getAttribute("data-id");
        db.collection("patients").doc(id).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const lastEmailSent = data.lastEmailSent ? new Date(data.lastEmailSent.toDate()) : null;
                    const now = new Date();
                    // Check if the last email was sent in a previous month
                    if (!lastEmailSent || lastEmailSent.getMonth() < now.getMonth() || lastEmailSent.getFullYear() < now.getFullYear()) {
                        sendEmailToPatient({ ...data, id: doc.id });
                    } else {
                        console.log(`Email already sent this month to ${data.fname} (${data.email})`);
                    }
                }
            })
            .catch(err => {
                console.error("Error fetching patient data: ", err);
            });
    });
}

document.getElementById("sendEmailsBtn").addEventListener("click", sendMonthlyEmails);

// Function to open the change password modal
function openChangePasswordModal() {
    document.getElementById("changePasswordModal").style.display = "flex";
}

// Function to close the change password modal
function closeChangePasswordModal() {
    document.getElementById("changePasswordModal").style.display = "none";
}

// Function to change the user's password
function changePassword() {
    const newPassword = document.getElementById("newPassword").value;

    if (!newPassword || newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (!currentUser) {
        alert("No user is currently logged in.");
        return;
    }

    currentUser.updatePassword(newPassword)
        .then(() => {
            alert("Password changed successfully.");
            closeChangePasswordModal();
            // Sign out the user after they change their password.
            signOut(auth);
            window.location.href = "doctorlogin.html"; // Redirect to login
        })
        .catch(error => {
            console.error("Error changing password:", error);
            alert("Error changing password: " + error.message);
        });
}

document.getElementById("changePasswordBtn").addEventListener("click", changePassword);
document.getElementById("closeModalBtn").addEventListener("click", closeChangePasswordModal);


// --- Authentication and Initialization ---

// Function to handle user authentication state changes
function handleAuthStateChanged(user) {
    if (user) {
        currentUser = user; // Set the current user
        // Fetch the doctor's data to get the doctorID
        db.collection("doctors").doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    doctorID = doc.data().doctorId;
                    loadPatients(); // Load patients after getting doctorID
                } else {
                    console.error("Doctor data not found for UID:", user.uid);
                    alert("Doctor data not found. Please contact support.");
                    signOut(auth); // Sign out the user if doctor data is missing
                }
            })
            .catch(error => {
                console.error("Error fetching doctor data:", error);
                alert("Error fetching doctor data: " + error.message);
                signOut(auth); // Sign out on error
            });
    } else {
        // User is signed out
        currentUser = null;
        doctorID = "";
        console.log("User is signed out");
        window.location.href = "doctorlogin.html"; // Redirect to login page
    }
}

// Set up an authentication state listener
onAuthStateChanged(auth, handleAuthStateChanged);


// Function to handle user logout
function logout() {
    signOut(auth)
        .then(() => {
            console.log("User signed out.");
            //  window.location.href = "doctorlogin.html"; // Redirect handled by auth state listener
        })
        .catch(error => {
            console.error("Error signing out:", error);
            alert("Logout failed: " + error.message);
        });
}

document.getElementById("logoutBtn").addEventListener("click", logout);
