// Firebase setup
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Example Firebase usage (remove or replace with your logic)
async function saveTestUser() {
  try {
    await addDoc(collection(db, "test-users"), {
      name: "Pregnacare Homepage Visit",
      timestamp: new Date(),
    });
    console.log("Test user data saved!");
  } catch (error) {
    console.error("Error saving to Firestore:", error);
  }
}

saveTestUser(); // Optional: run once on page load

// Add a slight bounce effect to images on hover
document.querySelectorAll('.register-button').forEach(button => {
  button.addEventListener('mouseenter', () => {
    const targetClass = button.classList.contains('doctor-btn') ? '.doctor' : '.mother';
    const targetImage = document.querySelector(targetClass);
    targetImage.style.transform = 'scale(1.1)'; // Enlarges the image slightly
  });

  button.addEventListener('mouseleave', () => {
    const targetClass = button.classList.contains('doctor-btn') ? '.doctor' : '.mother';
    const targetImage = document.querySelector(targetClass);
    targetImage.style.transform = 'scale(1)'; // Resets the image size
  });
});
