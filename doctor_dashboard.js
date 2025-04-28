import { auth, db } from './firebase-config.js'; // your firebase setup

const doctorNameSpan = document.getElementById('doctorName');
const logoutBtn = document.getElementById('logoutBtn');
const greetingText = document.getElementById('greetingText');  // New greeting element

// Sections
const sections = document.querySelectorAll('.section');

window.showSection = function(sectionId) {
  sections.forEach(section => section.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
}

// Load Doctor Info
auth.onAuthStateChanged(async user => {
  if (user) {
    const doctorName = user.displayName || "Doctor";
    doctorNameSpan.textContent = doctorName;
    greetingText.textContent = `Hello Doctor ${doctorName} !!`;  // Display greeting

    await loadPatients();
  } else {
    window.location.href = "doctor-login.html";
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => window.location.href = "doctor-login.html");
});

// Load Patients
async function loadPatients() {
  const patientList = document.getElementById('patientList');
  const patientSelect = document.getElementById('patientSelect');
  patientList.innerHTML = '<li>Loading...</li>';
  patientSelect.innerHTML = '<option value="">Select Patient</option>';

  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection('patients').where('assignedDoctorID', '==', user.uid).get();
  patientList.innerHTML = '';

  snapshot.forEach(doc => {
    const patient = doc.data();
    const li = document.createElement('li');
    li.textContent = `${patient.fullName || patient.firstName + " " + patient.lastName}`;
    patientList.appendChild(li);

    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = `${patient.fullName || patient.firstName + " " + patient.lastName}`;
    patientSelect.appendChild(option);
  });
}

// Simple Chat (Demo)
window.sendMessage = function() {
  const messageBox = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');

  if (input.value.trim() !== '') {
    const newMessage = document.createElement('div');
    newMessage.textContent = `Doctor: ${input.value}`;
    messageBox.appendChild(newMessage);
    input.value = '';
    messageBox.scrollTop = messageBox.scrollHeight;
  }
}

// Register Pregnancy
document.getElementById('pregnancyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    middleName: document.getElementById('middleName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    age: parseInt(document.getElementById('age').value.trim()),
    dob: document.getElementById('dob').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    husbandName: document.getElementById('husbandName').value.trim(),
    address: document.getElementById('address').value.trim(),
    email: document.getElementById('email').value.trim(),
    medicalHistory: document.getElementById('medicalHistory').value.trim(),
    assignedDoctorID: auth.currentUser.uid
  };

  await db.collection('patients').add(formData);
  alert('Pregnancy Registered Successfully!');
  document.getElementById('pregnancyForm').reset();
  await loadPatients();
});
