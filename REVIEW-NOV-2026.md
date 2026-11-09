# Chapel of Faith website: review and fixes (November 2026)

Prepared for Joshua Mudana. Repo: JoshuaXcel/chapel-of-faith.

## What was checked

- Starting point: the Home and CYF update, pull request 23. Its last commit is e39b434. That pull request has already been merged into main (main is now 3b5636d, and its files are identical to e39b434). Every finding below applies to both, unless marked otherwise.
- Backend automated tests: 328 passed, 0 failed, on e39b434 and on main. On the backend fix branch: 330 passed, 0 failed.
- Database migrations: one head (e0ef0a74364a). Upgrade to the latest, downgrade to empty, and upgrade again all ran cleanly on a throwaway local Postgres. The models match the migrations.
- Routes: 32 routes checked. Every admin write and admin read was refused without a login (401). Public reads returned 200. An empty membership form was refused (422).
- Frontend automated tests: 41 passed in 13 files before the fixes, 48 passed in 16 files after. Lint: 0 errors, 0 warnings. Production build: clean.
- Browser check at 1280 px and 390 px: 13 public pages and 7 admin pages. No sideways scrolling, no page errors, and the keyboard focus outline shows on the header links.
- Links: the Facebook and YouTube links open their pages. The Instagram link answered "too many requests" to the checker, which is a rate limit, not a dead link. Please open it yourself once.
- Photos: all 11 photos are under 250 KB and none is wider than 1600 px.
- Text: every public page was read. No typos, no "lorem" text, no broken anchors found.

## Findings and fixes

### 1. Counselling booking card: two grey notes are invisible (white on white)

- Where: Ministries page, "Book a session" card. The lines "The Chaplaincy will confirm your slot." and "If you are in danger right now, contact campus security or the FUTA Health Centre." are white on the white card, so visitors cannot see them.
- Why: the card sits inside a dark section, and the dark section's "muted text" colour carried into the white card.
- How to see it: open /ministries on a laptop or a phone and scroll to Counselling. Before the fix the two lines are not visible. The measured contrast was 1 to 1.
- Fix: the card's grey notes use the normal grey. Measured contrast is now about 5.6 to 1 on the white card.
- Commit on fix/site-review-nov-2026: "Make the counselling form notes readable on the white card".
- Applies to: main and the pull request 23 head.

### 2. Phone menu: Escape did nothing, and keyboard focus stayed behind the menu

- Where: the menu button and the full-screen phone menu (Navbar.jsx, MobileMenu.jsx).
- How to see it: at 390 px, open the menu and press Escape. The menu stays open. Keyboard focus moves into the page behind it.
- Fix: Escape closes the menu. Focus moves to the close button when the menu opens, and back to the menu button when it closes. Touch and mouse behaviour is unchanged.
- Commit on fix/site-review-nov-2026: "Phone menu: close on Escape and move focus in and back out".
- Applies to: main and the pull request 23 head.

### 3. A photo that failed once stayed as a grey placeholder for the next item

- Where: the shared photo box (Photo.jsx), used for event banners, leader photos and gallery photos.
- How to see it: open an event whose picture link is broken, then open another event with a working picture without reloading the page. The second event shows the grey placeholder instead of its picture.
- Fix: the box remembers which picture address failed, so a different address gets its own try.
- Commit on fix/site-review-nov-2026: "Let a photo box show a new picture after its first one failed".
- Applies to: main and the pull request 23 head.

### 4. "Today's devotion" used the visitor's device clock, not the church's

- Where: format.js, the "today" helper used by the devotion pages.
- How to see it: a visitor in New York at 11:30 pm on 8 November (5:30 am on 9 November in Lagos) is shown the 8 November devotion as today's, and the 9 November devotion is hidden. The backend already uses Lagos time.
- Fix: "today" is the Africa/Lagos date.
- Commit on fix/site-review-nov-2026: "Use the Lagos date for today's devotion, not the visitor's clock".
- Applies to: main and the pull request 23 head.

### 5. Events disappear the moment they start (backend)

- Where: backend/app/routers/events.py, the events list.
- How to see it: an event from 9:00 to 12:00 vanishes from the Events list at 9:00, while it is still running.
- Fix: the list keeps an event until its end time has passed (an event with no end time drops off at its start, as before). A new test, backend/tests/test_events_in_progress.py, failed before the fix and passes now.
- Commit on fix/backend-review-nov-2026: "Keep an event on the events list until it ends".
- If you would rather an event drops off at its start time, say so and I will take this change out.

## Not changed, and why

- "To be added" placeholders are visible to visitors. The Contact page shows "To be added" for email, phone and WhatsApp (those details are empty in src/siteInfo.js). The Give page shows "To be added" for the bank name and the account number (pages/Give.jsx). Needs your details.
- Admin default password "CHANGE_ME": not found. I searched the current code, every branch and the full commit history for it, with no match. The code creates no default admin; admin accounts are added by hand. Nothing to change in the repo. Please check the live admin list. If any account still has a placeholder password, change it. No live database or login was touched.
- CYF card, photo 5 (cyf-05.jpg): one young man stands in the front of the frame, facing the camera, with a crowd behind him. It is not a close-up of a child. I cannot tell his age from the picture, so please confirm he is an adult and agreed to be shown, or swap the photo. Not changed, because it is a decision about a real person.
- Men's Day photo and the old CYF choir photo: the credit note says both were taken off the CYF card in e39b434, and neither is on the CYF card now. The choir in robes is still on the Home hero slideshow (hero-04). Your call whether it stays.
- Booking, prayer request, devotion sign-up and contact forms are switched off on purpose ("coming soon"). Their greyed-out buttons measure 4.46 to 1 (the target is 4.5 to 1). Disabled controls are exempt from that rule, so nothing was changed.
- The admin login stores its sign-in token in the browser. Text on the site is escaped, so no script injection was found. Moving the token elsewhere is a larger design change, so it was not done.
- Login protection (too many wrong passwords) is counted in server memory. It resets when the server restarts. 20 wrong logins from one Wi-Fi address block that address for 15 minutes, which on a campus network can block many people. Your call whether to change the limit.
- The membership form checks the phone number only for length, not for format.
- Pull request 23 is already merged into main. Nothing is left to open for it.

## Branches

- Frontend: fix/site-review-nov-2026 (based on the pull request 23 head, e39b434). Contains findings 1 to 4 and this file.
- Backend: fix/backend-review-nov-2026 (based on main, 3b5636d). Contains finding 5 and a short backend note.
- Nothing has been merged. main has not been changed.
