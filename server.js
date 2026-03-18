require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const Database   = require('better-sqlite3');
const path       = require('path');

// ── Database setup ────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'blueprints.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS blueprints (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name       TEXT    NOT NULL,
    application_purpose TEXT   NOT NULL,
    description        TEXT    NOT NULL,
    submitted_at       TEXT    NOT NULL
  )
`);

const insertBlueprint = db.prepare(`
  INSERT INTO blueprints (company_name, application_purpose, description, submitted_at)
  VALUES (@company_name, @application_purpose, @description, @submitted_at)
`);

const getAllBlueprints = db.prepare(`
  SELECT id, company_name, application_purpose, description, submitted_at
  FROM blueprints
  ORDER BY id DESC
`);

console.log('SQLite database ready — blueprints.db');

// ── Email transport ───────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /entries — return all persisted blueprints
app.get('/entries', (req, res) => {
  try {
    const rows = getAllBlueprints.all();
    res.json({ success: true, entries: rows });
  } catch (err) {
    console.error('DB read error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /submit — save to DB then send email
app.post('/submit', async (req, res) => {
  const { applicationPurpose, description, companyName } = req.body;

  if (!applicationPurpose || !description || !companyName) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const submittedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // ── 1. Persist to SQLite ──────────────────────────────────────────────────
  let newEntry;
  try {
    const result = insertBlueprint.run({
      company_name:        companyName,
      application_purpose: applicationPurpose,
      description,
      submitted_at:        submittedAt,
    });

    newEntry = {
      id:                  result.lastInsertRowid,
      company_name:        companyName,
      application_purpose: applicationPurpose,
      description,
      submitted_at:        submittedAt,
    };
  } catch (err) {
    console.error('DB insert error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to save entry: ' + err.message });
  }

  // ── 2. Send email ─────────────────────────────────────────────────────────
  const mailOptions = {
    from:    `"Blueprint App" <${process.env.EMAIL_USER}>`,
    to:      process.env.EMAIL_TO,
    subject: `New Blueprint Submission — ${companyName}`,
    text:    `New Blueprint Submission\n\nCompany Name: ${companyName}\nApplication Purpose: ${applicationPurpose}\nDescription: ${description}\nSubmitted At: ${submittedAt}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0d1b2a; color: #1e90ff; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">&#128196; New Blueprint Submission</h2>
        </div>
        <div style="border: 1px solid #d0d7de; border-top: none; border-radius: 0 0 8px 8px; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              <tr style="background: #f6f8fa;">
                <th style="padding: 12px 16px; text-align: left; width: 180px; color: #57606a; font-weight: 600; border-bottom: 1px solid #d0d7de;">Company Name</th>
                <td style="padding: 12px 16px; border-bottom: 1px solid #d0d7de; color: #24292f;">${escapeHtml(companyName)}</td>
              </tr>
              <tr>
                <th style="padding: 12px 16px; text-align: left; color: #57606a; font-weight: 600; border-bottom: 1px solid #d0d7de;">Application Purpose</th>
                <td style="padding: 12px 16px; border-bottom: 1px solid #d0d7de; color: #24292f;">${escapeHtml(applicationPurpose)}</td>
              </tr>
              <tr style="background: #f6f8fa;">
                <th style="padding: 12px 16px; text-align: left; color: #57606a; font-weight: 600; border-bottom: 1px solid #d0d7de; vertical-align: top;">Description</th>
                <td style="padding: 12px 16px; border-bottom: 1px solid #d0d7de; color: #24292f; white-space: pre-wrap;">${escapeHtml(description)}</td>
              </tr>
              <tr>
                <th style="padding: 12px 16px; text-align: left; color: #57606a; font-weight: 600;">Submitted At</th>
                <td style="padding: 12px 16px; color: #24292f;">${submittedAt}</td>
              </tr>
              <tr style="background: #f6f8fa;">
                <th style="padding: 12px 16px; text-align: left; color: #57606a; font-weight: 600;">Record #</th>
                <td style="padding: 12px 16px; color: #24292f;">${newEntry.id}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style="color: #8c949e; font-size: 12px; text-align: center; margin-top: 16px;">Sent by Blueprint App</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error('Email send error:', err.message);
    // Entry already saved — return it with a warning
    res.json({ success: true, entry: newEntry, emailWarning: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Blueprint App running at http://localhost:${PORT}`);
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
