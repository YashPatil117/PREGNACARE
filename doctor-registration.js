import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

document.getElementById('doctorRegisterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const doctorID = document.getElementById('doctorID').value.trim();
  const defaultPassword = "doctor1234";

  if (!name || !email || !doctorID) {
    alert("Please fill all fields.");
    return;
  }

  try {
    // Check if Doctor ID already exists
    const querySnapshot = await getDocs(collection(db, "doctors"));
    const doctorIDs = [];
    querySnapshot.forEach((doc) => {
      doctorIDs.push(doc.data().doctorID);
    });

    if (doctorIDs.includes(doctorID)) {
      alert("Doctor ID already taken! Please choose a different Doctor ID.");
      return;
    }

    // Register Doctor
    const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
    const user = userCredential.user;

    await setDoc(doc(db, "doctors", user.uid), {
      name: name,
      email: email,
      doctorID: doctorID,
      uid: user.uid
    });

    await sendEmailVerification(user);
    alert(`Registered Successfully!\n\nDefault Password: doctor1234\n\nPlease verify your email and remember your Doctor ID: ${doctorID}`);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});
