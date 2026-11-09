# Chapel of Faith backend: review note (November 2026)

Branch: fix/backend-review-nov-2026, based on main (3b5636d).

## Checked

- Automated tests: 330 passed, 0 failed (328 before this branch, plus 2 new tests).
- Migrations: one head (e0ef0a74364a). Upgrade, downgrade to empty and upgrade again all ran cleanly on a throwaway local Postgres. Models match migrations.
- Routes: every admin write and read refuses requests without a login (401). Public reads return 200.

## Fixed on this branch

- Events list: an event disappeared the moment it started, even while it was still running. The list now keeps it until its end time. File: backend/app/routers/events.py. New tests: backend/tests/test_events_in_progress.py. The first test failed before the change and passes now.

## Open for you

- If you want an event to drop off at its start time instead, this change can be reverted.
