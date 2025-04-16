// Add a slight bounce effect to images on hover
document.querySelectorAll('.register-button').forEach(button => {
  button.addEventListener('mouseenter', () => {
    const targetClass = button.classList.contains('doctor-btn') ? '.doctor' : '.mother';
    const targetImage = document.querySelector(targetClass);
    targetImage.style.transform = 'scale(1.1)'; // Enlarges the image slightly
  });

  button.addEventListener('mouseleave', () => {
    const targetClass = button.classList.contains('doctor-btn') ? '.doctor' : '.mother';
    const targetImage = document.querySelector(targetClass);
    targetImage.style.transform = 'scale(1)'; // Resets the image size
  });
});