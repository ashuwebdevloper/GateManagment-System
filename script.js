// Initialize logs array
let logs = JSON.parse(localStorage.getItem('logs')) || [];

// Entry Form Submission
document.getElementById('entryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const rollNumber = document.getElementById('rollNumber').value;
  const purpose = document.getElementById('purpose').value;

  const entry = {
    name,
    rollNumber,
    purpose,
    entryTime: new Date().toLocaleString(),
    exitTime: null,
  };

  logs.push(entry);
  localStorage.setItem('logs', JSON.stringify(logs));
  updateLogsTable();
  e.target.reset();
});

// Exit Form Submission
document.getElementById('exitForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const rollNumber = document.getElementById('exitRollNumber').value;

  const entry = logs.find((log) => log.rollNumber === rollNumber && !log.exitTime);
  if (entry) {
    entry.exitTime = new Date().toLocaleString();
    localStorage.setItem('logs', JSON.stringify(logs));
    updateLogsTable();
  } else {
    alert('Entry not found or already exited');
  }
  e.target.reset();
});

// Update Logs Table
function updateLogsTable() {
  const tbody = document.querySelector('#logsTable tbody');
  tbody.innerHTML = '';

  logs.forEach((log) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${log.name}</td>
      <td>${log.rollNumber}</td>
      <td>${log.entryTime}</td>
      <td>${log.exitTime || 'Still Inside'}</td>
      <td>${log.purpose}</td>
    `;
    tbody.appendChild(row);
  });
}

// Load logs on page load
updateLogsTable();