# 03. Design — TaskFlow Pro

## 설계 결정 8선

> 이 문서에 근거 없이 대안을 도입하는 것은 금지된다.
> 새로운 라이브러리·패키지 추가 전 반드시 이 문서에 사유를 먼저 기록하고 승인을 받는다.

---

| # | 항목 | **선택** | 대안 | 근거 | 트레이드오프 |
|---|------|---------|------|------|------------|
| 1 | 백엔드 프레임워크 | **FastAPI** | Django, Express | 타입 힌트 기반 자동 검증, 자동 생성 OpenAPI 문서, 비동기 지원, 학습 곡선 낮음 | Django 대비 ORM·Admin 미제공, Express 대비 Python 생태계로 JS 풀스택 불가 |
| 2 | 프론트엔드 | **Vanilla JS + Tailwind CDN** | React, Vue | 빌드 도구 없음, 즉시 실행, 의존성 0, MVP 규모에서 프레임워크 오버헤드 불필요 | 컴포넌트 재사용성 낮음, 상태 복잡도 증가 시 관리 부담 |
| 3 | 데이터베이스 | **SQLite → PostgreSQL + SQLAlchemy** | MySQL, MongoDB | 개발 단계는 SQLite로 설치 없이 시작, 운영 전환 시 PostgreSQL로 교체. SQLAlchemy로 DB 교체 비용 최소화 | SQLite는 동시 쓰기 제한, PostgreSQL 전환 시 마이그레이션 작업 필요 |
| 4 | CSS 방법론 | **Tailwind CSS만 사용** | styled-components, CSS Modules | 유틸리티 클래스로 일관성 확보, JS 번들에 CSS 미포함, CDN 한 줄로 도입. `styled-components` 사용 금지 | 클래스 나열로 HTML 가독성 저하, Tailwind 미숙 시 중복 클래스 발생 |
| 5 | 실시간 갱신 | **폴링 3초 (MVP)** | WebSocket, SSE | 구현 복잡도 최저, 별도 인프라 불필요, 10명 규모에서 3초 딜레이 허용 가능. WebSocket은 확장 단계로 보류 | 서버 요청 빈도 증가, 대규모 팀·고빈도 갱신 시 비효율 |
| 6 | 프론트 상태 관리 | **모듈 변수 + DOM 직접 갱신** | Redux, Zustand, Pinia | Vanilla JS 선택과 일관성 유지, 외부 상태 라이브러리 의존성 없음, 소규모 상태에 충분 | 상태 분산 시 디버깅 어려움, 화면 복잡도 증가 시 재설계 필요 |
| 7 | 디자인 시스템 | **macOS UI 톤** | Material Design, Ant Design | 목표 사용자(30~40대 팀리더) 친숙도 높음, 라이브러리 미설치로 번들 크기 최소화 | 디자인 토큰 직접 관리 필요, 컴포넌트 라이브러리 자동화 혜택 없음 |
| 8 | 테마 | **라이트/다크 토글** | 단일 테마 | 장시간 업무 환경에서 다크 모드 수요 높음, `localStorage('theme')` 저장으로 새로고침 유지, 초기값은 `prefers-color-scheme` 따름 | 모든 컴포넌트 다크 변형 별도 정의 필요 |

---

## 디자인 토큰

Tailwind 유틸리티 클래스로 아래 토큰을 일관되게 사용한다.

| 토큰 | Tailwind 클래스 | 용도 |
|------|----------------|------|
| 둥근 모서리 | `rounded-xl` | 카드, 버튼, 입력 필드 |
| 그림자 | `shadow-lg` | 카드, 모달 |
| 반투명 배경 | `backdrop-blur-md` + `bg-white/70` (라이트) / `bg-gray-900/70` (다크) | 카드 배경 |
| 시스템 폰트 | `font-sans` (Tailwind 기본값: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) | 전체 |
| 터치 타깃 | `min-h-[44px] min-w-[44px]` | 버튼, 아이콘 버튼 |

---

## 테마 구현 규칙

```
초기화 순서:
1. localStorage.getItem('theme') 값이 있으면 적용
2. 없으면 window.matchMedia('(prefers-color-scheme: dark)') 결과 적용
3. <html> 태그에 class="dark" 토글 방식 사용 (Tailwind dark 변형 활성화)
```

- 다크 모드 스타일은 Tailwind `dark:` 변형(`dark:bg-gray-900`, `dark:text-white` 등)으로만 정의한다.
- 테마 상태를 JS 변수에 중복 저장하지 않는다. `<html>` 클래스가 단일 진실 공급원(source of truth)이다.

---

## 의존성 추가 정책

새로운 라이브러리·패키지 도입 전 반드시 아래 절차를 따른다.

1. **이 문서(`03-design.md`)에 먼저 사유 기록**: 어떤 결정을 어떤 근거로 변경하는지 표에 추가한다.
2. **사용자 승인**: 기록 후 사용자의 명시적 승인을 받는다.
3. **설치**: 승인 후에만 `package.json`, `requirements.txt` 등을 수정한다.

승인 없이 임의로 의존성을 추가하는 것은 **절대 규칙 2번(돌발 의존성 금지)** 위반이다.
