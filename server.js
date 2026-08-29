#!/usr/bin/env node
/**
 * AceIt AI — Gemini proxy backend
 * ---------------------------------
 * A dependency-free Node server that keeps the Gemini API key server-side.
 * The browser only ever talks to this proxy; it never sees the key.
 *
 * Usage:
 *   export GEMINI_API_KEY=your_key
 *   node server.js                 # listens on http://localhost:8787
 *
 * Optional env:
 *   PORT          (default 8787)
 *   GEMINI_MODEL  (default gemini-2.0-flash)
 */
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8787;
const API_KEY = process.env.GEMINI_API_KEY_WWW || process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const GEMINI_URL = ;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
};

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...CORS });
  res.end(JSON.stringify(obj));
}

/** Build the system prompt for Gemini based on subject + grade. */
function buildSystemPrompt(subject, grade) {
  return [
    ,
    ,
    '',
    'Rules you MUST follow:',
    '1. Give a clear, correct, step-by-step explanation appropriate for the student\'s level.',
    '2. Never state an incorrect fact. If unsure, say so and explain what you are unsure about.',
    '3. For math, show the working out and the final answer clearly.',
    '4. ALWAYS end your ENTIRE reply with a single new line in exactly this format:',
    '   FLASHCARD:{"front":"...","back":"..."}',
    '   where "front" is a short one-line question or key term and "back" is a concise answer/definition.',
    '   The FLASHCARD line must be the very last thing in your reply.',
  ].join('\n');
}

/** Call the Gemini REST API and return the raw text. */
async function callGemini(prompt) {
  const resp = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error();
  }
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

/** Split the model text into (answer, flashcard). */
function parseFlashcard(text) {
  const match = text.match(/FLASHCARD:\s*(\{[\s\S]*\})/);
  if (!match) return { answer: text, flashcard: null };
  let flashcard = null;
  try { flashcard = JSON.parse(match[1]); } catch (_) { flashcard = null; }
  const answer = text.replace(match[0], '').trim();
  return { answer, flashcard };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });

  const url = new URL(req.url, );

  // Serve the app page itself so the whole thing works on ONE origin
  // (open http://localhost:8787 — no separate file:// or CORS needed).
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    const htmlPath = path.join(__dirname, 'index.html');
    try {
      const html = fs.readFileSync(htmlPath);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (_) {
      return sendJson(res, 500, { ok: false, error: 'index.html not found next to server.js' });
    }
  }

  // Health check — lets the frontend verify the proxy is up & key is set.
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, keyConfigured: !!API_KEY, model: MODEL });
  }

  // Main ask endpoint.
  if (req.method === 'POST' && url.pathname === '/api/ask') {
    if (!API_KEY) {
      return sendJson(res, 503, {
        ok: false,
        error: 'GEMINI_API_KEY is not configured on the server. Set the env var and restart.',
      });
    }
    let body = '';
    for await (const chunk of req) body += chunk;
    let input;
    try { input = JSON.parse(body || '{}'); } catch (_) {
      return sendJson(res, 400, { ok: false, error: 'Invalid JSON body.' });
    }
    const subject = String(input.subject || 'General');
    const grade = String(input.grade || 'High School');
    const question = String(input.question || '').trim();
    if (!question) return sendJson(res, 400, { ok: false, error: 'Question is empty.' });

    const prompt = buildSystemPrompt(subject, grade) + '\n\nStudent question:\n' + question;
    try {
      const text = await callGemini(prompt);
      const { answer, flashcard } = parseFlashcard(text);
      return sendJson(res, 200, { ok: true, answer, flashcard, subject, grade });
    } catch (err) {
      console.error('[ask]', err && err.message);
      return sendJson(res, 500, { ok: false, error: (err && err.message) || 'Upstream error' });
    }
  }

  return sendJson(res, 404, { ok: false, error: 'Not found. Use POST /api/ask or GET /api/health' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log();
  console.log();
  console.log(API_KEY ? '  Gemini API key: configured ✓' : '  Gemini API key: MISSING — set GEMINI_API_KEY');
});