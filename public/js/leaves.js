const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const leaveMsg = document.getElementById('leaveMsg');
const leavesBody = document.getElementById('leavesBody');
const statusFilter = document.getElementById('statusFilter');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const filterBtn = document.getElementById('filterBtn');

function applyLeave() {
  const start_date = document.getElementById('startDate').value;
  const end_date = document.getElementById('endDate').value;
  const reason = document.getElementById('reason').value;
  fetch('/api/leave/apply', {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_date, end_date, reason })
  })
  .then(r => r.json())
  .then(j => {
    if (j.error) {
      leaveMsg.innerText = j.error; leaveMsg.className = 'ms-3 text-danger';
    } else {
      leaveMsg.innerText = 'Leave requested'; leaveMsg.className = 'ms-3 text-success';
      loadLeaves();
      document.getElementById('leaveForm').reset();
    }
  })
  .catch(e => { leaveMsg.innerText = e.message; leaveMsg.className = 'ms-3 text-danger'; });
}

function loadLeaves() {
  leavesBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  fetch('/api/leave/my', { headers: { Authorization: token } })
    .then(r => r.json())
    .then(rows => {
      renderLeaves(rows || []);
    })
    .catch(e => leavesBody.innerHTML = `<tr><td colspan="4">Error: ${e.message}</td></tr>`);
}

function renderLeaves(rows) {
  const status = statusFilter.value;
  const from = fromDate.value;
  const to = toDate.value;
  leavesBody.innerHTML = '';
  const filtered = rows.filter(r => {
    if (status && r.status !== status) return false;
    if (from && r.start_date < from) return false;
    if (to && r.end_date > to) return false;
    return true;
  });
  if (filtered.length === 0) {
    leavesBody.innerHTML = '<tr><td colspan="4">No leaves found</td></tr>';
    return;
  }
  filtered.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.start_date}</td><td>${r.end_date}</td><td>${r.reason}</td><td>${r.status}</td>`;
    leavesBody.appendChild(tr);
  });
}

filterBtn.addEventListener('click', () => loadLeaves());

loadLeaves();
