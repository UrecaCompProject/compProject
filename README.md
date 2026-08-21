# AI 통신 요금제 상담 챗봇

> 통신 요금제 비교·추천·가입을 대화형 AI로 원스톱 지원하고, 출석·게임·배지·쿠폰 서비스를 통해 지속적인 사용자 참여를 유도하는 통신 생활 플랫폼

## 개요

수십 가지 통신사 요금제와 복잡한 조건 속에서 사용자가 자신에게 맞는 요금제를 직접 찾기 어렵습니다. 본 프로젝트는 Ollama 기반 로컬 LLM을 활용해 데이터 사용량, 통화량, 예산, 부가서비스 선호도를 자연어로 분석하고, 개인 맞춤형 요금제 추천과 절감액 계산을 제공합니다. 추천부터 가입 신청까지 채팅 흐름 안에서 처리하며, 리워드와 제휴 쿠폰을 통해 단순 추천 서비스를 넘어 통신 생활 플랫폼으로 확장합니다.

## 주요 기능

- **AI 요금제 상담**: 사용 패턴 분석, 상위 3개 요금제 추천, 추천 사유 및 절감액 제공
- **단계형 채팅 가입**: 상담 → 추천 → 가입 신청 → 상태 조회까지 채팅 인터페이스 내 처리
- **요금제 관리**: 조회, 상세, 비교, 저장, 현재 요금제 등록, 상담 레포트 저장
- **리워드 시스템**: 출석, 출석 룰렛, 스크래치 이벤트, 미션, 배지 적립
- **게임**: 반응속도 게임, 통신 상식 OX 퀴즈, 카드 뒤집기, 랭킹(계획)
- **배지 상품 교환**: 배지로 상품·쿠폰 교환
- **제휴 쿠폰**: 쿠폰 조회, 바코드/QR 생성, 사용 처리
- **접근성**: 쉬운 모드, 큰 글씨 모드(계획)

## 기술 스택

| 영역       | 항목                                                        |
| ---------- | ----------------------------------------------------------- |
| 프론트엔드 | React 19, TypeScript, Vite 8, TailwindCSS 4, React Router 7 |
| 상태 관리  | Zustand(도입 예정), TanStack Query(도입 예정)               |
| BaaS       | Supabase (Auth, PostgreSQL, Storage, Edge Functions)        |
| DB         | PostgreSQL (Supabase), 마이그레이션/시드 관리               |
| 서버리스   | Supabase Edge Functions (Deno)                              |
| AI         | Ollama 로컬 LLM                                             |
| 코드 품질  | ESLint, Prettier, Husky                                     |
| 테스트     | Vitest, Playwright                                          |

## 프로젝트 구조

```
compProject/
├── public/                     # 정적 자산
├── scripts/                    # 개발 보조 및 시드 생성 스크립트
│   ├── dev-ollama.js
│   └── generate-seed.cjs
├── src/                        # 프론트엔드 소스
│   ├── assets/                 # 이미지, 아이콘
│   ├── features/               # 도메인별 기능 컴포넌트
│   ├── layout/                 # Header, Footer, Layout
│   ├── lib/                    # Supabase 클라이언트, AI/상담 유틸리티
│   ├── router/                 # 라우팅 설정
│   ├── App.tsx
│   └── main.tsx
├── supabase/                   # Supabase 설정
│   ├── functions/              # Edge Functions (Deno)
│   │   ├── ai-consult/
│   │   ├── _shared/            # 공유 AI/데이터 모듈
│   │   └── hello/
│   ├── migrations/             # DB 스키마 마이그레이션
│   ├── seed.sql                # 초기/샘플 데이터
│   └── config.toml             # Supabase CLI 설정
├── data/                       # 요금제 원천 JSON
├── docs/                       # 기술/데이터 모델 문서
├── .env.example                # 환경변수 예시
├── package.json
└── vite.config.ts
```

