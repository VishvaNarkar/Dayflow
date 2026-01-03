const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

fetch("http://localhost:3000/api/attendance/pending", {
  headers: { "Authorization": token }
})
.then(res => res.json())
.then(data => {
  const list = document.getElementById("list");

  data.forEach(item => {
    list.innerHTML += `
      <div class="card p-2 mt-2">
        ${item.email} - ${item.date}
        <button class="btn btn-success btn-sm float-end"
          onclick="approve(${item.id})">Approve</button>
      </div>
    `;
  });
});

function approve(id) {
  fetch(`http://localhost:3000/api/attendance/approve/${id}`, {
    method: "POST",
    headers: { "Authorization": token }
  })
  .then(() => location.reload());
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
