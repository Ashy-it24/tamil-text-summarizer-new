Tamil Text Summarizer (Web Application)

A web-based application designed to summarize Tamil language text efficiently using modern web technologies.
This project focuses on providing a clean, fast, and accessible interface for Tamil text summarization, built with a modern frontend stack and a scalable backend powered by Supabase.

Table of Contents

Overview

Tech Stack

Key Features

Prerequisites

Installation & Setup

Running the Project Locally

Build & Deployment

Environment Variables

Project Structure

Common Issues & Fixes

Overview

Tamil content available online is often lengthy and difficult to process quickly. This project aims to address that problem by providing a simple web interface where users can input Tamil text and receive a concise summary.

The application is built using React and TypeScript, with Supabase used for backend services such as APIs and serverless functions.

Tech Stack
Frontend

React – Component-based UI development

TypeScript – Type safety and maintainable code

Vite – Fast development server and build tool

Tailwind CSS – Utility-first styling framework

Lucide React – Icon library

Backend & Services

Supabase

PostgreSQL database

REST APIs

Edge Functions (serverless)

Authentication support (optional)

Development Tools

ESLint – Code quality checks

PostCSS & Autoprefixer – CSS processing

Key Features

Tamil text summarization through a clean UI

Fast response using Supabase Edge Functions

Fully responsive design (desktop & mobile)

TypeScript-based implementation for reliability

Easy deployment using Vercel

Prerequisites

Ensure the following are installed before running the project:

Node.js (v18 or above)

npm

Git

Supabase account

Vercel account (for deployment)

Installation & Setup
1. Clone the Repository
git clone https://github.com/Ashy-it24/tamil-text-summarizer-new
cd tamil-text-summarizer-new

2. Install Dependencies
npm install

3. Configure Environment Variables

Create a .env.local file in the project root:

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key


You can find these values in the Supabase Dashboard → Settings → API.

Running the Project Locally

Start the development server:

npm run dev


The app will run at:

http://localhost:5173

Useful Commands
Command	Purpose
npm run dev	Start development server
npm run build	Create production build
npm run preview	Preview production build
npm run lint	Run ESLint
npm run typecheck	Validate TypeScript
Build & Deployment
Build for Production
npm run build


This generates optimized static files inside the dist/ directory.

Deploy on Vercel

Push the project to GitHub

Import the repository in Vercel

Add environment variables:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Deploy

Vercel automatically handles HTTPS and CI/CD.

Environment Variables
Variable	Description
VITE_SUPABASE_URL	Supabase project URL
VITE_SUPABASE_ANON_KEY	Public Supabase API key

⚠️ Do not commit .env.local to GitHub.

Project Structure
tamil-text-summarizer-new/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── supabase/
├── dist/
├── .env.local
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md

Common Issues & Fixes
Environment variables not detected

Restart the dev server after editing .env.local

Ensure variable names start with VITE_

Supabase connection errors

Check project URL and anon key

Ensure Supabase project is active

Verify keys are public (not service role keys)

Build failures
npm run typecheck
npm run lint


Fix reported issues before deployment.

Future Enhancements

Integrate advanced Tamil NLP models

Add extractive + abstractive summarization modes

Support document uploads (PDF, TXT)

Add user history and saved summaries

Improve summarization accuracy using ML models

License

This project is open-source. Refer to the LICENSE file for details.

Author

Developed as a learning and experimentation project focused on Tamil NLP and modern web development.
