// Capture form submission and store the data
document.getElementById('mother-registration-form').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent form from reloading the page

  // Gather form data
  const formData = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    dob: document.getElementById('dob').value,
    mobile: document.getElementById('mobile').value,
    email: document.getElementById('email').value,
    husbandName: document.getElementById('husband-name').value,
    address: document.getElementById('address').value,
    medicalHistory: document.getElementById('medical-history').value
  };

  // Example: Send data to server via AJAX (replace 'your-endpoint' with the actual endpoint)
  fetch('your-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then(response => response.json())
    .then(data => {
      alert('Registration Successful!');
      console.log('Success:', data);
    })
    .catch((error) => {
      alert('Error occurred during registration.');
      console.error('Error:', error);
    });
});