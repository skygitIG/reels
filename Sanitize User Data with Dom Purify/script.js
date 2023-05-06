function sanitizeInput(userInput) {
  return DOMPurify.sanitize(userInput)
}

function toggleInactiveClass(arrayOfClasses) {
  arrayOfClasses.forEach(el => {
    document.querySelector(`.${el}`).classList.toggle('inactive');
  })
}

function handleFormSubmit(e) {
  e.preventDefault();
  const firstNameInput = document.querySelector('#nameField').value;
  const bioInput = document.querySelector('#bioField').value;
  const sanatizedProfileData = sanitizeInput(`
    <h2>${firstNameInput}</h2>
    <p>${bioInput}</p>
  `);
  const profile = document.querySelector('.profile');
  profile.innerHTML = sanatizedProfileData;
  toggleInactiveClass(['profile', 'profile-form']);
}

document.querySelector('.profile-form').addEventListener('submit', handleFormSubmit);
