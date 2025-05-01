const functions = require("firebase-functions");
const admin = require("firebase-admin");
const emailjs = require("emailjs-com"); // EmailJS

admin.initializeApp();

const EMAIL_SERVICE_ID = "your_service_id";
const EMAIL_PUBLIC_KEY = "your_public_key";

// Cloud Function to send emails
/**
 * Sends monthly emails to pregnant women.
 * This function is triggered by a scheduled event.
 */
exports.sendMonthlyEmails = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  const womenRef = admin.firestore().collection("women");
  const womenSnapshot = await womenRef.get();

  const today = new Date();

  womenSnapshot.forEach(async (docSnap) => {
    const data = docSnap.data();

    // Make sure the necessary fields exist in the document
    if (!data.registrationDate || !data.month || !data.email) return;

    const regDate = data.registrationDate.toDate(); // Convert Firestore timestamp to Date object
    const startMonth = parseInt(data.month); // Initial month when the woman registers
    const email = data.email;

    // Calculate how many months have passed since registration
    const diffInMonths = (today.getFullYear() - regDate.getFullYear()) * 12 +
                         (today.getMonth() - regDate.getMonth());

    const currentPregnancyMonth = startMonth + diffInMonths; // Calculate current pregnancy month

    if (currentPregnancyMonth > 9 || currentPregnancyMonth < 1) return; // Don't send if out of range

    const templateId = `template_month${currentPregnancyMonth}`; // Choose template based on pregnancy month

    // Send the email using EmailJS
    await sendEmail(email, templateId, {
      to_email: email,
      month: currentPregnancyMonth,
      name: data.fname || "Mother"
    });

    console.log(`Sent Month ${currentPregnancyMonth} email to ${email}`);
  });
});

// Function to send email through EmailJS
/**
 * Sends an email using the EmailJS service.
 * @param {string} toEmail The recipient's email address.
 * @param {string} templateId The template ID to use for the email.
 * @param {object} templateParams The parameters to pass to the email template.
 */
function sendEmail(toEmail, templateId, templateParams) {
  return emailjs.send(EMAIL_SERVICE_ID, templateId, templateParams, EMAIL_PUBLIC_KEY)
    .then(() => {
      console.log(`Email sent to ${toEmail}`);
    })
    .catch((error) => {
      console.error("Email sending failed:", error);
    });
}
