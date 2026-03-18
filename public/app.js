(function () {
  const form         = document.getElementById('blueprint-form');
  const statusMsg    = document.getElementById('status-message');
  const entriesBody  = document.getElementById('entries-body');
  const noEntriesMsg = document.getElementById('no-entries-msg');
  const tableWrapper = document.getElementById('table-wrapper');
  const entryCount   = document.getElementById('entry-count');
  const submitBtn    = document.getElementById('submit-btn');

  // ── Load persisted entries on page load ──────────────────────────────────
  async function loadEntries() {
    try {
      const res  = await fetch('/entries');
      const data = await safeJson(res);

      if (data.success && data.entries.length > 0) {
        data.entries.forEach(entry => renderRow(entry, false));
        updateCount(data.entries.length);
        noEntriesMsg.style.display = 'none';
        tableWrapper.style.display = 'block';
      } else if (!data.success) {
        console.error('Could not load entries:', data.error);
      }
    } catch (err) {
      console.error('Failed to load entries:', err.message);
    }
  }

  loadEntries();

  // ── Form submit ──────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      companyName:        form.companyName.value.trim(),
      applicationPurpose: form.applicationPurpose.value.trim(),
      description:        form.description.value.trim(),
    };

    if (!payload.companyName || !payload.applicationPurpose || !payload.description) {
      showStatus('error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res  = await fetch('/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await safeJson(res);

      if (res.ok && data.success) {
        renderRow(data.entry, true);
        updateCount(entriesBody.children.length);

        if (data.emailWarning) {
          showStatus('error', `Saved to database but email failed: ${data.emailWarning}`);
        } else {
          showStatus('success', `Blueprint #${data.entry.id} saved and email sent!`);
        }
        form.reset();
      } else {
        showStatus('error', data.error || `Server error (HTTP ${res.status})`);
      }
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setLoading(false);
    }
  });

  // ── Safe JSON parser ─────────────────────────────────────────────────────
  // Reads the raw text first so we never get "Unexpected end of JSON input"
  // when the server returns an empty or HTML error body.
  async function safeJson(res) {
    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error(`Server returned an empty response (HTTP ${res.status} ${res.statusText}).`);
    }
    try {
      return JSON.parse(text);
    } catch {
      // Truncate long HTML error pages for readability
      const preview = text.replace(/<[^>]+>/g, '').trim().slice(0, 120);
      throw new Error(`Server returned non-JSON (HTTP ${res.status}): ${preview}`);
    }
  }

  // ── Render a single row ──────────────────────────────────────────────────
  function renderRow(entry, animate) {
    noEntriesMsg.style.display = 'none';
    tableWrapper.style.display = 'block';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${entry.id}</td>
      <td>${esc(entry.company_name)}</td>
      <td>${esc(entry.application_purpose)}</td>
      <td>${esc(entry.description)}</td>
      <td>${esc(entry.submitted_at)}</td>
    `;

    if (animate) {
      tr.style.opacity = '0';
      entriesBody.prepend(tr);
      requestAnimationFrame(() => {
        tr.style.transition = 'opacity 0.35s ease';
        tr.style.opacity    = '1';
      });
    } else {
      entriesBody.appendChild(tr);
    }
  }

  // ── Update entry count badge ─────────────────────────────────────────────
  function updateCount(n) {
    entryCount.textContent = n + (n === 1 ? ' entry' : ' entries');
  }

  // ── Status message ───────────────────────────────────────────────────────
  function showStatus(type, message) {
    statusMsg.textContent = message;
    statusMsg.className   = type;
    clearTimeout(statusMsg._hideTimer);
    statusMsg._hideTimer = setTimeout(() => {
      statusMsg.className   = '';
      statusMsg.textContent = '';
    }, 6000);
  }

  // ── Button loading state ─────────────────────────────────────────────────
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('loading', isLoading);
  }

  // ── XSS-safe escape ──────────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
