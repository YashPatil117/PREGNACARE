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
