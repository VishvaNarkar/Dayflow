const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

function checkIn() {
  fetch("http://localhost:3000/api/attendance/checkin", {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message;
  });
}

function checkOut() {
  fetch("http://localhost:3000/api/attendance/checkout", {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message;
  });
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
