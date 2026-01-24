# DayWise

AI-powered daily task planner built with Next.js, Firebase, and Gemini.

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+
- A Firebase project with Firestore enabled
- Gemini API enabled (Firebase AI Logic SDK)

## Environment variables

Create a `.env.local` file in the project root:

```
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Gemini API (Firebase AI Logic SDK)
GOOGLE_GENAI_API_KEY=...
```

Notes:
- Firebase config values come from Firebase Console → Project settings.
- Gemini API key comes from the Firebase AI Logic SDK setup.

## Install dependencies

```
npm install
```

## Run locally

```
npm run dev
```

App runs at `http://localhost:9002`.

## Build and start

```
npm run build
npm run start
```

## Features

- Firebase Firestore CRUD for tasks
- AI schedule generation and rescheduling via Gemini (Firebase AI Logic SDK)
- Light/Dark theme with system preference
- React Toastify notifications

## Troubleshooting

- If tasks fail to save, confirm Firebase env vars are set.
- If AI calls fail, confirm `GOOGLE_GENAI_API_KEY` and AI Logic is enabled.
- If UI looks off, clear `.next` and restart:
  ```
  rm -rf .next
  npm run dev
  ```
