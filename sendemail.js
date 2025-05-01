import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// EmailJS config
const EMAIL_SERVICE_ID = 'service_2yyas18';
const EMAIL_PUBLIC_KEY = 'lUOvxp6yj6uAY_893';

// Call this function on load or trigger it with a cron-like scheduler
async function sendMonthlyEmails() {
  const womenRef = collection(db, "women");
  const womenSnap = await getDocs(womenRef);

  const today = new Date();

  for (const docSnap of womenSnap.docs) {
    const data = docSnap.data();

    if (!data.registrationDate || !data.month || !data.email) continue;

    const regDate = data.registrationDate.toDate();
    const startMonth = parseInt(data.month);
    const email = data.email;

    const diffInMonths = (today.getFullYear() - regDate.getFullYear()) * 12 +
                         (today.getMonth() - regDate.getMonth());

    const currentPregnancyMonth = startMonth + diffInMonths;

    if (currentPregnancyMonth > 9 || currentPregnancyMonth < 1) continue;

    const templateId = `template_month${currentPregnancyMonth}`;

    // Send the email
    await sendEmail(email, templateId, {
      to_email: email,
      month: currentPregnancyMonth,
      name: data.fname || "Mother"
    });

    console.log(`Sent Month ${currentPregnancyMonth} email to ${email}`);
  }
}

// EmailJS function
function sendEmail(toEmail, templateId, templateParams) {
  return emailjs.send(EMAIL_SERVICE_ID, templateId, templateParams, EMAIL_PUBLIC_KEY)
    .then(() => console.log(`Email sent to ${toEmail}`))
    .catch((error) => console.error("Email sending failed:", error));
}

// Call it
sendMonthlyEmails();
