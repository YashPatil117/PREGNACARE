document.addEventListener('DOMContentLoaded', function () {
  // Get the form and its elements
  const form = document.querySelector('form');
  const nameInput = document.querySelector('input[type="text"]');
  const ageInput = document.querySelector('input[type="number"]');
  const phoneInput = document.querySelector('input[type="tel"]');
  const addressTextarea = document.querySelector('textarea');
  const dueDateInput = document.querySelector('input[type="date"]');
  const submitButton = document.querySelector('button');

  // Function to check if all fields are filled
  function validateForm() {
    if (
      nameInput.value.trim() === "" ||
      ageInput.value.trim() === "" ||
      phoneInput.value.trim() === "" ||
      addressTextarea.value.trim() === "" ||
      dueDateInput.value.trim() === ""
    ) {
      alert("All fields are required!");
      return false; // Prevent form submission
    }
    return true;
  }

  // Function to handle form submission
  function handleFormSubmit(event) {
    event.preventDefault(); // Prevent actual form submission to allow validation

    if (validateForm()) {
      // If validation passes, you can do something with the form data
      console.log("Form Submitted:");
      console.log("Name:", nameInput.value);
      console.log("Age:", ageInput.value);
      console.log("Phone:", phoneInput.value);
      console.log("Address:", addressTextarea.value);
      console.log("Due Date:", dueDateInput.value);

      // You can also reset the form after submission if needed:
      form.reset();

      // Optionally, show a confirmation message or redirect:
      alert("Registration successful!");
    }
  }

  
  // Attach the submit event handler to the form
  form.addEventListener('submit', handleFormSubmit);
});


// Select the form element
// Select the form element
document.querySelector('form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form from reloading the page

  // Create a custom modal for the pop-up
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

  // Modal content
  const modalContent = `
    <div style="
      background: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
      <h2>Successfully Registered!</h2>
      <p>You have successfully registered. Please click continue to proceed.</p>
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

  // Append modal content
  modal.innerHTML = modalContent;
  document.body.appendChild(modal);

  // Handle "Continue" button click
  document.getElementById('continue-button').addEventListener('click', function () {
    window.location.href = 'mother-registration.html'; // Redirect to "mother-registration.html"
  });
});