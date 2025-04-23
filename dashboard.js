// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

firebase.initializeApp(firebaseConfig);

// Firebase Authentication
const auth = firebase.auth();

// Chat Functionality
const sendMessageBtn = document.getElementById('send-message-btn');
const doctorChatMessage = document.getElementById('doctor-chat-message');
const doctorChatLog = document.getElementById('doctor-chat-log');

sendMessageBtn.addEventListener('click', () => {
  const message = doctorChatMessage.value.trim();
  if (message) {
    doctorChatLog.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    doctorChatMessage.value = ''; // clear input
    // Optionally, store this message in Firebase for persistence
  }
});

// Logout functionality
document.getElementById('logout').addEventListener('click', async () => {
  await auth.signOut();
  window.location.href = 'login.html';
});

// Example for calculating the due date from last menstrual cycle
function calculateDueDate(lastPeriodDate) {
  const dueDate = new Date(lastPeriodDate);
  dueDate.setDate(dueDate.getDate() + 280); // 280 days from last period = estimated due date
  return dueDate;
}

const lastPeriodDate = '2024-10-10'; // Example date
const dueDate = calculateDueDate(lastPeriodDate);
document.getElementById('due-date').textContent = dueDate.toDateString();
