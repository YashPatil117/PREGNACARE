const functions = require('firebase-functions');
const admin = require('firebase-admin');
const emailjs = require('emailjs-com'); // EmailJS

admin.initializeApp();

// Cloud Function for manual email trigger
exports.sendMonthlyEmailsManually = functions.https.onCall(async (data, context) => {
  // Ensure the doctor is authenticated
  const user = context.auth;
  if (!user) {
    throw new functions.https.HttpsError('unauthenticated', 'Doctor is not authenticated');
  }

  const womenRef = admin.firestore().collection('women');
  const womenSnapshot = await womenRef.get();
  const today = new Date();
  const sentEmails = [];

  womenSnapshot.forEach(async (docSnap) => {
    const data = docSnap.data();

    // Skip if any required field is missing
    if (!data.registrationDate || !data.month || !data.email) return;

    const regDate = data.registrationDate.toDate();
    const startMonth = parseInt(data.month);
    const email = data.email;

    const diffInMonths =
      (today.getFullYear() - regDate.getFullYear()) * 12 + (today.getMonth() - regDate.getMonth());

    const currentPregnancyMonth = startMonth + diffInMonths;

    // Only send email if the pregnancy month is valid (1 to 9 months)
    if (currentPregnancyMonth > 9 || currentPregnancyMonth < 1) return;

    const templateId = `template_month${currentPregnancyMonth}`;

    // Send the email using EmailJS
    try {
      await emailjs.send(
        'service_2yyas18',
        templateId,
        { to_email: email, month: currentPregnancyMonth, name: data.fname || 'Mother' },
        'lUOvxp6yj6uAY_893'
      );
      sentEmails.push({ email: data.email, month: currentPregnancyMonth });
      console.log(`Sent Month ${currentPregnancyMonth} email to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });

  return { success: true, sentEmails };
});
