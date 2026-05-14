# 04. Tasks — TaskFlow Pro MVP

## 진행 규칙

- **순서 엄수**: 각 단계는 반드시 순서대로 진행한다. 앞 단계 검증이 통과하기 전에 다음 단계를 시작하지 않는다.
- **병렬 금지**: 여러 단계를 동시에 진행하지 않는다.
- **단계별 검증 필수**: 각 단계 완료 후 '검증 방법' 항목을 직접 실행해 통과를 확인한다.
- **확장 단계 제외**: 이 문서는 MVP 3개 Phase만 다룬다. JWT 로그인, Kanban 등 확장 기능은 별도 문서에서 관리한다.

---

## Phase 1 — 설계 `✅ 완료`

> CLAUDE.md와 docs/ 6개 문서 작성으로 프로젝트 기반 확립

| # | 작업 | 산출물 | 검증 방법 |
|---|------|--------|----------|
| 1-01 | 로컬 git 저장소 초기화 및 GitHub 원격 연결 | `.git/`, `origin` remote | `git remote -v` 출력 확인 |
| 1-02 | 빈 `CLAUDE.md` 커밋·푸시 | `CLAUDE.md` (빈 파일) | GitHub 저장소에서 파일 존재 확인 |
| 1-03 | `CLAUDE.md` 본문 작성 (역할·규칙·모호한 요청 처리) | `CLAUDE.md` (내용 완성) | 절대 규칙 5개·모호한 요청 형식 포함 여부 육안 확인 |
| 1-04 | `docs/` 폴더 생성 및 빈 파일 6개 커밋 | `docs/00~05-*.md` | `git ls-files docs/` 로 6개 파일 확인 |
| 1-05 | `docs/00-overview.md` 작성 | 문서 지도·읽는 순서·분리 철학 | 파일 내 6개 파일 매핑표 존재 확인 |
| 1-06 | `docs/01-product.md` 작성 | 페르소나·MVP 범위·성공 기준 | 성공 기준 6개 항목 존재 확인 |
| 1-07 | `docs/02-specs.md` 작성 | Task 모델·API 5개·화면 명세 | API 엔드포인트 5개·검증 규칙 존재 확인 |
| 1-08 | `docs/03-design.md` 작성 | 설계 결정 8선·디자인 토큰·의존성 정책 | 8개 행 표 존재·의존성 정책 섹션 존재 확인 |
| 1-09 | `docs/04-tasks.md` 작성 | Phase 1~3 체크리스트 | Phase별 단계 수(10·10·8) 확인 |
| 1-10 | `docs/05-conventions.md` 작성 | 코딩 컨벤션·커밋 형식·브랜치 전략 | 커밋 메시지 형식·브랜치 네이밍 규칙 존재 확인 |

---

## Phase 2 — 백엔드 `✅ 완료`

> FastAPI로 Task CRUD API 5개 구현 및 Swagger 동작 확인

| # | 작업 | 산출물 | 검증 방법 |
|---|------|--------|----------|
| 2-01 | `backend/` 폴더 구조 생성 및 Python 가상환경 설정 | `backend/`, `venv/`, `requirements.txt` | `python -m uvicorn --version` 정상 출력 |
| 2-02 | FastAPI·Uvicorn·SQLAlchemy 의존성 설치 | `requirements.txt` (버전 고정) | `pip list` 에서 3개 패키지 확인 |
| 2-03 | SQLite DB 연결 및 SQLAlchemy `Task` 모델 정의 | `backend/models.py`, `taskflow.db` | `python -c "from models import Task"` 오류 없음 |
| 2-04 | Alembic 또는 `Base.metadata.create_all()` 로 테이블 생성 | DB에 `tasks` 테이블 생성 | SQLite 파일 열어 `tasks` 테이블 스키마 확인 |
| 2-05 | `POST /api/tasks` 구현 | 태스크 생성 엔드포인트 | `curl -X POST` 로 201 응답·DB 저장 확인 |
| 2-06 | `GET /api/tasks` 구현 (목록, `description` 제외) | 태스크 목록 엔드포인트 | `curl GET` 로 200 응답·`description` 필드 미포함 확인 |
| 2-07 | `GET /api/tasks/:id` 구현 (단건, `description` 포함) | 태스크 단건 엔드포인트 | 존재하는 id → 200, 없는 id → 404 확인 |
| 2-08 | `PUT /api/tasks/:id` 구현 (부분 수정) | 태스크 수정 엔드포인트 | 일부 필드만 전송 시 나머지 필드 유지 확인 |
| 2-09 | `DELETE /api/tasks/:id` 구현 | 태스크 삭제 엔드포인트 | 삭제 후 204 응답·DB에서 레코드 제거 확인 |
| 2-10 | 유효성 검증 및 Swagger UI 확인 | 400·404 에러 핸들러 | `http://localhost:8000/docs` 에서 5개 엔드포인트 노출·title 누락 시 400 확인 |

---

## Phase 3 — 프론트엔드

> Vanilla JS + Tailwind CDN으로 메인 화면 구현 및 API 연결

| # | 작업 | 산출물 | 검증 방법 |
|---|------|--------|----------|
| 3-01 | `frontend/` 폴더 구조 생성 및 `index.html` 기본 틀 작성 | `frontend/index.html` (Tailwind CDN 포함) | 브라우저에서 열어 Tailwind 스타일 적용 확인 |
| 3-02 | 태스크 추가 폼 구현 (`title`, `due_at`, `status`) | 폼 UI | 필수 필드 미입력 시 브라우저 기본 검증 작동 확인 |
| 3-03 | 태스크 목록 카드 UI 구현 (status 배지 + D-N HH:MM) | 카드 컴포넌트 | 하드코딩 더미 데이터로 카드 3종(todo·in\_progress·done) 렌더링 확인 |
| 3-04 | 수정 모달 UI 구현 (카드 클릭 시 열림) | 모달 컴포넌트 | 카드 클릭 → 모달 열림, 배경 클릭 또는 취소 버튼 → 닫힘 확인 |
| 3-05 | 삭제 확인 다이얼로그 구현 (휴지통 아이콘 클릭) | 삭제 다이얼로그 | 휴지통 클릭 → 확인 다이얼로그, 취소 클릭 → 삭제 안 됨 확인 |
| 3-06 | 라이트/다크 테마 토글 구현 | 테마 버튼, `localStorage('theme')` | 토글 후 새로고침 시 테마 유지·`prefers-color-scheme` 초기값 적용 확인 |
| 3-07 | API 연결 (CRUD 4종 → FastAPI 호출) | `frontend/app.js` | 추가·수정·삭제 후 목록 즉시 갱신, 3초 폴링으로 타 탭 변경사항 반영 확인 |
| 3-08 | 360px 반응형 검증 및 최종 git push | 완성된 MVP | DevTools 360px 뷰 레이아웃 깨짐 없음·API 200ms 이내·성공 기준 6개 전항 통과 확인 |

---

## MVP 완료 기준 체크

`Phase 3-08` 완료 시점에 아래 6개 항목을 모두 통과해야 MVP 완료로 선언한다.

| 항목 | 검증 |
|------|------|
| 새로고침 후 데이터 유지 | DB 저장 확인 |
| 360px 레이아웃 깨짐 없음 | DevTools 360px 뷰 확인 |
| API 응답 200ms 이내 | 네트워크 탭 확인 |
| CRUD 4종 화면 동작 | 수동 E2E 시나리오 통과 |
| 테마 토글 + 새로고침 유지 | localStorage 값 확인 |
| due_at 시간 단위 저장·표시 | `2026-05-12 18:00` 형식 DB·화면 출력 확인 |
