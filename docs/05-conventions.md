# 05. Conventions — TaskFlow Pro

## 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 백엔드 변수·함수·파일 | `snake_case` | `task_id`, `get_task_list`, `task_router.py` |
| 프론트엔드 변수·함수 | `camelCase` | `taskId`, `getTaskList`, `fetchTasks()` |
| 컴포넌트·클래스 | `PascalCase` | `TaskCard`, `ModalDialog`, `TaskService` |
| DB 테이블·컬럼 | `snake_case` | `tasks`, `due_at`, `created_at` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_TITLE_LENGTH`, `POLL_INTERVAL_MS` |
| CSS 클래스 | Tailwind 유틸리티 | `rounded-xl`, `shadow-lg`, `dark:bg-gray-900` |

### 언어 원칙

- **식별자는 영어**: 변수명, 함수명, 클래스명, 파일명, 브랜치명 모두 영어
- **주석은 한국어**: 코드 내 모든 주석(`#`, `//`, `/* */`)은 한국어로 작성
- **약어 금지**: `tmp`, `btn`, `usr` 대신 `temp`, `button`, `user` 사용

---

## 금지 목록

| 금지 | 이유 | 대안 |
|------|------|------|
| `print()` 디버깅 | 운영 환경 노이즈, 민감 정보 노출 위험 | `logging` 모듈 사용 (`logger.debug()`, `logger.info()`) |
| `bare except` (`except:`) | 모든 예외를 삼켜 디버깅 불가, 시스템 종료 신호도 차단 | `except SpecificError as e:` 로 예외 종류 명시 |
| 비밀번호·토큰 하드코딩 | 버전 관리에 노출 시 보안 사고, 복구 불가 | `.env` 파일 + `os.getenv()` 사용, `.env`는 `.gitignore` 등록 |
| TypeScript `any` 타입 | 타입 검사 우회로 런타임 오류 발생, 정적 분석 의미 상실 | 명시적 타입 또는 `unknown` + 타입 가드 사용 |
| CSS `!important` | 우선순위 체계 붕괴, 유지보수 시 디버깅 불가 | 셀렉터 구체성(specificity) 개선 또는 Tailwind 클래스 순서 조정 |

---

## 테스트 규칙

- **프레임워크**: `pytest`
- **위치**: `backend/tests/` 폴더, 파일명 `test_*.py`
- **필수 케이스**: 모든 API 엔드포인트에 대해 아래 케이스를 반드시 작성한다

| 케이스 | 설명 |
|--------|------|
| 정상 케이스 | 올바른 입력 → 기대 상태 코드·응답 본문 검증 |
| 400 케이스 | 필수 필드 누락, 형식 위반 입력 → 400 응답 검증 |
| 404 케이스 | 존재하지 않는 id 조회·수정·삭제 → 404 응답 검증 |

- 테스트 없이 구현 완료를 선언하지 않는다 (절대 규칙 3번).
- 테스트용 DB는 인메모리 SQLite(`sqlite:///:memory:`)를 사용해 운영 DB와 격리한다.

---

## Git 커밋 규칙

### 형식

```
<type>: <한국어 요약>
```

### 타입 목록

| 타입 | 사용 시점 | 예시 |
|------|----------|------|
| `feat` | 새 기능 추가 | `feat: 태스크 생성 API 구현` |
| `fix` | 버그 수정 | `fix: due_at 빈 문자열 400 미반환 버그 수정` |
| `docs` | 문서 작성·수정 | `docs: 04-tasks.md MVP 체크리스트 추가` |
| `refactor` | 동작 변경 없는 코드 개선 | `refactor: task 조회 로직 함수 분리` |
| `test` | 테스트 코드 추가·수정 | `test: 태스크 삭제 404 케이스 추가` |
| `chore` | 빌드·설정·의존성 변경 | `chore: requirements.txt 버전 고정` |

### 규칙

- 요약은 **한국어**, 50자 이내
- 현재 시제 명령형 (`추가`, `수정`, `구현`, `삭제`)
- 마침표 없음
- 한 커밋에 하나의 논리적 변경만 포함

---

## 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 항상 동작하는 상태 유지, 직접 푸시 금지 (MVP 기간 예외) |
| `feat/<기능명>` | 새 기능 개발 (예: `feat/task-crud-api`) |
| `fix/<버그명>` | 버그 수정 (예: `fix/due-at-validation`) |

---

## 폴더 구조 원칙

- `docs/02-specs.md` 에 정의된 구조를 따른다.
- 임의 추가·삭제·이동 금지. 변경 필요 시 사용자 승인 후 `02-specs.md` 먼저 수정.
