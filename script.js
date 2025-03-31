// Database to store logs
let logs = JSON.parse(localStorage.getItem('gateLogs')) || [];
let emailSettings = JSON.parse(localStorage.getItem('emailSettings')) || {
  deanEmail: 'dean@biet.edu',
  reportTime: '23:59'
};

// DOM Elements
const entryForm = document.getElementById('entryForm');
const exitForm = document.getElementById('exitForm');
const emailSettingsForm = document.getElementById('emailSettingsForm');
const logsTable = document.getElementById('logsTable').getElementsByTagName('tbody')[0];
const exportTodayBtn = document.getElementById('exportTodayBtn');
const sendNowBtn = document.getElementById('sendNowBtn');

// Initialize forms with saved settings
document.getElementById('deanEmail').value = emailSettings.deanEmail;
document.getElementById('reportTime').value = emailSettings.reportTime;

// Update logs display
updateLogsDisplay();

// Set up daily email report
setupDailyReport();

// Event Listeners
entryForm.addEventListener('submit', handleEntry);
exitForm.addEventListener('submit', handleExit);
emailSettingsForm.addEventListener('submit', saveEmailSettings);
exportTodayBtn.addEventListener('click', exportTodayLogs);
sendNowBtn.addEventListener('click', sendReportNow);

// Functions
function handleEntry(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const rollNumber = document.getElementById('rollNumber').value;
  const purpose = document.getElementById('purpose').value;
  const entryTime = new Date();
  
  logs.push({
    name,
    rollNumber,
    purpose,
    entryTime: entryTime.toISOString(),
    exitTime: null
  });
  
  saveLogs();
  updateLogsDisplay();
  entryForm.reset();
  
  alert(`Entry recorded for ${name} (${rollNumber})`);
}

function handleExit(e) {
  e.preventDefault();
  
  const rollNumber = document.getElementById('exitRollNumber').value;
  const exitTime = new Date();
  let found = false;
  
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].rollNumber === rollNumber && !logs[i].exitTime) {
      logs[i].exitTime = exitTime.toISOString();
      found = true;
      break;
    }
  }
  
  if (found) {
    saveLogs();
    updateLogsDisplay();
    exitForm.reset();
    alert(`Exit recorded for ${rollNumber}`);
  } else {
    alert(`No active entry found for ${rollNumber} or already exited`);
  }
}

function saveEmailSettings(e) {
  e.preventDefault();
  
  emailSettings = {
    deanEmail: document.getElementById('deanEmail').value,
    reportTime: document.getElementById('reportTime').value
  };
  
  localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
  alert('Email settings saved successfully');
  
  // Reset the daily report schedule
  setupDailyReport();
}

function updateLogsDisplay() {
  logsTable.innerHTML = '';
  
  logs.forEach(log => {
    const row = logsTable.insertRow();
    
    const nameCell = row.insertCell(0);
    const rollCell = row.insertCell(1);
    const entryCell = row.insertCell(2);
    const exitCell = row.insertCell(3);
    const purposeCell = row.insertCell(4);
    const durationCell = row.insertCell(5);
    
    nameCell.textContent = log.name;
    rollCell.textContent = log.rollNumber;
    entryCell.textContent = formatDateTime(log.entryTime);
    exitCell.textContent = log.exitTime ? formatDateTime(log.exitTime) : 'Still Inside';
    purposeCell.textContent = log.purpose;
    
    // Calculate duration if exited
    if (log.exitTime) {
      const entry = new Date(log.entryTime);
      const exit = new Date(log.exitTime);
      const duration = (exit - entry) / (1000 * 60); // in minutes
      durationCell.textContent = `${Math.floor(duration)} minutes`;
    } else {
      durationCell.textContent = '-';
    }
  });
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString();
}

function saveLogs() {
  localStorage.setItem('gateLogs', JSON.stringify(logs));
}

function setupDailyReport() {
  // Clear any existing scheduled reports
  if (window.reportInterval) {
    clearInterval(window.reportInterval);
  }
  
  // Schedule daily report
  const [hours, minutes] = emailSettings.reportTime.split(':').map(Number);
  
  function checkTime() {
    const now = new Date();
    if (now.getHours() === hours && now.getMinutes() === minutes) {
      sendDailyReport();
    }
  }
  
  // Check every minute
  window.reportInterval = setInterval(checkTime, 60000);
}

function sendDailyReport() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysLogs = logs.filter(log => {
    const logDate = new Date(log.entryTime);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });
  
  if (todaysLogs.length === 0) {
    console.log('No logs to send for today');
    return;
  }
  
  const subject = `BIET Gate Logs Report - ${formatDate(today)}`;
  const body = generateEmailBody(todaysLogs);
  
  // In a real implementation, you would send this via your backend
  console.log(`Would send email to: ${emailSettings.deanEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // For demo purposes, we'll just show an alert
  alert(`Daily report sent to ${emailSettings.deanEmail} at ${new Date().toLocaleTimeString()}`);
}

function exportTodayLogs() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysLogs = logs.filter(log => {
    const logDate = new Date(log.entryTime);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });
  
  if (todaysLogs.length === 0) {
    alert('No logs for today');
    return;
  }
  
  const csvContent = generateCSV(todaysLogs);
  downloadCSV(csvContent, `biet_gate_logs_${formatDate(today, 'yyyy-mm-dd')}.csv`);
}

function sendReportNow() {
  sendDailyReport();
}

function generateEmailBody(logs) {
  let body = `BIET College Gate Entry/Exit Report\n`;
  body += `Date: ${formatDate(new Date())}\n\n`;
  body += `Total Entries: ${logs.length}\n\n`;
  
  body += 'Details:\n';
  body += 'Name, Roll Number, Entry Time, Exit Time, Purpose, Duration\n';
  
  logs.forEach(log => {
    const entryTime = formatDateTime(log.entryTime);
    const exitTime = log.exitTime ? formatDateTime(log.exitTime) : 'Still Inside';
    const duration = log.exitTime 
      ? `${Math.floor((new Date(log.exitTime) - new Date(log.entryTime)) / (1000 * 60))} minutes`
      : '-';
    
    body += `${log.name}, ${log.rollNumber}, ${entryTime}, ${exitTime}, ${log.purpose}, ${duration}\n`;
  });
  
  body += '\n\nThis is an automated report.';
  return body;
}

function generateCSV(logs) {
  let csv = 'Name,Roll Number,Entry Time,Exit Time,Purpose,Duration (minutes)\n';
  
  logs.forEach(log => {
    const entryTime = formatDateTime(log.entryTime);
    const exitTime = log.exitTime ? formatDateTime(log.exitTime) : 'Still Inside';
    const duration = log.exitTime 
      ? Math.floor((new Date(log.exitTime) - new Date(log.entryTime)) / (1000 * 60))
      : '';
    
    csv += `"${log.name}","${log.rollNumber}","${entryTime}","${exitTime}","${log.purpose}","${duration}"\n`;
  });
  
  return csv;
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatDate(date, format = 'dd/mm/yyyy') {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (format === 'yyyy-mm-dd') {
    return `${year}-${month}-${day}`;
  }
  return `${day}/${month}/${year}`;
}
