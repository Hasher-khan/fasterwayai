const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Load system prompt instructions
function getSystemPrompt() {
  const promptPath = path.join(__dirname, 'systemprompt');
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, 'utf-8');
  }
  return `You are fasterwayai, a professional English writing assistant that helps users write and improve emails.`;
}

// Helper to call Google Gemini API securely using backend key
async function callGeminiApi(systemInstructions, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('No API key found in server .env file.');
  }

  const models = [
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite'
  ];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstructions}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || response.statusText;
        console.warn(`[Gemini Model ${model}] Error (${response.status}): ${errMsg}`);
        lastError = new Error(errMsg);
        continue;
      }

      const data = await response.json();
      let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini API returned an empty response.');
      }

      // Clean markdown fences if returned
      rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

      return JSON.parse(rawText);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model API requests failed.');
}

// API Health Check & Config
app.get('/api/config', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'online',
    brand: 'fasterway.ai',
    aiEngineActive: hasKey,
    apiKeyConfigured: hasKey ? 'Key ending in ...' + process.env.GEMINI_API_KEY.slice(-6) : 'Not configured'
  });
});

// REAL-TIME EMAIL GENERATION API
app.post('/api/generate-email', async (req, res) => {
  try {
    const { senderName, recipientName, purpose, audience, tone, length, details, customPrompt } = req.body;

    const emailPurpose = purpose || customPrompt;
    if (!emailPurpose) {
      return res.status(400).json({ error: 'Please enter an Email Purpose or Custom AI Prompt.' });
    }

    const systemInstructions = `${getSystemPrompt()}

IMPORTANT NAME & PROMPT RULES:
1. Sender Name: ${senderName ? `The email MUST be signed off with "${senderName}". Do NOT use [Your Name].` : 'Use a short placeholder like [Your Name] only if sender name is missing.'}
2. Recipient Name: ${recipientName ? `Address the email greeting specifically to "${recipientName}". Do NOT use [Recipient Name].` : 'Address appropriately or use a placeholder if recipient name is missing.'}
3. If custom prompt instructions are provided, prioritize them.

Return ONLY a valid JSON object matching this exact schema:
{
  "subject": "Clear and concise email subject",
  "email": "Complete email with greeting, body, call to action, and sign-off",
  "notes": ["Only include a note if a necessary placeholder or assumption was used."],
  "alternatives": {
    "subjectLines": ["Alternative subject line 1", "Alternative subject line 2"]
  }
}`;

    const userPrompt = `
EMAIL GENERATION REQUEST:
- Sender Name: ${senderName || 'Not specified'}
- Recipient Name: ${recipientName || 'Not specified'}
- Primary Purpose/Topic: ${emailPurpose}
- Target Audience/Company: ${audience || 'General Recipient'}
- Requested Tone: ${tone || 'professional'}
- Requested Length: ${length || 'standard'}
- Custom AI Instructions / Context: ${customPrompt || details || 'None'}
`;

    console.log(`[AI Email Request] Sender: "${senderName}" | Recipient: "${recipientName}" | Purpose: "${emailPurpose}"`);
    const aiResult = await callGeminiApi(systemInstructions, userPrompt);
    res.json(aiResult);

  } catch (error) {
    console.error('[AI Email Error]', error.message);
    res.status(500).json({
      error: `Real-time AI Generation Failed: ${error.message}`,
      fallbackNotice: 'Check that your GEMINI_API_KEY in .env is valid.'
    });
  }
});

// REAL-TIME GRAMMAR & TONE CHECKER API
app.post('/api/check-grammar', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text content to check is required.' });
    }

    const systemInstructions = `${getSystemPrompt()}

IMPORTANT INSTRUCTION:
Return ONLY a valid JSON object matching this exact schema:
{
  "summary": "Supportive one- or two-sentence assessment.",
  "correctedText": "The corrected and improved version of the user's text.",
  "tone": {
    "detected": "Detected tone",
    "assessment": "Brief, helpful tone assessment",
    "suggested": "Optional improved tone"
  },
  "suggestions": [
    {
      "category": "grammar | spelling | punctuation | clarity | tone | conciseness",
      "original": "Original wording",
      "replacement": "Suggested wording",
      "reason": "Short plain-language explanation",
      "priority": "high | medium | low"
    }
  ]
}`;

    const userPrompt = `
GRAMMAR CHECKER REQUEST:
Review and correct the following text:
"""
${text}
"""
`;

    console.log(`[AI Grammar Request] Analyzing ${text.length} characters.`);
    const aiResult = await callGeminiApi(systemInstructions, userPrompt);
    res.json(aiResult);

  } catch (error) {
    console.error('[AI Grammar Error]', error.message);
    res.status(500).json({
      error: `Real-time Grammar Check Failed: ${error.message}`,
      fallbackNotice: 'Check that your GEMINI_API_KEY in .env is valid.'
    });
  }
});

// Fallback Route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`=================================================`);
    console.log(`🚀 fasterwayai AI Server running on http://localhost:${port}`);
    console.log(`🔑 Real-Time AI Backend active with .env key`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

// Export app for Vercel Serverless Function deployment
module.exports = app;

// Firebase Hosting rewrites /api requests to this handler. The Gemini key is
// provided by Firebase Secret Manager and is never sent to the browser.
try {
  const firebaseFunctions = require('firebase-functions');
  module.exports.api = firebaseFunctions
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .https.onRequest(app);
} catch (error) {
  // Keep `npm start` usable before Firebase dependencies are installed.
  module.exports.api = app;
}

// Run standalone server when executing locally
if (require.main === module && !process.env.VERCEL) {
  startServer(PORT);
}
