// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase configuration (replace with your actual Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
  authDomain: "pregnacare-70aed.firebaseapp.com",
  projectId: "pregnacare-70aed",
  storageBucket: "pregnacare-70aed.firebasestorage.app",
  messagingSenderId: "375969305451",
  appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e",
  measurementId: "G-34LJE5R27W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth instance
const auth = getAuth(app);

// Handle login logic
document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('#login-form');
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        alert("A new verification email has been sent to your email address. Please verify your email to proceed.");
      } else {
        alert("Login successful. Your email is already verified. Welcome back!");
        window.location.href = "dashboard.html";
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      alert("Login failed: " + error.message);
    }
  });
});
