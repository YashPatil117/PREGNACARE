const firebaseConfig = {
  apiKey: "AIzaSyAAdjeTlV3QD7RNuhJeuIo8Vp2tftjbE1k",
  authDomain: "pregnacare-70aed.firebaseapp.com",
  projectId: "pregnacare-70aed",
  storageBucket: "pregnacare-70aed.appspot.com",
  messagingSenderId: "375969305451",
  appId: "1:375969305451:web:82d4e1f90264cfa3f6f22e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const reportBtn = document.getElementById("reportPregnancyBtn");
const chatBtn = document.getElementById("chatBtn");
const sendMailsBtn = document.getElementById("sendMailsBtn");
const dueDateEl = document.getElementById("due-date");
const inbox = document.getElementById("inbox");

// Auth listener
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = db.collection("patients").doc(user.uid);
  const doc = await userRef.get();

  if (!doc.exists) return;

  const data = doc.data();

  // Show "Report Pregnancy" button if not yet reported
  if (!data.hasReportedPregnancy) {
    if (reportBtn) {
      reportBtn.style.display = "inline-block";
    }

    document.querySelectorAll("section").forEach(s => s.style.display = "none");

    const msg = document.createElement("section");
    msg.innerHTML = `<h2>Please report your pregnancy to unlock full dashboard access.</h2>`;
    document.querySelector(".main-content").appendChild(msg);
  } else {
    loadInbox(user.uid);

    // Set dummy due date (replace with dynamic logic later)
    const lastPeriodDate = new Date("2024-10-10");
    const dueDate = new Date(lastPeriodDate.setDate(lastPeriodDate.getDate() + 280));
    dueDateEl.textContent = dueDate.toDateString();
  }
});

// Load messages
function loadInbox(uid) {
  db.collection("patients").doc(uid).collection("messages").onSnapshot(snapshot => {
    inbox.innerHTML = `<h2>Your Inbox</h2>`;
    if (snapshot.empty) {
      inbox.innerHTML += "<p>No messages.</p>";
    } else {
      snapshot.forEach(doc => {
        const msg = doc.data();
        inbox.innerHTML += `
          <div class="message">
            <p><strong>Dr. ${msg.doctorName}:</strong> ${msg.text}</p>
            <button>Reply</button>
          </div>
        `;
      });
    }
  });
}

// Sidebar navigation logic
const sections = {
  navDashboard: ["inbox", "pregnancyProgress", "healthTracker"],
  navInbox: ["inbox"],
  navAppointments: ["appointments"],
  navProgress: ["pregnancyProgress"],
  navTracker: ["healthTracker"],
  navResources: ["resources"]
};

Object.keys(sections).forEach(id => {
  const navItem = document.getElementById(id);
  if (navItem) {
    navItem.addEventListener("click", e => {
      e.preventDefault();
      document.querySelectorAll("main section").forEach(s => s.style.display = "none");
      sections[id].forEach(secId => {
        const el = document.getElementById(secId);
        if (el) el.style.display = "block";
      });
    });
  }
});

// Redirect to report page
if (reportBtn) {
  reportBtn.addEventListener("click", () => {
    window.location.href = "mother-registration.html";
  });
}

// Chat with Doctor
if (chatBtn) {
  chatBtn.addEventListener("click", () => {
    window.location.href = "chat.html";
  });
}

// Send Mails (stub logic)
if (sendMailsBtn) {
  sendMailsBtn.addEventListener("click", () => {
    alert("Send mail triggered (plug in EmailJS or your own logic here).");
  });
}

// Logout
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => window.location.href = "login.html");
});
