import { auth } from './firebase-config.js'; // Ensure this path is correct
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';

// DOM Elements
const loginForm = document.getElementById('doctorLoginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Handle login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent the form from submitting the usual way

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  // Firebase Authentication
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('Login successful:', userCredential); // For debugging
      // Redirect to the dashboard after successful login
      window.location.href = 'doctor_dashboard.html'; 
    })
    .catch((error) => {
      console.error('Error during login:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        // Show an error message if email or password is incorrect
        alert('Email or password is incorrect. Please check and try again.');
      } else {
        // Handle other errors (network issues, etc.)
        alert('An error occurred during login. Please try again later.');
      }
    });
});
