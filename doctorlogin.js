// doctor-login.js

// Initialize Firebase
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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = prompt("Enter your password (default is doctor1234 if new)");

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (user.emailVerified) {
        // Redirect to dashboard
        window.location.href = "dashboard.html";
      } else {
        alert("Please verify your email first! Check your inbox.");
        auth.signOut();
      }

    })
    .catch((error) => {
      console.error(error);
      alert(error.message);
    });
});
