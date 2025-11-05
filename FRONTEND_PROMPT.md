# Team Scheduler Frontend 개발 요청

## 프로젝트 개요

Team Scheduler는 팀의 태스크를 관리하는 웹 애플리케이션입니다. Kanban 보드, 캘린더 뷰, 대시보드를 포함한 모던한 프론트엔드를 개발해주세요.

## 기술 스택 요구사항

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios 또는 Fetch API
- **상태 관리**: React Query (TanStack Query) 권장
- **라우팅**: React Router v6
- **UI 라이브러리**: shadcn/ui 또는 MUI (선택)

## Backend API Base URL

```
https://your-app.up.railway.app
```

---

## API 명세

### 데이터 타입 정의

```typescript
type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;              // UUID
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;        // 담당자 이름 (사용자가 직접 입력)
  dueDate: string;         // YYYY-MM-DD 형식
  createdAt: string;       // YYYY-MM-DD 형식
}

interface DashboardStats {
  totalTasks: number;
  tasksByStatus: {
    backlog: number;
    todo: number;
    'in-progress': number;
    done: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    assignee: string;
  }>;
}
```

---

## API 엔드포인트

### 1. 태스크 목록 조회

```http
GET /api/tasks
```

**Query Parameters** (선택사항):
- `status`: 'backlog' | 'todo' | 'in-progress' | 'done'
- `priority`: 'low' | 'medium' | 'high'

**Response 200**:
```json
{
  "tasks": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "API 개발",
      "description": "REST API 엔드포인트 구현",
      "status": "in-progress",
      "priority": "high",
      "assignee": "홍길동",
      "dueDate": "2025-11-10",
      "createdAt": "2025-11-05"
    }
  ]
}
```

**사용 예시**:
```typescript
// 모든 태스크
GET /api/tasks

// 상태 필터링
GET /api/tasks?status=in-progress

// 우선순위 필터링
GET /api/tasks?priority=high

// 복합 필터링
GET /api/tasks?status=todo&priority=high
```

---

### 2. 특정 태스크 조회

```http
GET /api/tasks/:id
```

**Response 200**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "API 개발",
  "description": "REST API 엔드포인트 구현",
  "status": "in-progress",
  "priority": "high",
  "assignee": "홍길동",
  "dueDate": "2025-11-10",
  "createdAt": "2025-11-05"
}
```

**Error 404**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "태스크를 찾을 수 없습니다"
  }
}
```

---

### 3. 태스크 생성

```http
POST /api/tasks
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "새 태스크",
  "description": "태스크 설명",
  "status": "todo",
  "priority": "medium",
  "assignee": "김철수",
  "dueDate": "2025-11-15"
}
```

**Response 201**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "새 태스크",
  "description": "태스크 설명",
  "status": "todo",
  "priority": "medium",
  "assignee": "김철수",
  "dueDate": "2025-11-15",
  "createdAt": "2025-11-05"
}
```

**Error 400** (유효성 검증 실패):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "모든 필드는 필수입니다"
  }
}
```

---

### 4. 태스크 전체 수정

```http
PUT /api/tasks/:id
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "수정된 태스크",
  "description": "수정된 설명",
  "status": "in-progress",
  "priority": "high",
  "assignee": "이영희",
  "dueDate": "2025-11-20"
}
```

**Response 200**: (Task 객체 반환)

---

### 5. 태스크 상태만 변경 (Kanban 보드용)

```http
PATCH /api/tasks/:id/status
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "done"
}
```

**Response 200**: (Task 객체 반환)

**사용 시나리오**: 
Kanban 보드에서 드래그 앤 드롭으로 칼럼 간 이동할 때 사용

---

### 6. 태스크 삭제

```http
DELETE /api/tasks/:id
```

**Response 200**:
```json
{
  "success": true,
  "message": "태스크가 삭제되었습니다"
}
```

---

### 7. 날짜 범위로 태스크 조회 (캘린더 뷰용)

```http
GET /api/tasks/by-date-range?startDate=2025-11-01&endDate=2025-11-30
```

**Query Parameters** (필수):
- `startDate`: YYYY-MM-DD 형식
- `endDate`: YYYY-MM-DD 형식

**Response 200**:
```json
{
  "tasks": [
    // Task 객체 배열 (dueDate 기준 오름차순 정렬)
  ]
}
```

---

### 8. 대시보드 통계

```http
GET /api/dashboard/stats
```

**Response 200**:
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
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "긴급 태스크",
      "dueDate": "2025-11-08",
      "assignee": "홍길동"
    }
  ]
}
```

---

## 공통 에러 응답 형식

모든 API 에러는 다음 형식을 따릅니다:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시할 에러 메시지",
    "details": "개발 환경에서만 표시되는 상세 정보 (선택)"
  }
}
```

