-- Team Scheduler 데이터베이스 스키마

-- 확장 프로그램 활성화 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks 테이블
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('backlog', 'todo', 'in-progress', 'done')),
    priority VARCHAR(10) NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
    assignee VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- 샘플 데이터 삽입 (선택사항)
-- INSERT INTO tasks (title, description, status, priority, assignee, due_date)
-- VALUES 
--     ('API 개발', 'REST API 엔드포인트 구현', 'in-progress', 'high', '홍길동', '2025-11-10'),
--     ('데이터베이스 설계', 'PostgreSQL 스키마 설계', 'done', 'high', '김철수', '2025-11-05'),
--     ('프론트엔드 개발', 'React 컴포넌트 개발', 'todo', 'medium', '이영희', '2025-11-15');

