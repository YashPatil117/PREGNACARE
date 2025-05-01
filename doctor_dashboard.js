import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { sendEmailToPatient } from './emailService.js'; // Assume email service is implemented in this file

const doctorNameSpan = document.getElementById('doctorName');
const logoutBtn = document.getElementById('logoutBtn');
const greetingText = document.getElementById('greetingText');

// Sections
const sections = document.querySelectorAll('.section');

window.showSection = function(sectionId) {
  sections.forEach(section => section.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
}

// Load Doctor Info
auth.onAuthStateChanged(async user => {
  if (user) {
    const doctorName = user.displayName || "";
    doctorNameSpan.textContent = doctorName;
    greetingText.textContent = `Hello Doctor ${doctorName} !!`;
    await loadPatients();
  } else {
    window.location.href = "doctorlogin.html";
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => window.location.href = "doctorlogin.html");
});

// Load Patients
async function loadPatients() {
  const patientList = document.getElementById('patientList');
  const patientSelect = document.getElementById('patientSelect');
  patientList.innerHTML = '<li>Loading...</li>';
  patientSelect.innerHTML = '<option value="">Select Patient</option>';

  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, 'patients'), where('assignedDoctorID', '==', user.uid));
  const snapshot = await getDocs(q);
  patientList.innerHTML = '';

  snapshot.forEach(doc => {
    const patient = doc.data();
    const fullName = patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim();

    const li = document.createElement('li');
    li.textContent = fullName;
    patientList.appendChild(li);

    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = fullName;
    patientSelect.appendChild(option);

    // Check for upcoming due month (for email reminder)
    sendEmailReminder(patient);
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
    assignedDoctorID: auth.currentUser.uid,
    pregnancyStartDate: new Date(), // Record the start date of pregnancy
  };

  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'age', 'dob', 'mobile', 'husbandName', 'address'];
  const missingFields = requiredFields.filter(field => !formData[field]);

  if (missingFields.length > 0) {
    alert("Please fill all required fields!");
    return;
  }

  try {
    await addDoc(collection(db, 'patients'), formData);
    alert('Pregnancy Registered Successfully!');
    document.getElementById('pregnancyForm').reset();
    await loadPatients();
  } catch (error) {
    console.error(error);
    alert('Error registering pregnancy.');
  }
});

// Change Password
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value.trim();
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();

  const passwordError = document.getElementById('passwordError');
  const passwordSuccess = document.getElementById('passwordSuccess');

  if (newPassword !== confirmNewPassword) {
    passwordError.style.display = 'block';
    passwordSuccess.style.display = 'none';
    return;
  }

  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  try {
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    passwordSuccess.style.display = 'block';
    passwordError.style.display = 'none';
  } catch (error) {
    passwordError.style.display = 'block';
    passwordSuccess.style.display = 'none';
  }
});

// Check pregnancy month and send reminder
async function sendEmailReminder(patient) {
  const pregnancyStartDate = patient.pregnancyStartDate.toDate(); // Convert to a JS Date object
  const currentDate = new Date();

  // Calculate the difference in months
  const monthDiff = (currentDate.getFullYear() - pregnancyStartDate.getFullYear()) * 12 + currentDate.getMonth() - pregnancyStartDate.getMonth();

  if (monthDiff > 0 && monthDiff <= 9) {
    const monthMessage = `You are now in the ${monthDiff}th month of your pregnancy. Keep up with your care!`;
    await sendEmailToPatient(patient.email, `Pregnancy Update: Month ${monthDiff}`, monthMessage);
  }
}