**HTTP 상태 코드**:
- `200` - 성공
- `201` - 생성 성공
- `400` - 잘못된 요청 (유효성 검증 실패)
- `404` - 리소스를 찾을 수 없음
- `500` - 서버 내부 오류
- `503` - 데이터베이스 서비스 사용 불가

---

## 프론트엔드 요구사항

### 필수 페이지/컴포넌트

1. **대시보드 (Dashboard)**
   - 통계 카드 (전체 태스크 수, 상태별/우선순위별 분포)
   - 다가오는 마감일 목록 (5개)
   - 차트/그래프로 시각화 (선택사항)

2. **Kanban 보드**
   - 4개 칼럼: Backlog, Todo, In Progress, Done
   - 드래그 앤 드롭으로 상태 변경 (PATCH /api/tasks/:id/status 사용)
   - 각 카드에 표시: 제목, 담당자, 마감일, 우선순위 태그
   - 상단에 필터링 옵션 (우선순위별)
   - 새 태스크 생성 버튼

3. **태스크 목록 뷰 (Table View)**
   - 테이블 형식으로 모든 태스크 표시
   - 정렬 기능 (제목, 마감일, 우선순위, 상태)
   - 필터링 (상태, 우선순위)
   - 검색 기능 (제목/설명으로 검색)
   - 행 클릭 시 상세 보기 모달

4. **캘린더 뷰**
   - 월간 캘린더
   - 마감일 기준으로 태스크 표시
   - 날짜 클릭 시 해당 날짜의 태스크 목록 표시
   - GET /api/tasks/by-date-range 사용

5. **태스크 생성/수정 모달**
   - 폼 필드:
     - 제목 (필수, text input)
     - 설명 (필수, textarea)
     - 상태 (필수, select: backlog/todo/in-progress/done)
     - 우선순위 (필수, select: low/medium/high)
     - 담당자 (필수, text input - 사용자가 직접 입력)
     - 마감일 (필수, date picker)
   - 유효성 검증 (모든 필드 필수)
   - 저장/취소 버튼

6. **태스크 상세 보기 모달**
   - 모든 태스크 정보 표시
   - 수정/삭제 버튼
   - 삭제 시 확인 대화상자

### UI/UX 가이드라인

1. **반응형 디자인**
   - 모바일, 태블릿, 데스크탑 지원
   - Tailwind CSS breakpoints 활용

2. **색상 시스템**
   - 우선순위 색상:
     - High: 빨강 (`bg-red-100`, `text-red-700`)
     - Medium: 노랑 (`bg-yellow-100`, `text-yellow-700`)
     - Low: 초록 (`bg-green-100`, `text-green-700`)
   - 상태 색상:
     - Backlog: 회색
     - Todo: 파랑
     - In Progress: 주황
     - Done: 초록

3. **로딩 상태**
   - API 호출 중 로딩 스피너 표시
   - Skeleton UI 사용 (선택사항)

4. **에러 처리**
   - Toast 알림으로 성공/실패 메시지 표시
   - 네트워크 오류 시 재시도 버튼

5. **애니메이션**
   - 모달 열기/닫기 애니메이션
   - Kanban 카드 드래그 앤 드롭 시 부드러운 전환
   - 리스트 아이템 추가/삭제 애니메이션

### 네비게이션

사이드바 또는 상단 네비게이션:
- 📊 대시보드
- 📋 Kanban 보드
- 📝 태스크 목록
- 📅 캘린더

---

## React Query 사용 예시

```typescript
// hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'https://your-app.up.railway.app/api';

// 태스크 목록 조회
export const useTasks = (filters?: { status?: string; priority?: string }) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/tasks`, { params: filters });
      return data.tasks;
    }
  });
};

// 태스크 생성
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
      const { data } = await axios.post(`${API_BASE_URL}/tasks`, newTask);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};

// 태스크 상태 변경
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await axios.patch(`${API_BASE_URL}/tasks/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};

// 대시보드 통계
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/dashboard/stats`);
      return data;
    }
  });
};
```

---

## 추가 요구사항

1. **환경 변수 설정**
   ```env
   VITE_API_BASE_URL=https://your-app.up.railway.app
   ```

2. **CORS**: 백엔드에서 이미 모든 오리진 허용 설정됨

3. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD` 형식 사용

4. **상태 관리**: 
   - 전역 상태는 최소화
   - Server state는 React Query로 관리
   - UI 상태만 React state 사용

5. **성능 최적화**:
   - React.memo 사용
   - useMemo, useCallback 적절히 활용
   - 이미지 lazy loading

---

## 참고 디자인

- **Trello** (Kanban 보드 참고)
- **Linear** (모던한 UI/UX)
- **Notion Calendar** (캘린더 뷰 참고)

---

이 명세를 바탕으로 모던하고 사용하기 쉬운 Team Scheduler 프론트엔드를 개발해주세요!

