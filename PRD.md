# La Cresta Scheduler — Product Requirements Document (PRD)
> Generated via the Intent-Based Building Framework | 7-Day AI App Blueprint

---

## App Overview

**App Name:** La Cresta Scheduler
**Purpose:** A bilingual (Spanish/English) session booking system for the annual "La Cresta de La Ola" conference. Attendees can view available time slots across 6 simultaneous rooms and book short 10-minute prophetic sessions across 3 conference days (Thursday, Friday, Saturday). Sessions run from 3:30 PM to 6:00 PM Costa Rica time.

---

## The One Thing

> A user must be able to see available time slots, select a room and time, fill in their details, and confirm their booking — entirely in Spanish — from their mobile phone.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend / Database | Firebase (Firestore + Auth) |
| Hosting | Vercel |
| Payments | N/A — free event |
| Email | Firebase + email service (e.g. SendGrid or Resend) |

---

## Core Features & Success Criteria

### 1. Mobile-Friendly Booking Interface
Users can book a session directly from their phone without creating an account.
**Success:** A user on a mobile device can complete a booking in under 2 minutes by entering:
- Full Name (required)
- Email Address (required)
- Phone Number (optional)
- Special Notes (optional)

---

### 2. Admin Dashboard with CRUD Operations
5–7 admins can log in and manage all bookings.
**Success:** Admins see a clear list/grid of all bookings organized by:
- **Room** (Rooms 1–6)
- **Day** (Thursday, Friday, Saturday)

Admins can Create, Read, Update, and Delete any booking from this view.

---

### 3. Duplicate Booking Validation
The system prevents a single person from booking more than one session.
**Success:** If a user's name OR email already exists in the system, they receive a clear message (in their selected language) explaining that only 1 session per person is allowed. Exception: families and married couples may book sequential slots and can request the same room.

---

### 4. Admin Authentication (Hidden Route)
Admins authenticate via a non-public route unknown to regular users.
**Success:** Admin login page is accessible only via a direct URL (not linked from public UI). Login requires email and password. Admins self-register before the app goes live. Non-authenticated users cannot access admin views.

---

### 5. Bilingual Email Reminders (Batch Scheduled)
Attendees receive a reminder email the evening before their session day.
**Success:** A scheduled job runs once per day:
- Wednesday evening → emails all Thursday attendees
- Thursday evening → emails all Friday attendees
- Friday evening → emails all Saturday attendees

Reminder email content (in Spanish and English) includes:
- Session date, time, and room number
- Reminder to arrive **10–15 minutes early** (sessions are only 10 minutes)
- **Church address** where the conference is held
- Suggestion to **record the session** and share it with their leaders

---

## Bilingual UI

- The entire application (public and admin) is available in **Spanish and English**
- **Default language: Spanish**
- Users can toggle to English via a language switcher in the UI
- All UI labels, error messages, confirmation screens, and emails must be translated

---

## Core User Flow

1. User sees a Facebook post about "prophetic rooms" that must be booked
2. User visits the La Cresta Scheduler website on their phone
3. User sees available time slots, defaulting to Spanish UI
4. User selects a **day** from a dropdown (Thursday / Friday / Saturday)
5. Available room + time slot combinations are displayed (fully booked slots are **hidden**, not disabled)
6. User taps an available slot → booking form appears
7. User fills in Name, Email, Phone (optional), Notes (optional)
8. System runs duplicate validation (name + email check)
   - If duplicate found → friendly error message shown, booking blocked
   - If clear → booking is confirmed
9. Confirmation email sent immediately in Spanish (and English if toggled)
10. Reminder email sent the evening before their session day via scheduled batch job

---

## Out of Scope for V1

- ❌ Progressive Web App (PWA) features — browser-only
- ❌ Payment processing — this is a free event
- ❌ User self-service rescheduling or cancellation
- ❌ Analytics dashboards or reporting
- ❌ Waitlist functionality
- ❌ User accounts / login for attendees

---

## Version 2 Ideas

- Self-service rescheduling and cancellation for attendees
- Analytics dashboard for admins (booking trends, room utilization)
- PWA support for offline/add-to-home-screen experience
- Waitlist for fully booked slots
- SMS reminders in addition to email
- QR code check-in at the event

---

## Session Schedule Reference

| Detail | Value |
|---|---|
| Conference Days | Thursday, Friday, Saturday |
| Session Duration | 10 minutes |
| Session Window | 3:30 PM – 6:00 PM (Costa Rica time) |
| Slots per Room per Day | 15 slots |
| Simultaneous Rooms | 6 |
| Total Slots per Day | 90 |
| Total Slots (all 3 days) | 270 |

---

*PRD generated using the Intent-Based Building Framework — 7-Day AI App Blueprint*
