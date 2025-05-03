import { db } from './firebase-config.js';
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('#patient-registration-form');
  
  // Show success modal after registration
  function showSuccessModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const modalContent = `
      <div style="
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        width: 80%;
        max-width: 400px;">
        <h2 style="color: #6a5acd; margin-bottom: 15px;">Successfully Registered!</h2>
        <p style="margin-bottom: 20px;">You have successfully registered. Please click continue to proceed to login.</p>
        <button id="continue-button" style="
          background-color: #6a5acd;
          color: white;
          padding: 12px 25px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;">
          Continue
        </button>
      </div>
    `;
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Add event listener to the continue button
    const continueButton = document.getElementById('continue-button');
    continueButton.addEventListener('click', function () {
      window.location.href = 'login.html';
    });

    // Add hover effect
    continueButton.addEventListener('mouseenter', function() {
      continueButton.style.backgroundColor = '#5a4acf';
      continueButton.style.transform = 'translateY(-2px)';
    });
    
    continueButton.addEventListener('mouseleave', function() {
      continueButton.style.backgroundColor = '#6a5acd';
      continueButton.style.transform = 'translateY(0)';
    });
  }

  // Single form submission handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value;
    const age = form.age.value;
    const phone = form.phone.value;
    const email = form.email.value;
    const password = form.password.value;
    const address = form.address.value;
    const dueDate = form.dueDate.value;

    const auth = getAuth();

    try {
      // Register the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user details in Firestore
      await setDoc(doc(db, "women", user.uid), {
        name,
        age,
        phone,
        email,
        address,
        dueDate,
        createdAt: new Date(),
        role: "mother"
      });

      // Send email verification
      await sendEmailVerification(user);

      // Show success modal
      showSuccessModal();

      // Reset the form
      form.reset();

    } catch (error) {
      console.error("Registration failed", error);
      alert("Registration failed: " + error.message);
    }
  });
});