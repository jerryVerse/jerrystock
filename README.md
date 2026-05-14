# JStock - 증권 계좌 관리 시스템

## 프로젝트 구조

```
JStock/
├── app/                          # Frontend (Nuxt 4 - app/ 디렉토리)
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # 글로벌 CSS (디자인 시스템)
│   ├── layouts/
│   │   └── default.vue           # 사이드바 + 탑바 레이아웃
│   ├── pages/
│   │   ├── index.vue             # 대시보드
│   │   ├── market.vue            # 시장 현황 (종목 시세 조회)
│   │   ├── account.vue           # 계좌 관리 (잔고, 보유 종목)
│   │   ├── trading.vue           # 매매 주문 (매수/매도)
│   │   ├── portfolio.vue         # 포트폴리오
│   │   ├── history.vue           # 거래 내역
│   │   └── settings.vue          # 설정
│   ├── stores/
│   │   ├── account.ts            # Pinia - 계좌/잔고/보유종목 상태
│   │   └── market.ts             # Pinia - 시세/관심종목 상태
│   └── app.vue                   # Nuxt 앱 루트
│
├── server/                       # Backend (Nitro 서버)
│   ├── api/
│   │   ├── market/
│   │   │   ├── quote/[code].get.ts   # GET /api/market/quote/:code
│   │   │   └── chart/[code].get.ts   # GET /api/market/chart/:code
│   │   ├── account/
│   │   │   ├── balance.get.ts        # GET /api/account/balance
│   │   │   └── holdings.get.ts       # GET /api/account/holdings
│   │   └── trading/
│   │       ├── order.post.ts         # POST /api/trading/order
│   │       └── orders/
│   │           └── pending.get.ts    # GET /api/trading/orders/pending
│   ├── services/
│   │   └── stock.service.ts      # 한국투자증권 Open API 서비스
│   └── utils/
│       └── helpers.ts            # 서버 유틸리티 함수
│
├── types/
│   └── stock.ts                  # 공유 TypeScript 타입 정의
│
├── public/
│   └── favicon.svg
│
├── .env                          # 환경 변수 (API Key 설정)
├── .env.example                  # 환경 변수 예시
├── nuxt.config.ts                # Nuxt 설정
└── package.json
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/market/quote/:code` | 주식 현재가 조회 |
| GET | `/api/market/chart/:code?period=D&startDate=&endDate=` | 차트 데이터 |
| GET | `/api/account/balance?accountNo=` | 계좌 잔고 조회 |
| GET | `/api/account/holdings?accountNo=` | 보유 종목 조회 |
| POST | `/api/trading/order` | 주문 접수 (매수/매도) |
| GET | `/api/trading/orders/pending?accountNo=` | 미체결 주문 조회 |

## 시작하기

### 1. 의존성 설치
```bash
npm install --legacy-peer-deps
```

### 2. 환경 변수 설정
`.env` 파일에 한국투자증권 API 키를 입력:
```env
STOCK_API_KEY=your_app_key
STOCK_API_SECRET=your_app_secret
STOCK_ACCOUNT_NO=12345678-01
JWT_SECRET=your_secret
```

### 3. 개발 서버 실행
```bash
npm run dev
```
→ http://localhost:5000

### 4. 프로덕션 빌드
```bash
npm run build
npm run preview
```

## API 연동 정보

- **증권사**: 한국투자증권 Open API
- **포털**: https://apiportal.koreainvestment.com
- **인증**: OAuth2 (Client Credentials)
- **문서**: https://apiportal.koreainvestment.com/apiservice

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Nuxt 4, Vue 3, Pinia |
| Backend | Nitro (Nuxt 서버엔진) |
| 스타일 | Vanilla CSS (다크모드) |
| 유효성 | Zod |
| 타입 | TypeScript |
| 폰트 | Inter, JetBrains Mono |
