if (localStorage.getItem("role") !== "HR") {
  window.location.href = "login.html";
}

const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const datePicker = document.getElementById('datePicker');
const prevBtn = document.getElementById('prevDay');
const nextBtn = document.getElementById('nextDay');
const searchInput = document.getElementById('searchInput');
const tbody = document.getElementById('attendanceTableBody');

function formatTime(t) {
  if (!t) return '';
  return t;
}

function computeHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '';
  // DB returns TIME strings like HH:MM:SS or HH:MM; simple diff
  const a = checkIn.split(':').map(Number);
  const b = checkOut.split(':').map(Number);
  const inMinutes = a[0]*60 + a[1];
  const outMinutes = b[0]*60 + b[1];
  const diff = Math.max(0, outMinutes - inMinutes);
  const h = Math.floor(diff/60).toString().padStart(2,'0');
  const m = (diff%60).toString().padStart(2,'0');
  return `${h}:${m}`;
}

function loadFor(date) {
  tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  fetch(`/api/attendance/list?date=${date}`, { headers: { Authorization: token } })
    .then(r => r.json())
    .then(rows => renderRows(rows))
    .catch(err => { tbody.innerHTML = `<tr><td colspan="7">Error: ${err.message}</td></tr>` });
}

function renderRows(rows) {
  const q = (searchInput.value||'').toLowerCase();
  tbody.innerHTML = '';
  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No records for this date</td></tr>';
    return;
  }
  rows.forEach(r => {
    if (q && !(r.name||r.email||'').toLowerCase().includes(q)) return;
    const work = computeHours(r.check_in||'', r.check_out||'');
    const extra = '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.name || r.email}</td>
      <td>${formatTime(r.check_in)}</td>
      <td>${formatTime(r.check_out)}</td>
      <td>${work}</td>
      <td>${extra}</td>
      <td></td>
    `;
    tbody.appendChild(tr);
  });
}

function logout() { localStorage.clear(); window.location.href = 'login.html'; }

// Date controls
function todayISO() { return new Date().toISOString().slice(0,10); }
datePicker.value = todayISO();
loadFor(datePicker.value);
prevBtn.addEventListener('click', () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() - 1);
  datePicker.value = d.toISOString().slice(0,10);
  loadFor(datePicker.value);
});
nextBtn.addEventListener('click', () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + 1);
  datePicker.value = d.toISOString().slice(0,10);
  loadFor(datePicker.value);
});
datePicker.addEventListener('change', () => loadFor(datePicker.value));
searchInput.addEventListener('input', () => loadFor(datePicker.value));

// Leaves admin actions
const leaveTbody = document.getElementById('leaveTableBody');

function loadLeaves() {
  if (!leaveTbody) return;
  leaveTbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  fetch('/api/leave/pending', { headers: { Authorization: token } })
    .then(r => r.json())
    .then(rows => {
      leaveTbody.innerHTML = '';
      if (!rows || rows.length === 0) {
        leaveTbody.innerHTML = '<tr><td colspan="5">No pending leaves</td></tr>';
        return;
      }
      rows.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${l.email}</td>
          <td>${l.start_date}</td>
          <td>${l.end_date}</td>
          <td>${l.reason}</td>
          <td>
            <button class="btn btn-sm btn-success" onclick="approveLeave(${l.id})">Approve</button>
            <button class="btn btn-sm btn-danger ms-1" onclick="denyLeave(${l.id})">Deny</button>
          </td>
        `;
        leaveTbody.appendChild(tr);
      });
    })
    .catch(err => { leaveTbody.innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>` });
}

function approveLeave(id) {
  fetch(`/api/leave/decision/${id}`, { method: 'POST', headers: { Authorization: token, 'Content-Type': 'application/json' }, body: JSON.stringify({ decision: 'APPROVED' }) })
    .then(()=> loadLeaves());
}

function denyLeave(id) {
  fetch(`/api/leave/decision/${id}`, { method: 'POST', headers: { Authorization: token, 'Content-Type': 'application/json' }, body: JSON.stringify({ decision: 'DENIED' }) })
    .then(()=> loadLeaves());
}

// Load leaves on init
loadLeaves();
