(function () {
  const form         = document.getElementById('blueprint-form');
  const statusMsg    = document.getElementById('status-message');
  const entriesBody  = document.getElementById('entries-body');
  const noEntriesMsg = document.getElementById('no-entries-msg');
  const tableWrapper = document.getElementById('table-wrapper');
  const entryCount   = document.getElementById('entry-count');
  const submitBtn    = document.getElementById('submit-btn');

  // ── File upload elements ─────────────────────────────────────────────────
  const fileInput    = document.getElementById('attachment');
  const dropZone     = document.getElementById('file-drop-zone');
  const filePreview  = document.getElementById('file-preview');
  const fileNameEl   = document.getElementById('file-preview-name');
  const fileSizeEl   = document.getElementById('file-preview-size');
  const fileClearBtn = document.getElementById('file-clear-btn');
  const MAX_BYTES    = 3 * 1024 * 1024; // 3 MB

  let selectedFileB64  = null;
  let selectedFileName = null;
  let selectedFileMime = null;

  // Drag-over highlight
  dropZone.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop',      (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0]); });

  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  fileClearBtn.addEventListener('click', clearFile);

  function handleFile(file) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      showStatus('error', `File too large (${fmtSize(file.size)}). Maximum allowed is 3 MB.`);
      clearFile();
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      // e.target.result = "data:mime;base64,XXXX" — strip the prefix
      const dataUrl = e.target.result;
      const b64     = dataUrl.split(',')[1];
      selectedFileB64  = b64;
      selectedFileName = file.name;
      selectedFileMime = file.type || 'application/octet-stream';

      fileNameEl.textContent = file.name;
      fileSizeEl.textContent = fmtSize(file.size);
      filePreview.style.display = 'flex';
      dropZone.style.display    = 'none';
    };
    reader.readAsDataURL(file);
  }

  function clearFile() {
    selectedFileB64  = null;
    selectedFileName = null;
    selectedFileMime = null;
    fileInput.value  = '';
    filePreview.style.display = 'none';
    dropZone.style.display    = 'block';
  }

  function fmtSize(bytes) {
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

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

    // Attach file data if selected
    if (selectedFileB64) {
      payload.attachmentName = selectedFileName;
      payload.attachmentData = selectedFileB64;
      payload.attachmentMime = selectedFileMime;
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
          showStatus('error', `Saved but email failed: ${data.emailWarning}`);
        } else {
          showStatus('success', `Blueprint #${data.entry.id} saved and email sent!`);
        }
        form.reset();
        clearFile();
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
  async function safeJson(res) {
    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error(`Server returned an empty response (HTTP ${res.status} ${res.statusText}).`);
    }
    try {
      return JSON.parse(text);
    } catch {
      const preview = text.replace(/<[^>]+>/g, '').trim().slice(0, 120);
      throw new Error(`Server returned non-JSON (HTTP ${res.status}): ${preview}`);
    }
  }

  // ── Render a single row ──────────────────────────────────────────────────
  function renderRow(entry, animate) {
    noEntriesMsg.style.display = 'none';
    tableWrapper.style.display = 'block';

    // Build attachment cell
    let attachCell;
    if (entry.attachment_name) {
      // Create a download link from stored base64 if available
      if (entry.attachment_data) {
        const mime = entry.attachment_mime || 'application/octet-stream';
        const href = `data:${mime};base64,${entry.attachment_data}`;
        attachCell = `<a class="attach-link" href="${href}" download="${esc(entry.attachment_name)}" title="Download ${esc(entry.attachment_name)}">
          &#128206; ${esc(entry.attachment_name)}
        </a>`;
      } else {
        attachCell = `<span class="attach-link">&#128206; ${esc(entry.attachment_name)}</span>`;
      }
    } else {
      attachCell = `<span class="no-attach">—</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${entry.id}</td>
      <td>${esc(entry.company_name)}</td>
      <td>${esc(entry.application_purpose)}</td>
      <td>${esc(entry.description)}</td>
      <td>${attachCell}</td>
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
