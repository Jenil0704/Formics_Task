
## 🗓️ Calendar Management Web App

A modern, full-featured calendar management application built with Next.js, TypeScript, and React, designed to help users create, manage, and export events with ease. This project supports one-time and recurring events, drag-and-drop calendar interactions, and seamless export functionality.


## Features

User Authentication
- Secure login using NextAuth.js with session management.

Event Management
- Create, update, and delete events.
- Support for one-time and recurring events (daily, weekly, monthly).
- Add event details: title, description, start/end dates, and recurrence rules.
  
Interactive Calendar
- Powered by FullCalendar for month/week/day views.
- Drag-and-drop and resizable events.
- Fully responsive for desktop and mobile screens.

Export Events
- Export calendar events to .ics files for use with other apps.
- Asynchronous and seamless user experience.

TypeScript & Modular Code
- Hooks like useExportEvents for reusable and maintainable code.
- Fully typed for better development experience and fewer runtime errors.


## Tech Stack

**Client:** React, Next.js, TailwindCSS

**Server:** Next.js API Routes, Node.js

**Database** SQLite with Prisma

**Authentication** NextAuth.js

**Calendar** FullCalendar.js

**Language** TypeScript


## 1. 🚀 Installation

Clone the repository

```bash
  git clone https://github.com/Jenil0704/Formics_Task/
  cd calendar-app
```
## 2. Install Dependencies
```bash
  npm install
```
## 3. Configure environment variables (.env):
```bash
  DATABASE_URL="your_database_url"
  NEXT_PUBLIC_BASE_URL="localhost_url"
  NEXTAUTH_URL="localhost_url"
  NEXTAUTH_SECRET="your_secret_key"
```

## 4. Run the development server:
```bash
  npm run dev
```

## 5. Open http://localhost:3000 in your browser.
## Screenshots

<img width="1919" height="979" alt="image" src="https://github.com/user-attachments/assets/47c21939-f757-499c-8627-5128faf81a5d" />

<img width="1919" height="981" alt="image" src="https://github.com/user-attachments/assets/e2702aca-b41b-4e52-9496-17b354b97199" />

<img width="1917" height="973" alt="image" src="https://github.com/user-attachments/assets/60658174-01d4-47f9-aaf6-ae23bc841e11" />

<img width="1809" height="977" alt="image" src="https://github.com/user-attachments/assets/df373114-a418-473a-9419-2d1ffbce7149" />

<img width="1919" height="973" alt="image" src="https://github.com/user-attachments/assets/dd5d8bf3-8cc3-4d0d-949b-a93f4baa409c" />





