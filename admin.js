const correctPassword = "hello";  

const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("adminPassword");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", () => {
  if (passwordInput.value === correctPassword) {
    window.location.href = "finances.html";
  } else {
    errorMsg.textContent = "Incorrect password. Try again.";
  }
});
