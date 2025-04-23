import { db } from './firebase-config.js';
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('#patient-registration-form');
  const nameInput = document.querySelector('input[name="name"]');
  const ageInput = document.querySelector('input[name="age"]');
  const phoneInput = document.querySelector('input[name="phone"]');
  const addressTextarea = document.querySelector('textarea[name="address"]');
  const dueDateInput = document.querySelector('input[name="dueDate"]');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');

  // Registration function for the mother
  async function registerMother(data) {
    try {
      const uid = phoneInput.value; // using phone as unique ID

      await setDoc(doc(db, "women", uid), {
        name: data.name,
        age: data.age,
        phone: data.phone,
        address: data.address,
        dueDate: data.dueDate,
        email: data.email,
        role: "mother",
        createdAt: new Date()
      });

      // Show success modal after registration
      showSuccessModal();
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
  }

  // Form validation function
  function validateForm() {
    return (
      nameInput.value.trim() &&
      ageInput.value.trim() &&
      phoneInput.value.trim() &&
      addressTextarea.value.trim() &&
      dueDateInput.value.trim() &&
      emailInput.value.trim() &&
      passwordInput.value.trim()
    );
  }

  // Handle form submission
  function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      alert("Please fill out all fields.");
      return;
    }

    const formData = {
      name: nameInput.value,
      age: ageInput.value,
      phone: phoneInput.value,
      address: addressTextarea.value,
      dueDate: dueDateInput.value,
      email: emailInput.value,
      password: passwordInput.value
    };

    registerMother(formData);
  }

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
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
        <h2>Successfully Registered!</h2>
        <p>You have successfully registered. Please click continue to proceed to login.</p>
        <button id="continue-button" style="
          background-color: #3498db;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;">
          Continue
        </button>
      </div>
    `;
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Debugging: Check if modal is being created
    console.log("Modal is being created!");

    // Ensure button click listener is attached
    const continueButton = document.getElementById('continue-button');
    if (continueButton) {
      console.log("Continue button found, adding event listener...");
      continueButton.addEventListener('click', function () {
        console.log("Continue button clicked. Redirecting...");
        window.location.href = 'login.html';
      });
    } else {
      console.log("Continue button not found.");
    }
  }

  form.addEventListener('submit', handleFormSubmit);
  
  // Patient Registration (for Firebase Authentication and Firestore)
  const patientForm = document.getElementById("patient-registration-form");

  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = patientForm.name.value;
    const age = patientForm.age.value;
    const phone = patientForm.phone.value;
    const email = patientForm.email.value;
    const password = patientForm.password.value;
    const address = patientForm.address.value;
    const dueDate = patientForm.dueDate.value;

    const auth = getAuth(); // Initialize Firebase Auth

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

      alert("Registration successful! A confirmation email has been sent.");
      
      // Show success modal
      showSuccessModal();

      patientForm.reset();

    } catch (error) {
      console.error("Registration failed", error);
      alert("Registration failed: " + error.message);
    }
  });
});
