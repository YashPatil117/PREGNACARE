import { auth, db } from './firebase-config.js';
import {
  setDoc, doc, updateDoc, arrayUnion, getDocs, query, collection, where
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.getElementById('mother-registration-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in!");
    return;
  }

  const uid = user.uid;

  const formData = {
    fname: document.getElementById('firstName').value.trim(),
    lname: document.getElementById('lastName').value.trim(),
    age: document.getElementById('age').value.trim(),
    dob: document.getElementById('dob').value,
    husbandName: document.getElementById('husbandName').value.trim(),
    trimester: document.getElementById('trimester').value.trim(),
    month: document.getElementById('month').value.trim(),
    doctorName: document.getElementById('doctorName').value.trim(),
    doctorId: document.getElementById('doctorId').value.trim(),
    address: document.getElementById('address').value.trim(),
    medicalHistory: document.getElementById('medicalHistory').value.trim()
  };

  try {
    // ✅ Store mother data regardless of doctor validity
    await setDoc(doc(db, "women", uid), {
      ...formData,
      email: user.email || "",
      role: "mother",
      registrationDate: new Date(), // for monthly emails
      createdAt: new Date()
    });

    // ✅ Search for doctor document with matching doctorId field
    const q = query(collection(db, "doctors"), where("doctorId", "==", formData.doctorId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const doctorRef = doc(db, "doctors", docSnap.id);

      await updateDoc(doctorRef, {
        patients: arrayUnion({
          motherId: uid,
          name: `${formData.fname} ${formData.lname}`,
          email: user.email || "",
          trimester: formData.trimester,
          month: formData.month
        })
      });

      alert("Registration successful and linked with doctor.");
    } else {
      alert("Doctor ID not found. Patient registered, but doctor not linked.");
    }

    console.log("Mother registration completed.");
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred during registration. See console for details.");
  }
});
