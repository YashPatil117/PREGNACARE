import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Capture form submission and store the data
document.getElementById('mother-registration-form').addEventListener('submit', async function (e) {
  e.preventDefault(); // Prevent form from reloading the page

  // Gather form data
  const formData = {
    fname: document.getElementById('name1').value,
    mname: document.getElementById('name2').value,
    lname: document.getElementById('name3').value,
    age: document.getElementById('age').value,
    dob: document.getElementById('dob').value,
    mobile: document.getElementById('mobile').value,
    email: document.getElementById('email').value,
    husbandName: document.getElementById('husband-name').value,
    address: document.getElementById('address').value,
    medicalHistory: document.getElementById('medical-history').value,
    doctorId: document.getElementById('doctor-id').value // assuming you have an input for doctor ID
  };

  try {
    // Create user with email and password using Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, "defaultPassword123"); // You can change the default password

    const uid = userCredential.user.uid;

    // Store additional data in Firestore (e.g., the user's profile)
    await setDoc(doc(db, "women", uid), {
      fname: formData.fname,  // Fixed typo
      mname: formData.mname,  // Fixed typo
      lname: formData.lname,  // Fixed typo
      age: formData.age,
      dob: formData.dob,
      mobile: formData.mobile,
      email: formData.email,
      husbandName: formData.husbandName,
      address: formData.address,
      medicalHistory: formData.medicalHistory,
      doctorId: formData.doctorId,
      role: "mother",  // Explicitly marking this user as a mother
      createdAt: new Date()
    });

    alert("Registration Successful!");
    console.log("User registered and data stored in Firestore!");
  } catch (error) {
    console.error("Error during registration:", error);
    alert("Error occurred during registration.");
  }
});
