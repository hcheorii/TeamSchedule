# Team Scheduler API 명세

## Base URL
```
https://your-app.up.railway.app
```

## 데이터 타입

```typescript
type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;              // UUID
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;        // 담당자 이름
  dueDate: string;         // YYYY-MM-DD
  createdAt: string;       // YYYY-MM-DD
}
```

---

## API 엔드포인트

### 1. 태스크 목록 조회
```http
GET /api/tasks
GET /api/tasks?status=todo
GET /api/tasks?priority=high
GET /api/tasks?status=todo&priority=high
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "API 개발",
      "description": "REST API 구현",
      "status": "in-progress",
      "priority": "high",
      "assignee": "홍길동",
      "dueDate": "2025-11-10",
      "createdAt": "2025-11-05"
    }
  ]
}
```

---

### 2. 태스크 상세 조회
```http
GET /api/tasks/:id
```

**Response:** Task 객체 1개

---

### 3. 태스크 생성
```http
POST /api/tasks
Content-Type: application/json
```

**Request:**
```json
{
  "title": "새 태스크",
  "description": "설명",
  "status": "todo",
  "priority": "medium",
  "assignee": "김철수",
  "dueDate": "2025-11-15"
}
```

**Response (201):** 생성된 Task 객체

---

### 4. 태스크 수정
```http
PUT /api/tasks/:id
Content-Type: application/json
```

**Request:** POST와 동일한 형식 (모든 필드 필수)

**Response:** 수정된 Task 객체

---

### 5. 태스크 상태만 변경 (Kanban용)
```http
PATCH /api/tasks/:id/status
Content-Type: application/json
```

**Request:**
```json
{
  "status": "done"
}
```

**Response:** 수정된 Task 객체

---

### 6. 태스크 삭제
```http
DELETE /api/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "message": "태스크가 삭제되었습니다"
}
```

---

### 7. 날짜 범위로 조회 (캘린더용)
```http
GET /api/tasks/by-date-range?startDate=2025-11-01&endDate=2025-11-30
```

**Response:** tasks 배열 (dueDate 기준 정렬)

---

### 8. 대시보드 통계
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalTasks": 15,
  "tasksByStatus": {
    "backlog": 3,
    "todo": 5,
    "in-progress": 4,
    "done": 3
  },
  "tasksByPriority": {
    "low": 4,
    "medium": 6,
    "high": 5
  },
  "upcomingDeadlines": [
    {
      "id": "uuid",
      "title": "긴급 태스크",
      "dueDate": "2025-11-08",
      "assignee": "홍길동"
    }
  ]
}
```

---

## 에러 응답

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

**HTTP 상태 코드:**
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 404: 찾을 수 없음
- 500: 서버 오류

---

## 중요 사항

- 모든 날짜는 `YYYY-MM-DD` 형식
- status는 4가지: `backlog`, `todo`, `in-progress`, `done`
- priority는 3가지: `low`, `medium`, `high`
- assignee는 사용자가 직접 입력하는 텍스트
- CORS 설정 완료됨 (모든 오리진 허용)

