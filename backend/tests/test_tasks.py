"""Task CRUD API 테스트 — 정상·400·404 케이스"""


def test_create_task_success(client):
    response = client.post("/api/tasks", json={"title": "디자인 검토"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "디자인 검토"
    assert data["status"] == "todo"
    assert "description" in data
    assert "id" in data


def test_create_task_with_all_fields(client):
    response = client.post(
        "/api/tasks",
        json={
            "title": "스프린트 회의",
            "description": "월요일 오전 10시",
            "status": "in_progress",
            "due_at": "2026-05-12T18:00:00Z",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "in_progress"
    assert data["due_at"] is not None


def test_create_task_missing_title_400(client):
    response = client.post("/api/tasks", json={"status": "todo"})
    assert response.status_code == 422  # FastAPI Pydantic 검증 오류


def test_create_task_blank_title_400(client):
    response = client.post("/api/tasks", json={"title": "   "})
    assert response.status_code == 422


def test_create_task_title_too_long_400(client):
    response = client.post("/api/tasks", json={"title": "a" * 201})
    assert response.status_code == 422


def test_create_task_invalid_status_400(client):
    response = client.post("/api/tasks", json={"title": "테스트", "status": "invalid"})
    assert response.status_code == 422


def test_list_tasks_success(client):
    client.post("/api/tasks", json={"title": "태스크 1"})
    client.post("/api/tasks", json={"title": "태스크 2"})
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # 목록 응답에 description 없음
    assert "description" not in data[0]


def test_list_tasks_sorted_desc(client):
    client.post("/api/tasks", json={"title": "먼저 생성"})
    client.post("/api/tasks", json={"title": "나중에 생성"})
    response = client.get("/api/tasks")
    assert response.json()[0]["title"] == "나중에 생성"


def test_get_task_success(client):
    created = client.post("/api/tasks", json={"title": "단건 조회", "description": "설명"}).json()
    response = client.get(f"/api/tasks/{created['id']}")
    assert response.status_code == 200
    data = response.json()
    # 단건 응답에 description 포함
    assert data["description"] == "설명"


def test_get_task_not_found_404(client):
    response = client.get("/api/tasks/9999")
    assert response.status_code == 404


def test_update_task_partial(client):
    created = client.post("/api/tasks", json={"title": "원래 제목"}).json()
    response = client.put(f"/api/tasks/{created['id']}", json={"status": "done"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
    assert data["title"] == "원래 제목"  # 기존 값 유지 확인


def test_update_task_not_found_404(client):
    response = client.put("/api/tasks/9999", json={"status": "done"})
    assert response.status_code == 404


def test_delete_task_success(client):
    created = client.post("/api/tasks", json={"title": "삭제할 태스크"}).json()
    response = client.delete(f"/api/tasks/{created['id']}")
    assert response.status_code == 204
    # 삭제 후 조회 시 404
    assert client.get(f"/api/tasks/{created['id']}").status_code == 404


def test_delete_task_not_found_404(client):
    response = client.delete("/api/tasks/9999")
    assert response.status_code == 404
