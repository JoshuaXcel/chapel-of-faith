import math
import time
from collections import deque
from threading import Lock

from fastapi import HTTPException, Request, status

# A small "too many tries" counter kept in memory.
# For each key (for example "ip + email") we remember when the last attempts happened.
# Once a key has max_attempts inside the window, it is blocked until the oldest one
# is older than the window.
# Good to know: the counts live in this one Python process. They reset when the server
# restarts, and if you run several worker processes each one counts on its own.
class RateLimiter:
    def __init__(self, max_attempts: int, window_seconds: int, clock=time.monotonic):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.clock = clock  # the tests swap this for a fake clock
        self.attempts: dict[str, deque] = {}
        self.lock = Lock()  # FastAPI runs normal "def" routes in several threads at once

    def _forget_old(self, key: str, now: float) -> deque:
        times = self.attempts.get(key, deque())
        while times and now - times[0] >= self.window_seconds:
            times.popleft()
        return times

    # seconds until the key may try again, or 0 if it isn't blocked
    def retry_after(self, key: str) -> int:
        with self.lock:
            now = self.clock()
            times = self._forget_old(key, now)
            if not times:
                self.attempts.pop(key, None)
            if len(times) < self.max_attempts:
                return 0
            return max(1, math.ceil(self.window_seconds - (now - times[0])))

    def hit(self, key: str) -> None:
        with self.lock:
            now = self.clock()
            times = self._forget_old(key, now)
            times.append(now)
            self.attempts[key] = times
            # don't let the memory grow forever: now and then drop keys with no recent attempts
            if len(self.attempts) > 10_000:
                for old_key in list(self.attempts):
                    if not self._forget_old(old_key, now):
                        del self.attempts[old_key]

    def reset(self, key: str) -> None:
        with self.lock:
            self.attempts.pop(key, None)

    def clear(self) -> None:
        with self.lock:
            self.attempts.clear()

# login: 5 wrong passwords for the same email from the same address, or 20 wrong
# passwords from one address in total (someone trying many emails), within 15 minutes
login_failures_per_email = RateLimiter(max_attempts=5, window_seconds=15 * 60)
login_failures_per_ip = RateLimiter(max_attempts=20, window_seconds=15 * 60)

# public membership form: 30 sign-ups per address in 10 minutes. That's generous on
# purpose, because a whole hall of students on the same campus Wi-Fi shares one address
member_signups_per_ip = RateLimiter(max_attempts=30, window_seconds=10 * 60)

def client_ip(request: Request) -> str:
    # behind a proxy (at deploy time) uvicorn must be started with --proxy-headers
    # and --forwarded-allow-ips, otherwise every visitor looks like the proxy's address
    return request.client.host if request.client else "unknown"

def too_many_requests(retry_after: int, message: str) -> HTTPException:
    minutes = math.ceil(retry_after / 60)
    unit = "minute" if minutes == 1 else "minutes"
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"{message} Please try again in {minutes} {unit}.",
        headers={"Retry-After": str(retry_after)},  # tells the browser how many seconds to wait
    )
