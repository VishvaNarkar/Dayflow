if (localStorage.getItem("role") !== "EMPLOYEE") {
  window.location.href = "login.html";
}

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
    loadMyAttendance();
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
    document.getElementById("status").innerText = data.message;
    loadMyAttendance();
  });
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// Optional: fetch today's status
function formatTime(t) { if (!t) return ''; return t; }

function computeHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '';
  const a = checkIn.split(':').map(Number);
  const b = checkOut.split(':').map(Number);
  const inMinutes = a[0]*60 + a[1];
  const outMinutes = b[0]*60 + b[1];
  const diff = Math.max(0, outMinutes - inMinutes);
  const h = Math.floor(diff/60).toString().padStart(2,'0');
  const m = (diff%60).toString().padStart(2,'0');
  return `${h}:${m}`;
}

const empDate = document.getElementById('empDate');
const viewMode = document.getElementById('viewMode');
const myBody = document.getElementById('myAttendanceBody');

function loadMyAttendance() {
  fetch('/api/attendance/my', { headers: { Authorization: token } })
    .then(r => r.json())
    .then(rows => {
      myBody.innerHTML = '';
      if (!rows || rows.length === 0) {
        myBody.innerHTML = '<tr><td colspan="5">No records</td></tr>';
        return;
      }
      rows.forEach(r => {
        const tr = document.createElement('tr');
        const work = computeHours(r.check_in||'', r.check_out||'');
        tr.innerHTML = `<td>${r.date}</td><td>${formatTime(r.check_in)}</td><td>${formatTime(r.check_out)}</td><td>${work}</td><td></td>`;
        myBody.appendChild(tr);
      });
    });
}

function initEmpView() {
  empDate.value = new Date().toISOString().slice(0,10);
  loadMyAttendance();
}

initEmpView();
