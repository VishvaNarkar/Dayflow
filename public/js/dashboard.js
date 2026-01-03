if (localStorage.getItem("role") !== "EMPLOYEE") {
  window.location.href = "login.html";
}

const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

function autoRefresh() {
    window.location = window.location.href;
}

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
    // document.getElementById('refreshBtn').addEventListener('click', autoRefresh);
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
    // document.getElementById('refreshBtn').addEventListener('click', autoRefresh);
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

const myBody = document.getElementById('myAttendanceBody');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const presentCountEl = document.getElementById('presentCount');
const leavesCountEl = document.getElementById('leavesCount');
const workingDaysEl = document.getElementById('workingDays');

let current = new Date(); // tracks current month

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function setMonthLabel(d) {
  const opts = { year: 'numeric', month: 'long' };
  monthLabel.innerText = d.toLocaleDateString(undefined, opts);
}

function monthRange(d) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth()+1, 0);
  return { first, last };
}

function daysInMonth(d) {
  const { first, last } = monthRange(d);
  return last.getDate();
}

function countWeekdaysInMonth(d) {
  const { first, last } = monthRange(d);
  let count = 0;
  for (let day = new Date(first); day <= last; day.setDate(day.getDate()+1)) {
    const wd = day.getDay();
    if (wd !== 0 && wd !== 6) count++; // Mon-Fri
  }
  return count;
}

function parseDateStr(s) { // YYYY-MM-DD
  if (!s) return null;
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y,m-1,d);
}

function loadMyAttendanceAndLeaves() {
  // fetch attendance and leaves in parallel
  return Promise.all([
    fetch('/api/attendance/my', { headers: { Authorization: token } }).then(r => {
      if (!r.ok) return r.json().then(j=>{ throw new Error(j && j.error ? j.error : `attendance request failed (${r.status})`); });
      return r.json();
    }),
    fetch('/api/leave/my', { headers: { Authorization: token } }).then(r => {
      if (!r.ok) return r.json().then(j=>{ throw new Error(j && j.error ? j.error : `leave request failed (${r.status})`); });
      return r.json();
    })
  ]).then(([attendanceRows, leaveRows]) => {
    if (!Array.isArray(attendanceRows)) attendanceRows = [];
    if (!Array.isArray(leaveRows)) leaveRows = [];
    return { attendanceRows, leaveRows };
  });
}

function filterRowsForMonth(rows, monthDate) {
  const { first, last } = monthRange(monthDate);
  return rows.filter(r => {
    const d = parseDateStr(r.date);
    if (!d) return false;
    return d >= first && d <= last;
  }).sort((a,b) => b.date.localeCompare(a.date));
}

function computeSummary(attendanceRows, leaveRows, monthDate) {
  const attForMonth = filterRowsForMonth(attendanceRows, monthDate);
  // present days: unique dates with check_in
  const presentDates = new Set(attForMonth.filter(r=>r.check_in).map(r=>r.date));
  const presentCount = presentDates.size;
  // leaves count: leaves that overlap month
  const { first, last } = monthRange(monthDate);
  const leavesCount = (leaveRows || []).filter(l => {
    const s = parseDateStr(l.start_date);
    const e = parseDateStr(l.end_date);
    if (!s || !e) return false;
    return !(e < first || s > last);
  }).length;
  const workingDays = countWeekdaysInMonth(monthDate);
  return { presentCount, leavesCount, workingDays, attForMonth };
}

function renderAttendanceTable(rows) {
  myBody.innerHTML = '';
  if (!rows || rows.length === 0) {
    myBody.innerHTML = '<tr><td colspan="5">No records for this month</td></tr>';
    return;
  }
  rows.forEach(r => {
    const tr = document.createElement('tr');
    const work = computeHours(r.check_in||'', r.check_out||'');
    // extra hours relative to 9:00 (540 minutes)
    const parts = work.split(':').map(Number);
    let extra = '';
    if (parts.length===2) {
      const mins = parts[0]*60 + parts[1];
      const extraM = Math.max(0, mins - 9*60);
      const eh = Math.floor(extraM/60).toString().padStart(2,'0');
      const em = (extraM%60).toString().padStart(2,'0');
      extra = `${eh}:${em}`;
    }
    tr.innerHTML = `<td>${r.date}</td><td>${formatTime(r.check_in)}</td><td>${formatTime(r.check_out)}</td><td>${work}</td><td>${extra}</td>`;
    myBody.appendChild(tr);
  });
}

function refreshMonthView() {
  setMonthLabel(current);
  loadMyAttendanceAndLeaves()
    .then(({ attendanceRows, leaveRows }) => {
      const { presentCount, leavesCount, workingDays, attForMonth } = computeSummary(attendanceRows, leaveRows, current);
      presentCountEl.innerText = presentCount;
      leavesCountEl.innerText = leavesCount;
      workingDaysEl.innerText = workingDays;
      renderAttendanceTable(attForMonth);
    })
    .catch(e => { myBody.innerHTML = `<tr><td colspan="5">Error: ${e.message}</td></tr>` });
}

prevMonthBtn.addEventListener('click', () => { current.setMonth(current.getMonth()-1); refreshMonthView(); });
nextMonthBtn.addEventListener('click', () => { current.setMonth(current.getMonth()+1); refreshMonthView(); });

function initEmpView() {
  current = new Date();
  setMonthLabel(current);
  refreshMonthView();
}

initEmpView();
