import pytest

from app.main import app

# the only routes anyone may write to without logging in
PUBLIC_WRITE_ROUTES = {("POST", "/auth/login"), ("POST", "/members")}


# every route the API has, read from its OpenAPI description (the same list /docs shows)
def write_routes():
    for path, methods in app.openapi()["paths"].items():
        for method in methods:
            method = method.upper()
            if method in {"POST", "PATCH", "PUT", "DELETE"} and (method, path) not in PUBLIC_WRITE_ROUTES:
                yield method, path


# a safety net: if someone adds a new admin route and forgets the login check,
# this test fails
@pytest.mark.parametrize("method, path", sorted(write_routes()))
def test_every_write_route_needs_a_login(client, method, path):
    url = path.replace("{", "").replace("}", "")  # e.g. /events/event_id
    url = "/".join("1" if part.endswith("_id") else part for part in url.split("/"))

    response = client.request(method, url, json={})

    assert response.status_code == 401


def test_member_list_needs_a_login(client):
    assert client.get("/members").status_code == 401
