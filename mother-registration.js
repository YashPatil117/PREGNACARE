document.getElementById('mother-registration-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in!");
    return;
  }

  const uid = user.uid;

  const formData = {
    fname: document.getElementById('firstName').value.trim(),
    lname: document.getElementById('lastName').value.trim(),
    age: document.getElementById('age').value.trim(),
    dob: document.getElementById('dob').value,
    husbandName: document.getElementById('husbandName').value.trim(),
    trimester: document.getElementById('trimester').value.trim(),
    month: document.getElementById('month').value.trim(),
    doctorId: document.getElementById('doctorId').value.trim(), // This should be the doctor's UID
    address: document.getElementById('address').value.trim(),
    medicalHistory: document.getElementById('medicalHistory').value.trim(),
    lastMenstrualCycle: document.getElementById('lastMenstrualCycle').value,
    pregnancyStartDate: document.getElementById('pregnancyStartDate').value
  };

  try {
    // Store mother data with doctorId reference
    await setDoc(doc(db, "women", uid), {
      ...formData,
      email: user.email || "",
      role: "mother",
      registrationDate: new Date(),
      createdAt: new Date(),
      lastEmailSent: null,
      doctorId: formData.doctorId // This links the patient to the doctor
    });

    // Verify doctor exists and update their patients list
    const doctorRef = doc(db, "doctors", formData.doctorId);
    const doctorSnap = await getDoc(doctorRef);

    if (doctorSnap.exists()) {
      await updateDoc(doctorRef, {
        patients: arrayUnion({
          motherId: uid,
          name: `${formData.fname} ${formData.lname}`,
          email: user.email || "",
          trimester: formData.trimester,
          month: formData.month,
          joinedDate: new Date()
        })
      });
      alert("Registration successful and linked with doctor.");
    } else {
      alert("Doctor ID not found. Patient registered, but doctor not linked.");
    }

    console.log("Mother registration completed.");
    // Redirect or show success message
    window.location.href = "mother-dashboard.html";
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred during registration: " + error.message);
  }
});