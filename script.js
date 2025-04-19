// script.js

document.getElementById('entryForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const rollNumber = document.getElementById('rollNumber').value;
  const purpose = document.getElementById('purpose').value;
  const entryTime = new Date().toLocaleTimeString();

  const table = document.getElementById('logsTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `
    <td>${name}</td>
    <td>${rollNumber}</td>
    <td>${entryTime}</td>
    <td>-</td>
    <td>${purpose}</td>
    <td>-</td>
  `;
});

document.getElementById('exitForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const exitRollNumber = document.getElementById('exitRollNumber').value;
  const table = document.getElementById('logsTable').getElementsByTagName('tbody')[0];

  for (let i = table.rows.length - 1; i >= 0; i--) {
    const row = table.rows[i];
    if (row.cells[1].innerText === exitRollNumber && row.cells[3].innerText === '-') {
      const exitTime = new Date();
      row.cells[3].innerText = exitTime.toLocaleTimeString();

      const entryParts = row.cells[2].innerText.split(":"),
            exitParts = row.cells[3].innerText.split(":");

      const duration = ((parseInt(exitParts[0]) * 60 + parseInt(exitParts[1])) - (parseInt(entryParts[0]) * 60 + parseInt(entryParts[1]))) + ' mins';
      row.cells[5].innerText = duration;
      break;
    }
  }
});

document.getElementById('emailSettingsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Email settings saved successfully!');
});

document.getElementById('exportTodayBtn').addEventListener('click', function() {
  alert('Logs exported!');
});

document.getElementById('sendNowBtn').addEventListener('click', function() {
  alert('Report sent successfully!');
});

function startFaceRecognition() {
  const cameraFeed = document.getElementById('cameraFeed');
  cameraFeed.innerHTML = '<p>Face recognition is starting... (Mocked)</p>';
  // Integrate actual face recognition logic using WebRTC or third-party libraries.
}
