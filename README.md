# growfasting.ai - AI Email Generator & Real-Time Grammar Checker Engine

growfasting.ai is a professional, enterprise-grade AI email composition platform and real-time linguistic grammar auditor. Built for job seekers, students, sales executives, and business professionals, it empowers users to draft high-impact emails, audit grammar live, and securely store cloud history isolated per user UID.

---

## Key Features

- **Smart AI Email Generation**: Generates customized emails tailored by recipient role, intent, length, and writing tone (Professional, Formal, Warm, Concise, Persuasive, Apologetic, Confident, Neutral).
- **Real-Time Linguistic Audit**: Performs live spelling, syntax, clarity, and tone analysis with 1-click full auto-corrections.
- **Zero-Fact-Invention Guardrails**: Strict system prompt guardrails prevent AI hallucinations, fake attachments, or unverified metrics, keeping drafts 100% factual.
- **Per-UID Firebase Cloud Security**: Powered by Firebase Authentication and Firestore security rules to strictly isolate user drafts and history to their unique User ID (UID).
- **12+ Battle-Tested Templates**: Pre-configured templates covering Career, Sales, Networking, Customer Support, Academic requests, and General business communication.
- **Dark & Light (White) Theme Modes**: Built-in theme switcher supporting Dark Mode and Light Theme with automatic OS preference detection and local storage persistence.
- **Mobile-First Responsive Interface**: Clean glassmorphic design system featuring bottom navigation drawer for touch devices and responsive grid layouts for desktop screens.

---

## Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 / Tailwind CSS, Google Material Symbols
- **Backend**: Node.js, Express.js, Serverless HTTP
- **Database & Authentication**: Google Firebase Auth & Cloud Firestore
- **AI Model**: Google Gemini API (`gemini-3.6-flash`)
- **Deployment**: Configured for Vercel, Netlify, and Firebase Hosting

---

## Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/khan-project/GrowfastingAI.git
   cd GrowfastingAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the local development server:**
   ```bash
   npm start
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:3000` to view the application live.

---

## Project Structure

```text
GrowfastingAI/
├── api/                   # Serverless API endpoints
├── netlify/               # Netlify serverless functions
├── app.js                 # Frontend application & navigation logic
├── firebase-config.js     # Firebase authentication & Firestore client
├── index.html             # Main single-page application entry point
├── package.json           # Node.js project manifest & dependencies
├── server.js              # Express backend server & Gemini API integration
├── styles.css             # Utility CSS & Dark Mode theme overrides
├── systemprompt           # System prompt instructions & factual guardrails
├── firebase.json          # Firebase hosting configuration
├── netlify.toml           # Netlify build configuration
└── vercel.json            # Vercel deployment configuration
```

---

## Deployment Options

### Vercel
Deploy seamlessly using the Vercel CLI:
```bash
vercel
```

### Netlify
Build and deploy on Netlify:
```bash
netlify deploy --build
```

### Firebase Hosting
Deploy to Firebase:
```bash
firebase deploy
```

---

## License

This project is open-source and available under the [MIT License](LICENSE).
