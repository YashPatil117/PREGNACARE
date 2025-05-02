// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// import {
//     getAuth,
//     signInWithEmailAndPassword,
//     signOut,
//     onAuthStateChanged,
//     updatePassword
// } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
// import {
//     getFirestore,
//     doc,
//     setDoc,
//     query,
//     where,
//     getDocs,
//     getDoc,
//     collection,
//     updateDoc,
//     serverTimestamp
// } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// // EmailJS init
// emailjs.init("gQHn8KnqdUXOoFzGl"); // Replace with your actual public key

// const firebaseConfig = {
//     apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
//     authDomain: "pregnacare-70aed.firebaseapp.com",
//     projectId: "pregnacare-70aed",
//     storageBucket: "pregnacare-70aed.appspot.com",
//     messagingSenderId: "375969305451",
//     appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e",
//     measurementId: "G-34LJE5R27W"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// let doctorID = "";
// let currentUser;

// // Function to load patients (women) for the logged-in doctor
// function loadPatients() {
//     if (!currentUser) return;

//     const q = query(collection(db, "women"), where("doctorId", "==", doctorID));
//     getDocs(q)
//         .then(snapshot => {
//             const ul = document.getElementById("patientList");
//             ul.innerHTML = "";
//             snapshot.forEach(docSnap => {
//                 const data = docSnap.data();
//                 const li = document.createElement("li");
//                 li.setAttribute("data-id", docSnap.id);
//                 const lastEmailSent = data.lastEmailSent
//                     ? new Date(data.lastEmailSent.toDate()).toLocaleDateString()
//                     : "N/A";
//                 li.innerHTML = `
//                     <strong>${data.fname} ${data.lname}</strong><br>
//                     Email: ${data.email}<br>
//                     Month: ${data.month}<br>
//                     Last Email Sent: ${lastEmailSent}
//                 `;
//                 ul.appendChild(li);
//             });
//         })
//         .catch(error => {
//             console.error("Error loading patients:", error);
//             alert("Error loading patients: " + error.message);
//         });
// }

// function sendEmailToPatient(patientData) {
//     const monthNum = parseInt(patientData.month);
//     if (isNaN(monthNum) || monthNum < 1 || monthNum > 9) {
//         alert("Invalid pregnancy month for " + patientData.fname);
//         return;
//     }

//     let templateId = '';
//     if (monthNum >= 1 && monthNum <= 4) {
//         templateId = 'template_xun19bp';
//     } else if (monthNum >= 5 && monthNum <= 9) {
//         templateId = 'template_panjjcp';
//     }

//     const emailParams = {
//         to_email: patientData.email,
//         patient_name: patientData.fname,
//         reply_to: patientData.email,
//     };

//     emailjs.send("service_2yyas18", templateId, emailParams)
//         .then(() => {
//             return updateDoc(doc(db, "women", patientData.id), {
//                 lastEmailSent: serverTimestamp()
//             });
//         })
//         .then(() => {
//             alert("Email sent to " + patientData.fname);
//         })
//         .catch(error => {
//             console.error("Failed to send email:", error);
//             alert("Failed to send email to " + patientData.fname + ": " + error.message);
//         });
// }

// // Send monthly emails
// function sendMonthlyEmails() {
//     const patients = document.querySelectorAll("#patientList li");
//     patients.forEach(el => {
//         const id = el.getAttribute("data-id");
//         getDoc(doc(db, "women", id))
//             .then(docSnap => {
//                 if (docSnap.exists()) {
//                     const data = docSnap.data();
//                     const lastEmailSent = data.lastEmailSent ? new Date(data.lastEmailSent.toDate()) : null;
//                     const now = new Date();
//                     if (!lastEmailSent || lastEmailSent.getMonth() < now.getMonth() || lastEmailSent.getFullYear() < now.getFullYear()) {
//                         sendEmailToPatient({ ...data, id: docSnap.id });
//                     } else {
//                         console.log(`Email already sent this month to ${data.fname}`);
//                     }
//                 }
//             })
//             .catch(err => {
//                 console.error("Error fetching patient data: ", err);
//             });
//     });
// }

// document.getElementById("sendEmailsBtn").addEventListener("click", sendMonthlyEmails);

// // Password Modal Handlers
// function openChangePasswordModal() {
//     document.getElementById("changePasswordModal").style.display = "flex";
// }
// function closeChangePasswordModal() {
//     document.getElementById("changePasswordModal").style.display = "none";
// }
// function changePassword() {
//     const newPassword = document.getElementById("newPassword").value;
//     if (!newPassword || newPassword.length < 6) {
//         alert("Password must be at least 6 characters.");
//         return;
//     }

//     if (!currentUser) {
//         alert("No user is currently logged in.");
//         return;
//     }

//     updatePassword(currentUser, newPassword)
//         .then(() => {
//             alert("Password changed successfully.");
//             closeChangePasswordModal();
//             signOut(auth);
//             window.location.href = "doctorlogin.html";
//         })
//         .catch(error => {
//             console.error("Error changing password:", error);
//             alert("Error changing password: " + error.message);
//         });
// }

// document.getElementById("changePasswordBtn").addEventListener("click", changePassword);
// document.getElementById("closeModalBtn").addEventListener("click", closeChangePasswordModal);

// // Auth State
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         currentUser = user;
//         getDoc(doc(db, "doctors", user.uid))
//             .then(docSnap => {
//                 if (docSnap.exists()) {
//                     doctorID = docSnap.data().doctorId;
//                     loadPatients();
//                 } else {
//                     console.error("Doctor data not found");
//                     alert("Doctor profile not found.");
//                     signOut(auth);
//                 }
//             })
//             .catch(error => {
//                 console.error("Error getting doctor data:", error);
//                 alert("Error fetching doctor data: " + error.message);
//                 signOut(auth);
//             });
//     } else {
//         currentUser = null;
//         doctorID = "";
//         console.log("User signed out.");
//         window.location.href = "doctorlogin.html";
//     }
// });

// // Logout
// document.getElementById("logoutBtn").addEventListener("click", () => {
//     signOut(auth)
//         .then(() => {
//             console.log("User signed out.");
//         })
//         .catch(error => {
//             console.error("Logout error:", error);
//             alert("Logout failed: " + error.message);
//         });
// });
