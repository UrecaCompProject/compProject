# 🪼 에피라 (Ephyra)

> ### AI 기반 통신 요금제 상담 · 가입 플랫폼
>
> 복잡한 통신 요금제, 대화만으로 비교하고 추천받고 가입까지 —
> AI 상담으로 완성하는 통신 생활 플랫폼

**에피라**는 사용자의 데이터 사용 패턴, 통화량, 문자 사용량, 예산, OTT 이용 성향 등을 AI 챗봇이 분석하여
**나에게 맞는 통신 요금제를 추천하고, 비교 · 저장 · 관리할 수 있도록 돕는 서비스**입니다.

단순한 요금제 추천을 넘어 출석, 미션, 게임, 배지, 상품 교환, 쿠폰 등의 **리워드 시스템**을 통해
사용자가 통신 생활을 더욱 재미있게 관리할 수 있는 플랫폼을 지향합니다. 🫧

> 단순한 요금제 비교를 넘어 **'상담 → 추천 → 가입 → 리워드'**의 흐름을 하나의 채팅 서비스로 연결합니다.

<br />

### ✨ Project Info

**프로젝트** : LG유플러스 유레카 프론트엔드 개발자 과정 종합프로젝트 (2026.08.14 ~ 09.04)

**팀명** : 비키니 시티

---

## 📖 목차

