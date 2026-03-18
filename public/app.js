(function () {
  const form         = document.getElementById('blueprint-form');
  const statusMsg    = document.getElementById('status-message');
  const entriesBody  = document.getElementById('entries-body');
  const noEntriesMsg = document.getElementById('no-entries-msg');
  const tableWrapper = document.getElementById('table-wrapper');
  const entryCount   = document.getElementById('entry-count');
  const submitBtn    = document.getElementById('submit-btn');

  let rowCounter = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entry = {
      companyName:        form.companyName.value.trim(),
      applicationPurpose: form.applicationPurpose.value.trim(),
      description:        form.description.value.trim(),
      timestamp:          new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    if (!entry.companyName || !entry.applicationPurpose || !entry.description) {
      showStatus('error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res  = await fetch('/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(entry),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addTableRow(entry);
        showStatus('success', `Blueprint submitted successfully! An email has been sent.`);
        form.reset();
      } else {
        showStatus('error', data.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      showStatus('error', 'Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  });

  function addTableRow(entry) {
    rowCounter++;

    // Show table, hide empty state
    noEntriesMsg.style.display = 'none';
    tableWrapper.style.display = 'block';
    entryCount.textContent = rowCounter + (rowCounter === 1 ? ' entry' : ' entries');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${rowCounter}</td>
      <td>${esc(entry.companyName)}</td>
      <td>${esc(entry.applicationPurpose)}</td>
      <td>${esc(entry.description)}</td>
      <td>${esc(entry.timestamp)}</td>
    `;

    // Animate row in
    tr.style.opacity = '0';
    entriesBody.prepend(tr);
    requestAnimationFrame(() => {
      tr.style.transition = 'opacity 0.35s ease';
      tr.style.opacity    = '1';
    });
  }

  function showStatus(type, message) {
    statusMsg.textContent = message;
    statusMsg.className   = type;
    // Auto-hide after 6 seconds
    clearTimeout(statusMsg._hideTimer);
    statusMsg._hideTimer = setTimeout(() => {
      statusMsg.className   = '';
      statusMsg.textContent = '';
    }, 6000);
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('loading', isLoading);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