## 사전 준비

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Supabase 로컬 스택 실행용)
- [Ollama](https://ollama.com/)
- [Git](https://git-scm.com/)

## 환경변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 실제 값을 채워 넣습니다. `.env.local`은 Git에 커밋하지 않습니다.

| 변수                        | 설명                                     | 예시/출처                                  |
| --------------------------- | ---------------------------------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`         | Supabase REST API URL                    | `npx supabase status`의 `API URL`          |
| `VITE_SUPABASE_ANON_KEY`    | 프론트엔드용 anon key                    | `npx supabase status`의 `anon key`         |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리용 service role key                  | `npx supabase status`의 `service_role key` |
| `OLLAMA_BASE_URL`           | 프론트/개발 스크립트용 Ollama 주소       | `http://localhost:11434`                   |
| `OLLAMA_TUNNEL_URL`         | Edge Function에서 Ollama를 호출하는 주소 | `http://localhost:11434`                   |
| `OLLAMA_MODEL`              | 상담에 사용할 모델                       | `qwen2.5:3b-instruct-q4_K_M`               |
| `OLLAMA_EMBED_MODEL`        | 임베딩 모델 (선택)                       | `nomic-embed-text:latest`                  |

## 로컬 개발 시작

1. 의존성 설치

   ```bash
   npm install
   ```

2. Ollama 모델 다운로드

   ```bash
   ollama pull qwen2.5:3b-instruct-q4_K_M
   ollama pull nomic-embed-text:latest
   ```

3. Supabase 로컬 스택 시작

   ```bash
   npx supabase start
   ```

   명령어 출력에서 API URL, anon key, service_role key를 확인해 `.env.local`에 입력합니다.

4. 개발 서버 실행

   ```bash
   npm run dev
   ```

   아래 3개 프로세스가 동시에 실행됩니다.

   - `vite` (프론트엔드 개발 서버, 기본 `http://localhost:5173`)
   - `npx supabase functions serve` (Edge Functions)
   - `node scripts/dev-ollama.js` (Ollama 미구동 시 자동 실행 시도)

## 사용 가능한 스크립트

| 명령어                 | 설명                                           |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | 프론트엔드 + Edge Functions + Ollama 동시 실행 |
| `npm run dev:web`      | Vite 프론트엔드만 실행                         |
| `npm run dev:api`      | Supabase Edge Functions만 실행                 |
| `npm run dev:ollama`   | Ollama 자동 시작 스크립트                      |
| `npm run build`        | 타입 검사 및 Vite 빌드                         |
| `npm run preview`      | 빌드 결과 미리보기                             |
| `npm run lint`         | ESLint 검사                                    |
| `npm run lint:fix`     | ESLint 자동 수정                               |
| `npm run format`       | Prettier 포맷팅                                |
| `npm run format:check` | Prettier 포맷 검사                             |

## DB 마이그레이션 및 시드

- `supabase/migrations/`: `npx supabase start` 또는 `npx supabase db reset` 시 자동 적용됩니다.
- `supabase/seed.sql`: 초기 요금제 및 더미 데이터를 포함합니다.
- `data/plans_*.json`: 요금제 원천 데이터입니다. 필요 시 `scripts/generate-seed.cjs`로 `seed.sql` 형태로 변환할 수 있습니다.

## 주요 포트

| 서비스          | 포트        |
| --------------- | ----------- |
| Vite 프론트엔드 | 5173 (기본) |
| Supabase API    | 54321       |
| Supabase DB     | 54322       |
| Supabase Studio | 54323       |
| Ollama          | 11434       |

## 배포 계획

- **프론트엔드**: [Vercel](https://vercel.com/) 배포 예정
- **BaaS/DB**: [Supabase](https://supabase.com/) 호스팅 또는 [Docker](https://www.docker.com/) 기반 자체 호스팅
- **AI**: Ollama를 별도 호스트 또는 터널링하여 Edge Function에서 호출

## 참고

- `.env.local`은 `.gitignore`에 포함되어 있어야 합니다. 실제 키를 Git에 커밋하지 마세요.
- Supabase local 설정은 `supabase/config.toml`에서 관리합니다.
- AI 추천 관련 프롬프트와 도메인 로직은 `supabase/functions/_shared/ai/`에 있습니다.