- [프로젝트 소개](#-프로젝트-소개)
- [기획 배경 및 해결책](#-기획-배경-및-해결책)
- [팀 구성](#-팀-구성)
- [서비스 구성](#-서비스-구성)
- [주요 기능](#-주요-기능)
- [기술 스택](#️-기술-스택)
- [시스템 구조](#-시스템-구조)
- [프로젝트 구조](#-프로젝트-구조)
- [페이지 구성](#️-페이지-구성)
- [화면 흐름도](#-화면-흐름도)
- [기술적 핵심 구현 사항](#-기술적-핵심-구현-사항)
- [트러블슈팅](#-트러블슈팅)
- [사전 준비](#-사전-준비)
- [환경변수 설정](#-환경변수-설정)
- [로컬 개발 시작](#-로컬-개발-시작)
- [사용 가능한 스크립트](#-사용-가능한-스크립트)
- [DB 마이그레이션 및 시드](#-db-마이그레이션-및-시드)
- [주요 포트](#-주요-포트)
- [배포](#-배포)
- [향후 계획](#-향후-계획)
- [개발 일정](#-개발-일정)

---

## 📖 프로젝트 소개

에피라는 통신사 요금제 가입을 위한 **AI 채팅 상담 서비스**입니다.

사용자가 데이터 사용량 · 통화량 · 예산 · 부가서비스 선호도를 채팅으로 입력하면, **OpenAI API**가 이를 분석해 최적의 요금제를 추천 사유·예상 절감액과 함께 제시합니다. 여기에 출석·미션·게임 등 참여형 리워드와 제휴 쿠폰 서비스를 더해, 단순 추천을 넘어 지속적으로 이용하고 싶은 통신 생활 플랫폼을 지향합니다.

<br/>

## 💡 기획 배경 및 해결책

- **Pain Point 1 — 복잡한 비교 기준**: 통신사 요금제는 수십 가지가 존재하고 데이터·통화량·부가서비스·약정 조건·할인 혜택 등 비교 항목이 많아, 사용자가 자신의 사용 패턴에 맞는 요금제를 스스로 찾기 어렵습니다.
- **Pain Point 2 — 높은 상담 진입장벽**: 전화·매장 상담은 대기 시간과 심리적 부담이 크고, 공식 앱은 정보가 분산돼 있어 초보 사용자의 이탈이 잦습니다.
- **Pain Point 3 — 분리된 멤버십 경험**: 기존 통신사 앱의 리워드·쿠폰 서비스가 요금제 서비스와 분리되어 있어, 지속적인 재방문을 유도하기 어렵습니다.

**Our Solution**

대화형 채팅 인터페이스로 사용 패턴을 자연어로 입력하면 AI가 분석해 개인화된 추천 사유와 예상 절감액을 제시하고, 게임·출석·미션으로 적립한 배지를 상품·쿠폰으로 교환할 수 있도록 하여 상담 서비스를 통신 생활 플랫폼으로 확장했습니다.

<br/>

---

## 👥 팀 구성

<table>
  <thead>
    <tr>
      <th width="25%" align="center">김혜진</th>
      <th width="25%" align="center">박소연</th>
      <th width="25%" align="center">송동현</th>
      <th width="25%" align="center">정승민</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img src="https://github.com/llmeajinll.png" width="100%"/></td>
      <td align="center"><img src="https://github.com/Ppakso.png" width="Ppakso%"/></td>
      <td align="center"><img src="https://github.com/donghyeon01.png" width="100%"/></td>
      <td align="center"><img src="https://github.com/namuleaf.png" width="100%"/></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/llmeajinll">@llmeajinll</a></td>
      <td align="center"><a href="https://github.com/Ppakso">@Ppakso</a></td>
<td align="center"><a href="https://github.com/donghyeon01">@donghyeon01</a></td>
      <td align="center"><a href="https://github.com/namuleaf">@namuleaf</a></td>
    </tr>
    <tr>
      <td align="center">조장 · 프론트엔드 · 디자인 · PL</td>
      <td align="center">프론트엔드 · 디자인</td>
      <td align="center">프론트엔드 · 백엔드 · LLM 파이프라인</td>
      <td align="center">프론트엔드 · 디자인 · LLM 프롬프트 엔지니어링</td>
    </tr>
  </tbody>
</table>

<br/>

---

## 🪼 서비스 구성

에피라는 크게 **9가지 서비스 영역**으로 구성됩니다.

|  #  | 서비스             | 주요 내용                                                                     |
| :-: | ------------------ | ----------------------------------------------------------------------------- |
| 01  | **AI 요금제 상담** | 상담 세션, 사용자 조건 분석, 요금제 추천, 추천 사유, 절감액 계산, 상담 레포트 |
| 02  | **요금제 관리**    | 요금제 조회 · 상세 조회 · 현재 요금제 등록 · 비교 · 저장                      |
| 03  | **사용량 분석**    | 월/최근 3개월 사용량 조회, 사용 패턴 및 절감 가능 금액 분석                   |
| 04  | **리워드 시스템**  | 출석 체크 · 룰렛 · 스크래치 · 미션 · 배지 · 친구 추천                         |
| 05  | **게임 시스템**    | 반응속도 게임 · OX 퀴즈 · 카드 뒤집기 · 랭킹                                  |
| 06  | **상품 교환**      | 배지로 상품 조회 · 교환, 교환 내역 관리                                       |
| 07  | **쿠폰 서비스**    | 쿠폰 조회 · 발급 · 사용, 바코드/QR 코드 생성, 쿠폰 알림                       |
| 08  | **접근성 지원**    | 쉬운 모드 · 큰 글씨 모드 · 시니어 친화 UI                                     |
| 09  | **요금제 가입**    | 가입 가능 여부 확인 · 본인 인증 · 가입 신청 · 처리 상태 조회 · 가입 완료      |

<br/>

---

## ✨ 주요 기능

> **중요도** · `P0` 핵심 기능 · `P1` MVP 범위 · `P2` 확장 기능

### 01. 🔐 인증 및 사용자

- 카카오 로그인(OAuth), 회원가입 시 프로필 자동 생성 `P0`
- 프로필 조회(닉네임, 연령대) `P1`
- 접근성 모드 설정, 개인정보 암호화/마스킹, 회원 탈퇴 `P1`

### 02. 🤖 AI 상담

- 상담 세션 생성 및 상태 관리 `P0`
- 데이터 · 통화 · 문자 · 예산 · OTT · 현재 요금제 기반 사용자 조건 분석 `P0`
- 상위 3개 요금제 AI 추천 및 자연어 기반 추천 사유 제공 `P0`
- 현재 요금제 대비 절감액 산출 `P0`
- Quick Reply, 스트리밍 응답 상태 표시 `P1`
- 상담 레포트 저장 `P0` 및 만족도 평가 `P2`

### 03. 📱 요금제

- 전체 요금제 조회(필터 · 검색), 상세 정보 조회 `P0`
- 현재 요금제 등록, 추천 요금제 조회 `P0`
- 2~3개 요금제 비교, 하트로 관심 요금제 저장 및 우선 노출 `P0`

### 04. 📊 사용량 분석

- 데이터 · 통화 · 문자 사용량 및 최근 3개월 이력 조회 `P0`
- 평균 사용량 · 초과 사용 분석 `P1`
- 최적 요금제 대비 절감 가능 금액 분석 `P1`

### 05. 🎁 리워드

- 일일 출석 체크 및 출석 룰렛 `P0`
- 스크래치 이벤트를 통한 랜덤 배지 지급 `P0`
- 배지 적립 및 잔액 조회 `P0` / `P1`
- 미션 수행 `P2`, 친구 추천 및 주변 친구 찾기 `P2`

### 06. 🎮 게임

- 반응속도 게임 및 점수 기반 배지 보상 `P0`
- OX 퀴즈, 카드 뒤집기 게임 `P2`
- 게임 결과 저장 및 랭킹 시스템 `P2`

### 07. 🛍️ 상품 교환

- 배지 교환 가능 상품 조회 · 상세 · 교환 처리 `P1`
- 교환 내역 조회 `P1`

### 08. 🎟️ 쿠폰

- 보유 쿠폰 조회(사용 가능 · 완료 · 만료 예정), 상세 조회 `P0`
- 상품 교환 결과에 따른 쿠폰 발급 `P1`
- 실시간 바코드 생성 `P0`, QR 코드 생성 `P2`
- 쿠폰 사용 처리 및 사용 내역 조회 `P0` / `P1`

### 09. 👤 마이페이지

- 내 요금제 조회 및 상세 분석(사용량 · 추천 결과 비교) `P0`
- 저장 요금제, 상담 레포트 목록/상세 조회 `P0`
- 배지 현황, 쿠폰, 상품 교환 내역, 접근성 설정 관리 `P1`

### 10. 🔔 알림

- 푸시 알림 인프라(FCM/APNs 연동, 개별/토픽 발송, 수신 동의 관리) `P1`
- 쿠폰 만료/신규 발급 알림 `P1`
- 신규 요금제 출시 알림 `P2`

### 11. 📲 요금제 가입

- 현재 요금제 · 자격 · 약정/유심/번호이동 등 가입 가능 여부 확인 `P0`
- 본인 인증, 약관 동의를 포함한 가입 신청 접수 `P0`
- 접수 → 심사 → 완료/실패 단계의 가입 처리 상태 조회 `P0`
- 가입 확정 시 통신사 연동 및 현재 요금제 갱신 `P1`
- 가입 내역 조회(상태별 필터링) `P1`, 가입 취소 `P2`

### 12. 🌱 그 외 확장 기능

- AI 상담 음성 입력(STT 연동) `P2`
- 사용자 맥락 기반 Quick Reply 고도화 `P2`

<br/>

---

## 🛠️ 기술 스택

| 구분         | 스택                                                        |
| ------------ | ----------------------------------------------------------- |
| 프론트엔드   | React 19, TypeScript, Vite 8, TailwindCSS 4, React Router 7 |
| 상태 관리    | Zustand, TanStack Query                                     |
| Build / Test | Vitest, Playwright, ESLint, Prettier, Husky                 |
| BaaS         | Supabase (Auth, PostgreSQL + RLS, Storage, Edge Functions)  |
| DB           | PostgreSQL (Supabase), 마이그레이션/시드 관리               |
| 서버리스     | Supabase Edge Functions (Deno)                              |
| AI           | OpenAI API                                                  |
| 협업 / 배포  | Figma, GitHub, Notion, Jira, Vercel                         |

---

## 🏗 시스템 구조

- **모듈 기반 디렉터리 구조**: `features` / `layout` / `lib` / `router` 중심의 도메인 분리
- **BaaS 중심 아키텍처**
  - Supabase PostgREST — 요금제 · 사용자 · 리워드 등 대부분의 CRUD (자동 REST API)
  - Supabase Auth — 회원가입/로그인/세션, JWT 자동 발급
  - Edge Functions (Deno) — 회원 탈퇴, AI 상담(`ai-consult`) 등 service role이 필요한 로직만 서버리스로 처리
  - OpenAI API — Edge Function에서 호출해 요금제 추천·비교·상담 레포트 생성

### ERD / DB 설계

// 추후 확정 ERD / DB 정보 추가

<br/>

---

## 📂 프로젝트 구조

> 기능별 관련 코드를 응집시켜 코드 탐색과 유지보수를 용이하게 하고, 서비스 기능 확장에 유연하게 대응하기 위해 Feature-based 파일 구조를 적용했습니다.

```
compProject/
├── public/                     # 정적 자산
├── src/                         # 프론트엔드 소스
│   ├── assets/                  # 이미지, 아이콘
│   ├── features/                # 도메인별 기능 컴포넌트 (채팅, 요금제, 리워드 등)
│   ├── layout/                  # Header, Footer, Layout
│   ├── lib/                     # Supabase 클라이언트, AI/상담 유틸리티
│   ├── router/                  # 라우팅 설정
│   ├── App.tsx
│   └── main.tsx
├── supabase/                    # Supabase 설정
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── ai-consult/
│   │   └── _shared/              # 공유 AI/데이터 모듈
│   ├── migrations/               # DB 스키마 마이그레이션
│   ├── seed.sql                  # 초기/샘플 데이터
│   └── config.toml               # Supabase CLI 설정
├── docs/                         # 기술/데이터 모델 문서
├── .env.example
├── package.json
└── vite.config.ts
```

---

## 🖥️ 페이지 구성

// 추후 화면 캡쳐 추가 예정

<br/>

---

## 🧩 기술적 핵심 구현 사항

- **OpenAI API 연동**: Supabase Edge Function(`ai-consult`)에서 OpenAI `/v1/chat/completions`를 호출해 요금제 추천·비교·상담 레포트를 생성
- **채팅 흐름 내 조건 수집**: 데이터 사용량 · 통화량 · 예산 · 부가서비스 선호도를 채팅 흐름 안에서 입력 · 선택할 수 있는 UI/상태 관리
- **응답 상태 UI 처리**: LLM 응답 생성 중 / 완료 / 실패 / 재시도 상황에 따른 화면 상태 분기 처리
- **추천 카드 렌더링**: 분석 결과를 추천 요금제 카드(추천 사유 · 예상 절감액 포함)로 채팅 메시지 내에 렌더링
- **가입 흐름 연결**: 추천 요금제 선택부터 가입 신청 정보 입력, 최종 가입 완료까지 단계형 채팅 흐름으로 구현
- **서버 상태 관리**: TanStack Query로 요금제 · 상담 이력 등 서버 데이터 캐싱 및 동기화, Zustand로 클라이언트 전역 상태 관리

<br/>

---

## 🚀 트러블슈팅

// 추후 작성

---

## 🔧 사전 준비

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (Edge Functions 배포용)
- [Git](https://git-scm.com/)
- 카카오 디벨로퍼스에 등록된 REST API 키 (카카오 로그인 사용 시)

<br/>

---

## 🔐 환경변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 실제 값을 채워 넣습니다. `.env.local`은 Git에 커밋하지 않습니다.

| 변수                        | 설명                       | 예시/출처                                   |
| --------------------------- | -------------------------- | ------------------------------------------- |
| `VITE_SUPABASE_URL`         | Supabase REST API URL      | `npx supabase status`의 `API URL`           |
| `VITE_SUPABASE_ANON_KEY`    | 프론트엔드용 anon key      | `npx supabase status`의 `anon key`          |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리용 service role key    | `npx supabase status`의 `service_role key`  |
| `VITE_KAKAO_REST_API_KEY`   | 카카오 로그인 REST API 키  | 카카오 디벨로퍼스 콘솔                      |
| `VITE_KAKAO_REDIRECT_URI`   | 카카오 로그인 Redirect URI | `http://localhost:5173/auth/kakao/callback` |

> 카카오 로그인을 사용하려면 카카오 디벨로퍼스 콘솔의 **Redirect URI**에 `VITE_KAKAO_REDIRECT_URI` 값을 동일하게 등록해야 합니다.

<br/>

---

| 변수                        | 설명                          | 예시/출처                                   |
| --------------------------- | ----------------------------- | ------------------------------------------- |
| `VITE_SUPABASE_URL`         | Supabase REST API URL         | Supabase Dashboard > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY`    | 프론트엔드용 anon key         | Supabase Dashboard > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리용 service role key       | Supabase Dashboard > Project Settings > API |
| `OPENAI_API_KEY`            | OpenAI API 키                 | OpenAI Platform                             |
| `OPENAI_BASE_URL`           | OpenAI 호환 엔드포인트 (선택) | `https://api.openai.com/v1`                 |
| `OPENAI_MODEL`              | 상담에 사용할 모델 (선택)     | `gpt-4o-mini`                               |

## 🏁 로컬 개발 시작

1. **의존성 설치**

   ```bash
   npm install
   ```

2. 개발 서버 실행

   ```bash
   npm run dev
   ```

   Vite 프론트엔드 개발 서버가 `http://localhost:5173`에서 실행됩니다.

<br/>

---

## 📜 사용 가능한 스크립트

| 명령어                 | 설명                           |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Vite 프론트엔드 개발 서버 실행 |
| `npm run build`        | 타입 검사 및 Vite 빌드         |
| `npm run preview`      | 빌드 결과 미리보기             |
| `npm run lint`         | ESLint 검사                    |
| `npm run lint:fix`     | ESLint 자동 수정               |
| `npm run format`       | Prettier 포맷팅                |
| `npm run format:check` | Prettier 포맷 검사             |
| `npm run deploy:api`   | Supabase Edge Functions 배포   |

## DB 마이그레이션 및 시드

- `supabase/migrations/`: DB 마이그레이션 파일
- `supabase/seed.sql`: 초기 요금제 및 더미 데이터
- `supabase/functions/_shared/data/plans.json`: AI 추천에 사용되는 요금제 데이터

<br/>

---

## 🚢 배포

- **프론트엔드**: [Vercel](https://vercel.com/) 배포 예정
- **BaaS/DB**: [Supabase](https://supabase.com/) 호스팅
- **AI**: OpenAI API

## 참고

- `.env.local`은 `.gitignore`에 포함되어 있어야 합니다. 실제 키를 Git에 커밋하지 마세요.
- AI 추천 관련 프롬프트와 도메인 로직은 `supabase/functions/_shared/ai/`에 있습니다.
