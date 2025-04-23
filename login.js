import { getAuth, sendEmailVerification, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('#login-form');
  const emailInput = form.querySelector('input[name="email"]');

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
      alert("Please enter a valid email.");
      return;
    }

    const auth = getAuth();

    try {
      // Check if the email is registered
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        alert("This email is not registered.");
        return;
      }

      // Proceed with sending verification email
      const user = await auth.signInWithEmailLink(email);

      // Check if email is verified
      if (!user.user.emailVerified) {
        // Send verification email if not verified
        await sendEmailVerification(user.user);
        alert("A new verification email has been sent to your email address. Please verify your email to proceed.");
      } else {
        alert("Login successful. Your email is already verified. Welcome back!");
        // Redirect to mother info page after successful login and email verification
        window.location.href = "mother-info.html";
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      alert("Login failed: " + error.message);
    }
  });
});
