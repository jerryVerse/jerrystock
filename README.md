# JStock - 증권 계좌 관리 시스템 (다중 사용자 지원)

## 주요 기능
- **다중 사용자 시스템**: 회원가입/로그인 (JWT 인증)
- **증권 계좌 등록**: 한국투자증권 API Key를 여러 개 등록하여 선택 사용 가능
- **대시보드**: 자산 현황 요약
- **매매 주문 & 거래 내역**: 주식 매수/매도 및 미체결 주문 관리

## 프로젝트 구조

```
JStock/
├── app/                          # Frontend (Nuxt 4)
│   ├── pages/
│   │   ├── login.vue, register.vue
│   │   ├── account/              # 계좌 목록 및 추가 페이지
│   │   └── ...
│   ├── layouts/
│   │   └── default.vue           # 사이드바 + 탑바 (계좌 드롭다운)
│   ├── middleware/
│   │   └── auth.ts               # 라우트 보호 미들웨어
│   └── stores/
│       ├── auth.ts, account.ts, market.ts
│
├── server/                       # Backend (Nitro 서버)
│   ├── api/
│   │   ├── auth/                 # 로그인, 회원가입 API
│   │   ├── account/              # 계좌 CRUD 및 잔고 조회
│   │   └── trading/              # 매매 주문 API
│   ├── db/
│   │   ├── schema.ts             # Drizzle ORM (users, broker_accounts)
│   │   └── index.ts              # SQLite 연결
│   ├── middleware/
│   │   └── auth.ts               # JWT 토큰 검증
│   ├── services/
│   │   └── stock.service.ts      # 한국투자증권 Open API 연동
│   └── utils/
│       └── auth.ts               # JWT 및 Bcrypt 헬퍼
│
├── data/                         # SQLite DB 저장소 (`jstock.db`)
├── .env                          # 환경 변수 (DB 경로, JWT 시크릿 등)
├── nuxt.config.ts
└── package.json
```

## 시작하기

### 1. 패키지 설치
```bash
npm install --legacy-peer-deps
```

### 2. 환경 변수 설정 (`.env`)
```env
DATABASE_URL=./data/jstock.db
JWT_SECRET=change-this-to-a-strong-secret
JWT_EXPIRES_IN=7d
PORT=5000
```

### 3. 데이터베이스 초기화 (SQLite)
테이블 생성 및 초기 `admin` 계정을 생성합니다.
```bash
npm run db:migrate
```
*초기 어드민 계정: `admin@jstock.local` / `admin1234!`*

### 4. 개발 서버 실행
```bash
npm run dev
```
→ http://localhost:5000 접속 후 로그인

### 5. API Key 등록
로그인 후 **계좌 관리 > 계좌 추가** 메뉴에서 한국투자증권 API Key(App Key, App Secret)를 등록해야 실제 잔고 조회 및 주문이 가능합니다.

## 기술 스택
| 구분 | 기술 |
|------|------|
| Frontend | Nuxt 4, Vue 3, Pinia |
| Backend | Nitro |
| Database | SQLite, Drizzle ORM, better-sqlite3 |
| Auth | JWT (jose), Bcrypt |
| 스타일 | Vanilla CSS (다크모드) |
