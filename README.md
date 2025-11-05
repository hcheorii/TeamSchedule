# Team Scheduler API

Node.js, Express, PostgreSQL을 사용한 팀 스케줄러 REST API입니다.

## 주요 기능

-   ✅ 태스크 생성, 조회, 수정, 삭제
-   📊 상태 및 우선순위 기반 필터링
-   📅 날짜 범위 조회 (캘린더 뷰)
-   📈 대시보드 통계 정보
-   🔄 Kanban 보드 지원 (상태 변경)

## 기술 스택

-   **Backend**: Node.js, Express.js
-   **Database**: PostgreSQL
-   **Deployment**: Railway

## API 엔드포인트

### Tasks API

| Method | Endpoint                   | 설명                           |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/tasks`               | 모든 태스크 조회 (필터링 가능) |
| GET    | `/api/tasks/:id`           | 특정 태스크 상세 조회          |
| POST   | `/api/tasks`               | 새 태스크 생성                 |
| PUT    | `/api/tasks/:id`           | 태스크 전체 수정               |
| PATCH  | `/api/tasks/:id/status`    | 태스크 상태만 변경             |
| DELETE | `/api/tasks/:id`           | 태스크 삭제                    |
| GET    | `/api/tasks/by-date-range` | 날짜 범위로 태스크 조회        |

### Dashboard API

| Method | Endpoint               | 설명               |
| ------ | ---------------------- | ------------------ |
| GET    | `/api/dashboard/stats` | 대시보드 통계 정보 |

## 데이터 모델

### Task

```json
{
    "id": "UUID",
    "title": "태스크 제목",
    "description": "태스크 설명",
    "status": "backlog | todo | in-progress | done",
    "priority": "low | medium | high",
    "assignee": "담당자 이름",
    "dueDate": "2025-11-10",
    "createdAt": "2025-11-05"
}
```

## 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL 연결 정보 (로컬)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=team_scheduler
```

### 3. PostgreSQL 설정

로컬에 PostgreSQL을 설치하고 데이터베이스를 생성:

```sql
CREATE DATABASE team_scheduler;
```

### 4. 데이터베이스 초기화

```bash
npm run init-db
```

### 5. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

## Railway 배포

### 1. Railway 프로젝트 생성

1. [Railway](https://railway.app)에 가입
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 이 저장소 선택

### 2. PostgreSQL 서비스 추가 ⚠️ 중요!

**반드시 백엔드 서버와 같은 프로젝트 내에 PostgreSQL을 추가해야 합니다:**

1. Railway 대시보드에서 "Add Service" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경변수가 설정됩니다

### 3. PostgreSQL 연결 정보 확인

PostgreSQL 서비스 > "Variables" 탭에서 다음 정보 확인:

-   `PGHOST` (Private Networking 주소)
-   `PGPORT`
-   `PGUSER`
-   `PGPASSWORD`
-   `PGDATABASE`

### 4. 백엔드 서버 환경 변수 설정

백엔드 서비스 > "Variables" 탭에서 다음 환경변수 추가:

```
DB_HOST=<PostgreSQL의 Private Networking 주소>
DB_PORT=<PGPORT 값>
DB_USER=<PGUSER 값>
DB_PASSWORD=<PGPASSWORD 값>
DB_NAME=<PGDATABASE 값>
NODE_ENV=production
```

### 5. 데이터베이스 테이블 생성

Railway PostgreSQL 서비스에서:

1. "Data" 탭 클릭
2. "Query" 버튼 클릭
3. `src/database/schema.sql` 내용을 복사하여 실행

또는 배포 후 Railway 콘솔에서:

```bash
npm run init-db
```

### 6. 배포 확인

1. 백엔드 서비스 > "Settings" > "Networking" > "Public Networking"
2. "Generate Domain" 클릭
3. 생성된 URL로 접속하여 확인

```bash
GET https://your-app.up.railway.app/
```

## API 사용 예시

### 태스크 생성

```bash
curl -X POST https://your-app.up.railway.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API 개발",
    "description": "REST API 엔드포인트 구현",
    "status": "in-progress",
    "priority": "high",
    "assignee": "홍길동",
    "dueDate": "2025-11-10"
  }'
```

### 태스크 목록 조회 (필터링)

```bash
# 모든 태스크
curl https://your-app.up.railway.app/api/tasks

# 상태 필터링
curl https://your-app.up.railway.app/api/tasks?status=in-progress

# 우선순위 필터링
curl https://your-app.up.railway.app/api/tasks?priority=high

# 복합 필터링
curl https://your-app.up.railway.app/api/tasks?status=todo&priority=high
```

### 태스크 상태 변경 (Kanban 보드)

```bash
curl -X PATCH https://your-app.up.railway.app/api/tasks/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### 날짜 범위 조회 (캘린더 뷰)

```bash
curl "https://your-app.up.railway.app/api/tasks/by-date-range?startDate=2025-11-01&endDate=2025-11-30"
```

### 대시보드 통계

```bash
curl https://your-app.up.railway.app/api/dashboard/stats
```

## 프로젝트 구조

```
├── src/
│   ├── app.js                  # 메인 애플리케이션
│   ├── database/
│   │   ├── connection.js       # PostgreSQL 연결
│   │   ├── init.js            # 데이터베이스 초기화
│   │   └── schema.sql         # 테이블 스키마
│   └── routes/
│       ├── tasks.js           # Tasks API
│       └── dashboard.js       # Dashboard API
├── package.json
├── railway.json               # Railway 배포 설정
├── Procfile                   # Railway 시작 명령
└── README.md
```

## 에러 응답 형식

```json
{
    "error": {
        "code": "ERROR_CODE",
        "message": "사용자에게 표시할 메시지",
        "details": "개발 환경에서만 표시"
    }
}
```

## HTTP 상태 코드

-   `200` - 성공
-   `201` - 생성 성공 (POST)
-   `400` - 잘못된 요청
-   `404` - 리소스를 찾을 수 없음
-   `500` - 서버 내부 오류
-   `503` - 데이터베이스 서비스 사용 불가

## 문제 해결

### 데이터베이스 연결 오류

Railway에서 PostgreSQL 서비스가 백엔드와 **같은 프로젝트 내**에 있는지 확인하세요.

### Private Networking

Railway에서는 Private Networking을 사용하여 내부적으로 서비스 간 통신합니다. `DB_HOST`에는 PostgreSQL의 Private Networking 주소를 사용하세요.

### 환경 변수 누락

배포 후 백엔드 서비스의 Variables 탭에서 모든 DB 관련 환경변수가 설정되어 있는지 확인하세요.

## 라이센스

MIT License
