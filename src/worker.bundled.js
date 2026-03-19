// Auto-bundled worker — static files are served inline

const STATIC = {
  "/":           { ct: "text/html; charset=utf-8",    body: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Blueprint App</title>\n  <link rel=\"stylesheet\" href=\"style.css\" />\n</head>\n<body>\n  <header>\n    <div class=\"header-inner\">\n      <span class=\"header-icon\">&#128196;</span>\n      <div>\n        <h1>Blueprint App</h1>\n        <p class=\"header-subtitle\">Capture &amp; Submit Application Blueprints</p>\n      </div>\n    </div>\n  </header>\n\n  <main>\n    <!-- Form Section -->\n    <section class=\"card form-section\">\n      <h2 class=\"section-title\">New Blueprint</h2>\n\n      <form id=\"blueprint-form\" novalidate>\n        <div class=\"field-group\">\n          <label for=\"companyName\">Company Name <span class=\"required\">*</span></label>\n          <input\n            type=\"text\"\n            id=\"companyName\"\n            name=\"companyName\"\n            placeholder=\"e.g. Acme Corporation\"\n            autocomplete=\"organization\"\n            required\n          />\n        </div>\n\n        <div class=\"field-group\">\n          <label for=\"applicationPurpose\">Application Purpose <span class=\"required\">*</span></label>\n          <input\n            type=\"text\"\n            id=\"applicationPurpose\"\n            name=\"applicationPurpose\"\n            placeholder=\"e.g. Customer Portal, Internal Dashboard\"\n            required\n          />\n        </div>\n\n        <div class=\"field-group\">\n          <label for=\"description\">Description <span class=\"required\">*</span></label>\n          <textarea\n            id=\"description\"\n            name=\"description\"\n            rows=\"5\"\n            placeholder=\"Provide a detailed description of the application blueprint...\"\n            required\n          ></textarea>\n        </div>\n\n        <div id=\"status-message\" role=\"alert\" aria-live=\"polite\"></div>\n\n        <button type=\"submit\" id=\"submit-btn\">\n          <span class=\"btn-text\">Submit Blueprint</span>\n          <span class=\"btn-spinner\" aria-hidden=\"true\"></span>\n        </button>\n      </form>\n    </section>\n\n    <!-- Table Section -->\n    <section class=\"card table-section\">\n      <div class=\"table-header\">\n        <h2 class=\"section-title\">Submitted Blueprints</h2>\n        <span class=\"entry-count\" id=\"entry-count\">0 entries</span>\n      </div>\n\n      <p id=\"no-entries-msg\" class=\"empty-state\">No blueprints submitted yet. Fill out the form above to get started.</p>\n\n      <div class=\"table-wrapper\" id=\"table-wrapper\" style=\"display:none;\">\n        <table id=\"entries-table\">\n          <thead>\n            <tr>\n              <th>#</th>\n              <th>Company Name</th>\n              <th>Application Purpose</th>\n              <th>Description</th>\n              <th>Submitted At</th>\n            </tr>\n          </thead>\n          <tbody id=\"entries-body\"></tbody>\n        </table>\n      </div>\n    </section>\n  </main>\n\n  <footer>\n    <p>Blueprint App &mdash; Submissions are emailed automatically upon capture.</p>\n  </footer>\n\n  <script src=\"app.js\"></script>\n</body>\n</html>\n" },
  "/index.html": { ct: "text/html; charset=utf-8",    body: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Blueprint App</title>\n  <link rel=\"stylesheet\" href=\"style.css\" />\n</head>\n<body>\n  <header>\n    <div class=\"header-inner\">\n      <span class=\"header-icon\">&#128196;</span>\n      <div>\n        <h1>Blueprint App</h1>\n        <p class=\"header-subtitle\">Capture &amp; Submit Application Blueprints</p>\n      </div>\n    </div>\n  </header>\n\n  <main>\n    <!-- Form Section -->\n    <section class=\"card form-section\">\n      <h2 class=\"section-title\">New Blueprint</h2>\n\n      <form id=\"blueprint-form\" novalidate>\n        <div class=\"field-group\">\n          <label for=\"companyName\">Company Name <span class=\"required\">*</span></label>\n          <input\n            type=\"text\"\n            id=\"companyName\"\n            name=\"companyName\"\n            placeholder=\"e.g. Acme Corporation\"\n            autocomplete=\"organization\"\n            required\n          />\n        </div>\n\n        <div class=\"field-group\">\n          <label for=\"applicationPurpose\">Application Purpose <span class=\"required\">*</span></label>\n          <input\n            type=\"text\"\n            id=\"applicationPurpose\"\n            name=\"applicationPurpose\"\n            placeholder=\"e.g. Customer Portal, Internal Dashboard\"\n            required\n          />\n        </div>\n\n        <div class=\"field-group\">\n          <label for=\"description\">Description <span class=\"required\">*</span></label>\n          <textarea\n            id=\"description\"\n            name=\"description\"\n            rows=\"5\"\n            placeholder=\"Provide a detailed description of the application blueprint...\"\n            required\n          ></textarea>\n        </div>\n\n        <div id=\"status-message\" role=\"alert\" aria-live=\"polite\"></div>\n\n        <button type=\"submit\" id=\"submit-btn\">\n          <span class=\"btn-text\">Submit Blueprint</span>\n          <span class=\"btn-spinner\" aria-hidden=\"true\"></span>\n        </button>\n      </form>\n    </section>\n\n    <!-- Table Section -->\n    <section class=\"card table-section\">\n      <div class=\"table-header\">\n        <h2 class=\"section-title\">Submitted Blueprints</h2>\n        <span class=\"entry-count\" id=\"entry-count\">0 entries</span>\n      </div>\n\n      <p id=\"no-entries-msg\" class=\"empty-state\">No blueprints submitted yet. Fill out the form above to get started.</p>\n\n      <div class=\"table-wrapper\" id=\"table-wrapper\" style=\"display:none;\">\n        <table id=\"entries-table\">\n          <thead>\n            <tr>\n              <th>#</th>\n              <th>Company Name</th>\n              <th>Application Purpose</th>\n              <th>Description</th>\n              <th>Submitted At</th>\n            </tr>\n          </thead>\n          <tbody id=\"entries-body\"></tbody>\n        </table>\n      </div>\n    </section>\n  </main>\n\n  <footer>\n    <p>Blueprint App &mdash; Submissions are emailed automatically upon capture.</p>\n  </footer>\n\n  <script src=\"app.js\"></script>\n</body>\n</html>\n" },
  "/style.css":  { ct: "text/css; charset=utf-8",     body: "/* \u2500\u2500 Variables \u2500\u2500 */\n:root {\n  --bg:          #0d1b2a;\n  --bg-card:     #112236;\n  --bg-input:    #0a1929;\n  --accent:      #1e90ff;\n  --accent-hover:#4da6ff;\n  --accent-dark: #0a6abf;\n  --text:        #e6edf3;\n  --text-muted:  #8b949e;\n  --border:      #1f3a55;\n  --success-bg:  #0d2b1a;\n  --success-text:#3fb950;\n  --error-bg:    #2b0d0d;\n  --error-text:  #f85149;\n  --row-even:    #0f2133;\n  --header-h:    72px;\n  --radius:      10px;\n  --shadow:      0 4px 24px rgba(0,0,0,0.4);\n}\n\n/* \u2500\u2500 Reset & Base \u2500\u2500 */\n*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n\nbody {\n  background: var(--bg);\n  color: var(--text);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n  font-size: 15px;\n  line-height: 1.6;\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\n/* \u2500\u2500 Header \u2500\u2500 */\nheader {\n  background: linear-gradient(135deg, #0a1929 0%, #112236 100%);\n  border-bottom: 1px solid var(--border);\n  padding: 0 24px;\n  height: var(--header-h);\n  display: flex;\n  align-items: center;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  box-shadow: 0 2px 12px rgba(0,0,0,0.5);\n}\n\n.header-inner {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  max-width: 960px;\n  width: 100%;\n  margin: 0 auto;\n}\n\n.header-icon {\n  font-size: 32px;\n  line-height: 1;\n}\n\nheader h1 {\n  font-size: 22px;\n  font-weight: 700;\n  color: var(--accent);\n  letter-spacing: 0.5px;\n}\n\n.header-subtitle {\n  font-size: 12px;\n  color: var(--text-muted);\n  margin-top: 2px;\n}\n\n/* \u2500\u2500 Main layout \u2500\u2500 */\nmain {\n  flex: 1;\n  max-width: 960px;\n  width: 100%;\n  margin: 32px auto;\n  padding: 0 24px;\n  display: flex;\n  flex-direction: column;\n  gap: 28px;\n}\n\n/* \u2500\u2500 Card \u2500\u2500 */\n.card {\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  padding: 28px 32px;\n  box-shadow: var(--shadow);\n}\n\n.section-title {\n  font-size: 17px;\n  font-weight: 600;\n  color: var(--accent);\n  margin-bottom: 20px;\n  padding-bottom: 10px;\n  border-bottom: 1px solid var(--border);\n}\n\n/* \u2500\u2500 Form \u2500\u2500 */\n.field-group {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-bottom: 18px;\n}\n\nlabel {\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--text-muted);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n\n.required { color: var(--accent); }\n\ninput[type=\"text\"],\ntextarea {\n  background: var(--bg-input);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  color: var(--text);\n  font-size: 14px;\n  font-family: inherit;\n  padding: 10px 14px;\n  width: 100%;\n  transition: border-color 0.2s, box-shadow 0.2s;\n  outline: none;\n  resize: vertical;\n}\n\ninput[type=\"text\"]:focus,\ntextarea:focus {\n  border-color: var(--accent);\n  box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.2);\n}\n\ninput[type=\"text\"]::placeholder,\ntextarea::placeholder {\n  color: #3d5166;\n}\n\n/* \u2500\u2500 Status message \u2500\u2500 */\n#status-message {\n  display: none;\n  padding: 12px 16px;\n  border-radius: 6px;\n  font-size: 14px;\n  font-weight: 500;\n  margin-bottom: 16px;\n}\n\n#status-message.success {\n  display: block;\n  background: var(--success-bg);\n  color: var(--success-text);\n  border: 1px solid rgba(63, 185, 80, 0.3);\n}\n\n#status-message.error {\n  display: block;\n  background: var(--error-bg);\n  color: var(--error-text);\n  border: 1px solid rgba(248, 81, 73, 0.3);\n}\n\n/* \u2500\u2500 Submit button \u2500\u2500 */\n#submit-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  background: var(--accent);\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  padding: 11px 28px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s, transform 0.1s;\n  letter-spacing: 0.3px;\n}\n\n#submit-btn:hover:not(:disabled) {\n  background: var(--accent-hover);\n}\n\n#submit-btn:active:not(:disabled) {\n  transform: translateY(1px);\n}\n\n#submit-btn:disabled {\n  opacity: 0.65;\n  cursor: not-allowed;\n}\n\n.btn-spinner {\n  display: none;\n  width: 14px;\n  height: 14px;\n  border: 2px solid rgba(255,255,255,0.3);\n  border-top-color: #fff;\n  border-radius: 50%;\n  animation: spin 0.7s linear infinite;\n}\n\n#submit-btn.loading .btn-spinner { display: inline-block; }\n#submit-btn.loading .btn-text   { opacity: 0.8; }\n\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n\n/* \u2500\u2500 Table section header \u2500\u2500 */\n.table-header {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  margin-bottom: 20px;\n  padding-bottom: 10px;\n  border-bottom: 1px solid var(--border);\n}\n\n.table-header .section-title { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }\n\n.entry-count {\n  font-size: 12px;\n  color: var(--text-muted);\n  background: rgba(30, 144, 255, 0.12);\n  border: 1px solid rgba(30, 144, 255, 0.25);\n  border-radius: 20px;\n  padding: 2px 10px;\n}\n\n/* \u2500\u2500 Empty state \u2500\u2500 */\n.empty-state {\n  color: var(--text-muted);\n  font-size: 14px;\n  text-align: center;\n  padding: 32px 0;\n  font-style: italic;\n}\n\n/* \u2500\u2500 Table \u2500\u2500 */\n.table-wrapper {\n  overflow-x: auto;\n  border-radius: 6px;\n  border: 1px solid var(--border);\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13.5px;\n}\n\nthead tr {\n  background: #0a1929;\n}\n\nth {\n  text-align: left;\n  padding: 12px 14px;\n  font-size: 11px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.7px;\n  color: var(--accent);\n  white-space: nowrap;\n  border-bottom: 1px solid var(--border);\n}\n\ntd {\n  padding: 11px 14px;\n  vertical-align: top;\n  border-bottom: 1px solid var(--border);\n  color: var(--text);\n  word-break: break-word;\n  max-width: 260px;\n}\n\ntbody tr:last-child td { border-bottom: none; }\n\ntbody tr:nth-child(even) { background: var(--row-even); }\n\ntbody tr:hover { background: rgba(30, 144, 255, 0.06); }\n\ntd:first-child {\n  color: var(--text-muted);\n  font-weight: 600;\n  width: 40px;\n  text-align: center;\n}\n\ntd:last-child {\n  color: var(--text-muted);\n  font-size: 12px;\n  white-space: nowrap;\n}\n\n/* \u2500\u2500 Footer \u2500\u2500 */\nfooter {\n  text-align: center;\n  padding: 20px;\n  font-size: 12px;\n  color: var(--text-muted);\n  border-top: 1px solid var(--border);\n  margin-top: auto;\n}\n\n/* \u2500\u2500 Responsive \u2500\u2500 */\n@media (max-width: 600px) {\n  .card { padding: 20px 16px; }\n  main  { padding: 0 12px; margin: 16px auto; }\n}\n" },
  "/app.js":     { ct: "application/javascript",      body: "(function () {\n  const form         = document.getElementById('blueprint-form');\n  const statusMsg    = document.getElementById('status-message');\n  const entriesBody  = document.getElementById('entries-body');\n  const noEntriesMsg = document.getElementById('no-entries-msg');\n  const tableWrapper = document.getElementById('table-wrapper');\n  const entryCount   = document.getElementById('entry-count');\n  const submitBtn    = document.getElementById('submit-btn');\n\n  // \u2500\u2500 Load persisted entries on page load \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function loadEntries() {\n    try {\n      const res  = await fetch('/entries');\n      const data = await safeJson(res);\n\n      if (data.success && data.entries.length > 0) {\n        data.entries.forEach(entry => renderRow(entry, false));\n        updateCount(data.entries.length);\n        noEntriesMsg.style.display = 'none';\n        tableWrapper.style.display = 'block';\n      } else if (!data.success) {\n        console.error('Could not load entries:', data.error);\n      }\n    } catch (err) {\n      console.error('Failed to load entries:', err.message);\n    }\n  }\n\n  loadEntries();\n\n  // \u2500\u2500 Form submit \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  form.addEventListener('submit', async (e) => {\n    e.preventDefault();\n\n    const payload = {\n      companyName:        form.companyName.value.trim(),\n      applicationPurpose: form.applicationPurpose.value.trim(),\n      description:        form.description.value.trim(),\n    };\n\n    if (!payload.companyName || !payload.applicationPurpose || !payload.description) {\n      showStatus('error', 'Please fill in all required fields.');\n      return;\n    }\n\n    setLoading(true);\n\n    try {\n      const res  = await fetch('/submit', {\n        method:  'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body:    JSON.stringify(payload),\n      });\n      const data = await safeJson(res);\n\n      if (res.ok && data.success) {\n        renderRow(data.entry, true);\n        updateCount(entriesBody.children.length);\n\n        if (data.emailWarning) {\n          showStatus('error', `Saved to database but email failed: ${data.emailWarning}`);\n        } else {\n          showStatus('success', `Blueprint #${data.entry.id} saved and email sent!`);\n        }\n        form.reset();\n      } else {\n        showStatus('error', data.error || `Server error (HTTP ${res.status})`);\n      }\n    } catch (err) {\n      showStatus('error', err.message);\n    } finally {\n      setLoading(false);\n    }\n  });\n\n  // \u2500\u2500 Safe JSON parser \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  // Reads the raw text first so we never get \"Unexpected end of JSON input\"\n  // when the server returns an empty or HTML error body.\n  async function safeJson(res) {\n    const text = await res.text();\n    if (!text || text.trim() === '') {\n      throw new Error(`Server returned an empty response (HTTP ${res.status} ${res.statusText}).`);\n    }\n    try {\n      return JSON.parse(text);\n    } catch {\n      // Truncate long HTML error pages for readability\n      const preview = text.replace(/<[^>]+>/g, '').trim().slice(0, 120);\n      throw new Error(`Server returned non-JSON (HTTP ${res.status}): ${preview}`);\n    }\n  }\n\n  // \u2500\u2500 Render a single row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  function renderRow(entry, animate) {\n    noEntriesMsg.style.display = 'none';\n    tableWrapper.style.display = 'block';\n\n    const tr = document.createElement('tr');\n    tr.innerHTML = `\n      <td>${entry.id}</td>\n      <td>${esc(entry.company_name)}</td>\n      <td>${esc(entry.application_purpose)}</td>\n      <td>${esc(entry.description)}</td>\n      <td>${esc(entry.submitted_at)}</td>\n    `;\n\n    if (animate) {\n      tr.style.opacity = '0';\n      entriesBody.prepend(tr);\n      requestAnimationFrame(() => {\n        tr.style.transition = 'opacity 0.35s ease';\n        tr.style.opacity    = '1';\n      });\n    } else {\n      entriesBody.appendChild(tr);\n    }\n  }\n\n  // \u2500\u2500 Update entry count badge \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  function updateCount(n) {\n    entryCount.textContent = n + (n === 1 ? ' entry' : ' entries');\n  }\n\n  // \u2500\u2500 Status message \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  function showStatus(type, message) {\n    statusMsg.textContent = message;\n    statusMsg.className   = type;\n    clearTimeout(statusMsg._hideTimer);\n    statusMsg._hideTimer = setTimeout(() => {\n      statusMsg.className   = '';\n      statusMsg.textContent = '';\n    }, 6000);\n  }\n\n  // \u2500\u2500 Button loading state \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  function setLoading(isLoading) {\n    submitBtn.disabled = isLoading;\n    submitBtn.classList.toggle('loading', isLoading);\n  }\n\n  // \u2500\u2500 XSS-safe escape \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  function esc(str) {\n    return String(str)\n      .replace(/&/g, '&amp;')\n      .replace(/</g, '&lt;')\n      .replace(/>/g, '&gt;')\n      .replace(/\"/g, '&quot;');\n  }\n})();\n" },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── API routes ────────────────────────────────────────────────────────────
    if (url.pathname === "/entries" && request.method === "GET")  return handleEntries(env);
    if (url.pathname === "/submit"  && request.method === "POST") return handleSubmit(request, env);

    // ── Static files ──────────────────────────────────────────────────────────
    const asset = STATIC[url.pathname];
    if (asset) return new Response(asset.body, { headers: { "Content-Type": asset.ct } });

    return new Response("Not found", { status: 404 });
  },
};

