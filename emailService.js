// emailService.js
import emailjs from 'emailjs-com';

// Function to send an email to a patient
export function sendEmailToPatient(to, subject, body) {
  const templateParams = {
    to_email: to,
    subject: subject,
    message: body
  };

  return emailjs.send('your_email_service', 'your_email_template', templateParams, 'your_email_user_id')
    .then(response => {
      console.log('Email sent successfully:', response);
    })
    .catch(error => {
      console.error('Error sending email:', error);
    });
}
