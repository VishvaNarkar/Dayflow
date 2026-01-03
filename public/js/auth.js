function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "HR") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } else {
      document.getElementById("error").innerText = "Login failed";
    }
  });
}


function signup() {
  const companyName = document.getElementById("company-name").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const phone = document.getElementById("phone").value;
  const role = document.getElementById("role").value;

  if (password !== confirmPassword) {
    document.getElementById("error").innerText = "Passwords do not match";
    return;
  }

  fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyName, name, email, password, phone, role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      document.getElementById("error").innerText = "Signup successful! Please login.";
      setTimeout(() => window.location.href = "index.html", 2000);
    } else {
      document.getElementById("error").innerText = data.error || "Signup failed";
    }
  });
}