// ── GET /entries ──────────────────────────────────────────────────────────────
async function handleEntries(env) {
  try {
    if (!env.db) {
      return jsonRes({ success: false, error: 'D1 binding "db" not found. Check Cloudflare dashboard → Workers → Settings → D1 database bindings.' }, 503);
    }

    const { results } = await env.db.prepare(
      `SELECT id, company_name, application_purpose, description, submitted_at
       FROM blueprints ORDER BY id DESC`
    ).all();

    return jsonRes({ success: true, entries: results || [] });
  } catch (err) {
    return jsonRes({ success: false, error: err.message }, 500);
  }
}

// ── POST /submit ──────────────────────────────────────────────────────────────
async function handleSubmit(request, env) {
  try {
    if (!env.db) {
      return jsonRes({ success: false, error: 'D1 binding "db" not found. Check Cloudflare dashboard → Workers → Settings → D1 database bindings.' }, 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonRes({ success: false, error: 'Invalid JSON body.' }, 400);
    }

    const { applicationPurpose, description, companyName } = body;

    if (!applicationPurpose || !description || !companyName) {
      return jsonRes({ success: false, error: 'All fields are required.' }, 400);
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });

    // 1. Save to D1
    let newEntry;
    try {
      const result = await env.db.prepare(
        `INSERT INTO blueprints (company_name, application_purpose, description, submitted_at)
         VALUES (?, ?, ?, ?)`
      ).bind(companyName, applicationPurpose, description, submittedAt).run();

      newEntry = {
        id:                  result.meta.last_row_id,
        company_name:        companyName,
        application_purpose: applicationPurpose,
        description,
        submitted_at:        submittedAt,
      };
    } catch (err) {
      return jsonRes({ success: false, error: 'Database error: ' + err.message }, 500);
    }

    // 2. Send email via Resend
    let emailWarning;
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.EMAIL_TO) {
      emailWarning = 'Email skipped — RESEND_API_KEY / EMAIL_FROM / EMAIL_TO not configured.';
    } else {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization:  `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    env.EMAIL_FROM,
            to:      env.EMAIL_TO,
            subject: `New Blueprint Submission — ${companyName}`,
            text:    `Record #${newEntry.id}\nCompany: ${companyName}\nPurpose: ${applicationPurpose}\nDescription: ${description}\nSubmitted: ${submittedAt}`,
            html:    buildEmailHtml({ companyName, applicationPurpose, description, submittedAt, id: newEntry.id }),
          }),
        });

        if (!emailRes.ok) {
          const e = await emailRes.json().catch(() => ({}));
          emailWarning = e.message || `Resend HTTP ${emailRes.status}`;
        }
      } catch (err) {
        emailWarning = err.message;
      }
    }

    return jsonRes({
      success: true,
      entry: newEntry,
      ...(emailWarning && { emailWarning }),
    });

  } catch (err) {
    return jsonRes({ success: false, error: 'Unexpected error: ' + err.message }, 500);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildEmailHtml({ companyName, applicationPurpose, description, submittedAt, id }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0d1b2a;color:#1e90ff;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:20px;">&#128196; New Blueprint Submission</h2>
      </div>
      <div style="border:1px solid #d0d7de;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tbody>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;width:160px;color:#57606a;border-bottom:1px solid #d0d7de;">Record #</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;">${id}</td>
            </tr>
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#57606a;border-bottom:1px solid #d0d7de;">Company Name</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;">${escapeHtml(companyName)}</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;color:#57606a;border-bottom:1px solid #d0d7de;">App Purpose</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;">${escapeHtml(applicationPurpose)}</td>
            </tr>
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#57606a;border-bottom:1px solid #d0d7de;vertical-align:top;">Description</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;white-space:pre-wrap;">${escapeHtml(description)}</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;color:#57606a;">Submitted At</th>
              <td style="padding:12px 16px;">${submittedAt}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="color:#8c949e;font-size:12px;text-align:center;margin-top:16px;">Sent by Blueprint App</p>
    </div>`;
}

