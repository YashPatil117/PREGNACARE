// Import required Firebase modules (Modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
  authDomain: "pregnacare-70aed.firebaseapp.com",
  projectId: "pregnacare-70aed",
  storageBucket: "pregnacare-70aed.appspot.com",
  messagingSenderId: "375969305451",
  appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e",
  measurementId: "G-34LJE5R27W",
  databaseURL: "https://pregnacare-70aed-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Database
const auth = getAuth(app);
const db = getDatabase(app);

// Form submit event
const form = document.getElementById('doctor-registration-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const email = document.getElementById('email').value.trim();
  const specialization = document.getElementById('specialization').value.trim();
  const doctorId = document.getElementById('doctor-id').value.trim();

  if (!name || !mobile || !email || !specialization || !doctorId) {
    alert("Please fill all fields!");
    return;
  }

  // Check if Doctor ID already exists
  const doctorsRef = ref(db, "doctors");
  const q = query(doctorsRef, orderByChild("doctorId"), equalTo(doctorId));
  get(q).then((snapshot) => {
    if (snapshot.exists()) {
      alert("Doctor ID already taken! Please choose a different one.");
    } else {
      // Register doctor in Firebase Auth (using email and default password "doctor1234")
      const defaultPassword = "doctor1234"; // Default password
      createUserWithEmailAndPassword(auth, email, defaultPassword)
        .then((userCredential) => {
          const user = userCredential.user;

          // Ensure the user is authenticated before proceeding
          if (user) {
            // Send email verification
            sendEmailVerification(user)
              .then(() => {
                alert("Verification email sent! Please check your email.");

                // Store doctor data in Database after successful email verification
                set(ref(db, "doctors/" + user.uid), {
                  name: name,
                  mobile: mobile,
                  email: email,
                  specialization: specialization,
                  doctorId: doctorId,
                  uid: user.uid
                }).then(() => {
                  form.reset();
                }).catch((error) => {
                  console.error(error);
                  alert("Error storing doctor data in the database.");
                });

              })
              .catch((error) => {
                console.error(error);
                alert("Error sending verification email.");
              });
          }
        })
        .catch((error) => {
          console.error(error);
          alert(error.message);
        });
    }
  });
});
