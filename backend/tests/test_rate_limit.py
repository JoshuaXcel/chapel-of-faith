from app.rate_limit import RateLimiter


class FakeClock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


def test_not_blocked_below_the_limit():
    limiter = RateLimiter(max_attempts=3, window_seconds=60, clock=FakeClock())
    limiter.hit("a")
    limiter.hit("a")

    assert limiter.retry_after("a") == 0


def test_blocked_at_the_limit_with_seconds_to_wait():
    clock = FakeClock()
    limiter = RateLimiter(max_attempts=3, window_seconds=60, clock=clock)
    for _ in range(3):
        limiter.hit("a")
    clock.now = 20

    assert limiter.retry_after("a") == 40


def test_old_attempts_are_forgotten_after_the_window():
    clock = FakeClock()
    limiter = RateLimiter(max_attempts=3, window_seconds=60, clock=clock)
    for _ in range(3):
        limiter.hit("a")
    clock.now = 60

    assert limiter.retry_after("a") == 0


def test_keys_are_counted_separately():
    limiter = RateLimiter(max_attempts=1, window_seconds=60, clock=FakeClock())
    limiter.hit("a")

    assert limiter.retry_after("a") > 0
    assert limiter.retry_after("b") == 0


def test_reset_clears_one_key():
    limiter = RateLimiter(max_attempts=1, window_seconds=60, clock=FakeClock())
    limiter.hit("a")
    limiter.reset("a")

    assert limiter.retry_after("a") == 0


def test_memory_is_cleaned_up_when_there_are_many_keys():
    clock = FakeClock()
    limiter = RateLimiter(max_attempts=5, window_seconds=60, clock=clock)
    for number in range(10_001):
        limiter.hit(f"old-{number}")
    clock.now = 120
    limiter.hit("new")

    assert list(limiter.attempts) == ["new"]
