import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
  authDomain: "pregnacare-70aed.firebaseapp.com",
  projectId: "pregnacare-70aed",
  storageBucket: "pregnacare-70aed.appspot.com",
  messagingSenderId: "375969305451",
  appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e",
  measurementId: "G-34LJE5R27W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginForm = document.getElementById('doctorLoginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      alert('Please verify your email before logging in.');
      return;
    }

    // Ensure db is initialized and user is a valid doctor
    console.log('Firestore db initialized:', db);

    // Ensure the correct path for the "doctors" collection and check if the document exists
    const doctorRef = doc(db, "doctors", user.uid); // This points to the 'doctors' collection
    const doctorSnap = await getDoc(doctorRef);

    if (doctorSnap.exists()) {
      // Doctor is valid
      alert('Doctor login successful!');
      window.location.href = 'doctor_dashboard.html';
    } else {
      // Not a doctor (maybe a patient)
      alert("Access denied. This account is not registered as a doctor.");
    }

  } catch (error) {
    console.error('Error during login:', error);
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        alert('Incorrect email or password.');
        break;
      case 'auth/invalid-email':
        alert('Invalid email address.');
        break;
      case 'auth/too-many-requests':
        alert('Too many requests. Please try again later.');
        break;
      default:
        alert('An error occurred during login. Please try again later.');
    }
  }
});
