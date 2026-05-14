# 02. Specs — TaskFlow Pro

## Task 모델

### 필드 정의

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | INTEGER | PK, AUTO INCREMENT | 고유 식별자 |
| `title` | VARCHAR(200) | NOT NULL | 태스크 제목 |
| `description` | TEXT | NULL 허용 | 상세 설명 |
| `status` | ENUM | NOT NULL, 기본값 `todo` | `todo` / `in_progress` / `done` |
| `due_at` | DATETIME | NULL 허용, UTC 저장 | 마감 시각 |
| `created_at` | DATETIME | NOT NULL, 자동 설정 | 생성 시각 (UTC) |
| `updated_at` | DATETIME | NOT NULL, 자동 갱신 | 수정 시각 (UTC) |

### 상태 전이

```
todo  →  in_progress  →  done
  ↑____________↑____________↓   (역방향도 허용)
```

---

## 유효성 검증

### 400 Bad Request — 형식 위반

| 조건 | 응답 |
|------|------|
| `title` 누락 또는 빈 문자열 | 400 |
| `title` 200자 초과 | 400 |
| `status` 허용값 외 입력 | 400 |
| `due_at` ISO 8601 형식 위반 | 400 |

`due_at` 허용 형식 예시:
```
2026-05-12T18:00:00Z          # UTC 명시
2026-05-12T18:00:00+09:00     # 오프셋 명시
2026-05-12T18:00:00           # 로컬 타임 (서버에서 UTC로 변환)
```

### 404 Not Found

| 조건 | 응답 |
|------|------|
| 존재하지 않는 `id` 조회·수정·삭제 | 404 |

---

## REST API

### 엔드포인트 목록

| 메서드 | 경로 | 상태 코드 | 설명 |
|--------|------|-----------|------|
| `POST` | `/api/tasks` | 201 | 태스크 생성 |
| `GET` | `/api/tasks` | 200 | 태스크 목록 조회 |
| `GET` | `/api/tasks/:id` | 200 | 태스크 단건 조회 |
| `PUT` | `/api/tasks/:id` | 200 | 태스크 수정 (부분 수정 허용) |
| `DELETE` | `/api/tasks/:id` | 204 | 태스크 삭제 |

---

### POST `/api/tasks` — 태스크 생성

**Request Body**
```json
{
  "title": "디자인 시안 검토",
  "description": "피그마 링크 확인 후 피드백 작성",
  "status": "todo",
  "due_at": "2026-05-12T18:00:00Z"
}
```

**Response 201**
```json
{
  "id": 1,
  "title": "디자인 시안 검토",
  "description": "피그마 링크 확인 후 피드백 작성",
  "status": "todo",
  "due_at": "2026-05-12T18:00:00Z",
  "created_at": "2026-05-14T09:00:00Z",
  "updated_at": "2026-05-14T09:00:00Z"
}
```

---

### GET `/api/tasks` — 목록 조회

- `description` 필드 **제외** (응답 크기 최소화)
- 기본 정렬: `created_at DESC`

**Response 200**
```json
[
  {
    "id": 1,
    "title": "디자인 시안 검토",
    "status": "todo",
    "due_at": "2026-05-12T18:00:00Z",
    "created_at": "2026-05-14T09:00:00Z",
    "updated_at": "2026-05-14T09:00:00Z"
  }
]
```

---

### GET `/api/tasks/:id` — 단건 조회

- `description` 필드 **포함**

**Response 200**
```json
{
  "id": 1,
  "title": "디자인 시안 검토",
  "description": "피그마 링크 확인 후 피드백 작성",
  "status": "todo",
  "due_at": "2026-05-12T18:00:00Z",
  "created_at": "2026-05-14T09:00:00Z",
  "updated_at": "2026-05-14T09:00:00Z"
}
```

---

### PUT `/api/tasks/:id` — 수정

- 보낸 필드만 수정 (부분 수정 허용)
- 보내지 않은 필드는 기존 값 유지

**Request Body** (예: 상태만 변경)
```json
{
  "status": "in_progress"
}
```

**Response 200** — 수정된 전체 객체 반환 (`description` 포함)
```json
{
  "id": 1,
  "title": "디자인 시안 검토",
  "description": "피그마 링크 확인 후 피드백 작성",
  "status": "in_progress",
  "due_at": "2026-05-12T18:00:00Z",
  "created_at": "2026-05-14T09:00:00Z",
  "updated_at": "2026-05-14T10:30:00Z"
}
```

---

### DELETE `/api/tasks/:id` — 삭제

**Response 204** — 응답 본문 없음

---

## 화면 명세 (CRUD 4종)

### 추가 — 태스크 생성 폼

- 항상 화면 상단 또는 사이드에 노출 (모달 불필요)
- 입력 필드:

| 필드 | UI 요소 | 필수 여부 |
|------|---------|----------|
| `title` | `<input type="text">` | 필수 |
| `due_at` | `<input type="datetime-local">` | 선택 |
| `status` | `<select>` (todo / in_progress / done) | 필수, 기본값 todo |

- 제출 시 `POST /api/tasks` 호출 → 성공 시 목록 즉시 갱신

---

### 목록 — 태스크 카드

- 각 태스크를 **카드** 형태로 표시
- 카드에 표시되는 정보:

| 요소 | 표시 내용 |
|------|----------|
| 제목 | `title` |
| 상태 배지 | `todo` · `in_progress` · `done` (색상 구분) |
| 마감 카운트다운 | `D-N HH:MM` 형식 (예: `D-3 18:00`) |
| 액션 버튼 | 수정 아이콘, 휴지통 아이콘 |

- `due_at` 없으면 마감 카운트다운 미표시
- 목록 조회: `GET /api/tasks`

---

### 수정 — 모달

- 카드 클릭 (또는 수정 아이콘 클릭) → 모달 열림
- 모달 내 필드: `title`, `description`, `due_at`, `status`
- 저장 버튼 클릭 시 `PUT /api/tasks/:id` 호출
- 성공 시 모달 닫힘 + 목록 즉시 갱신

---

### 삭제 — 확인 후 삭제

- 카드의 휴지통 아이콘 클릭 → 확인 다이얼로그 표시
  ```
  "이 태스크를 삭제할까요? 되돌릴 수 없습니다."
  [취소]  [삭제]
  ```
- [삭제] 클릭 시 `DELETE /api/tasks/:id` 호출
- 성공(204) 시 카드 목록에서 즉시 제거
