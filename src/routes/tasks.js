const express = require("express");
const { query } = require("../database/connection");
const { v4: uuidv4 } = require("uuid");

// 데이터베이스 연결 확인 미들웨어
const checkDatabaseConnection = async (req, res, next) => {
    try {
        await query("SELECT 1");
        next();
    } catch (error) {
        console.error("데이터베이스 연결 확인 실패:", error);
        res.status(503).json({
            error: {
                code: "DATABASE_UNAVAILABLE",
                message: "데이터베이스 서비스를 사용할 수 없습니다.",
                details: "Railway에서 PostgreSQL 서비스가 설정되지 않았거나 연결할 수 없습니다."
            }
        });
    }
};

const router = express.Router();

// Helper function: DB 결과를 API 응답 형식으로 변환
const transformTask = (task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    dueDate: task.due_date,
    createdAt: task.created_at
});

// 1. GET /api/tasks - 모든 태스크 목록 조회
router.get("/", checkDatabaseConnection, async (req, res) => {
    try {
        const { status, priority } = req.query;
        
        let selectQuery = "SELECT * FROM tasks WHERE 1=1";
        const queryParams = [];
        let paramIndex = 1;

        if (status) {
            selectQuery += ` AND status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
        }

        if (priority) {
            selectQuery += ` AND priority = $${paramIndex}`;
            queryParams.push(priority);
            paramIndex++;
        }

        selectQuery += " ORDER BY created_at DESC";

        const result = await query(selectQuery, queryParams);
        const tasks = result.rows.map(transformTask);

        res.json({ tasks });
    } catch (error) {
        console.error("태스크 목록 조회 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "태스크 목록 조회 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

// 7. GET /api/tasks/by-date-range - 특정 날짜 범위의 태스크 조회 (반드시 :id 보다 먼저)
router.get("/by-date-range", checkDatabaseConnection, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "startDate와 endDate는 필수입니다"
                }
            });
        }

        const selectQuery = `
            SELECT * FROM tasks
            WHERE due_date BETWEEN $1 AND $2
            ORDER BY due_date ASC
        `;

        const result = await query(selectQuery, [startDate, endDate]);
        const tasks = result.rows.map(transformTask);

        res.json({ tasks });
    } catch (error) {
        console.error("날짜 범위 조회 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "날짜 범위 조회 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

// 2. GET /api/tasks/:id - 특정 태스크 상세 조회
router.get("/:id", checkDatabaseConnection, async (req, res) => {
    try {
        const { id } = req.params;

        const selectQuery = "SELECT * FROM tasks WHERE id = $1";
        const result = await query(selectQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    message: "태스크를 찾을 수 없습니다"
                }
            });
        }

        res.json(transformTask(result.rows[0]));
    } catch (error) {
        console.error("태스크 조회 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "태스크 조회 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

// 3. POST /api/tasks - 새 태스크 생성
router.post("/", checkDatabaseConnection, async (req, res) => {
    try {
        const { title, description, status, priority, assignee, dueDate } = req.body;

        // 필수 필드 검증
        if (!title || !description || !status || !priority || !assignee || !dueDate) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "모든 필드는 필수입니다"
                }
            });
        }

        // status 검증
        const validStatuses = ['backlog', 'todo', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "유효하지 않은 상태값입니다"
                }
            });
        }

        // priority 검증
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "유효하지 않은 우선순위입니다"
                }
            });
        }

        const id = uuidv4();
        const createdAt = new Date().toISOString().split('T')[0];

        const insertQuery = `
            INSERT INTO tasks (id, title, description, status, priority, assignee, due_date, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const result = await query(insertQuery, [
            id,
            title,
            description,
            status,
            priority,
            assignee,
            dueDate,
            createdAt
        ]);

        res.status(201).json(transformTask(result.rows[0]));
    } catch (error) {
        console.error("태스크 생성 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "태스크 생성 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

// 4. PUT /api/tasks/:id - 태스크 전체 수정
router.put("/:id", checkDatabaseConnection, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, assignee, dueDate } = req.body;

        // 필수 필드 검증
        if (!title || !description || !status || !priority || !assignee || !dueDate) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "모든 필드는 필수입니다"
                }
            });
        }

        const updateQuery = `
            UPDATE tasks
            SET title = $1, description = $2, status = $3, priority = $4, assignee = $5, due_date = $6
            WHERE id = $7
            RETURNING *
        `;

        const result = await query(updateQuery, [
            title,
            description,
            status,
            priority,
            assignee,
            dueDate,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    message: "태스크를 찾을 수 없습니다"
                }
            });
        }

        res.json(transformTask(result.rows[0]));
    } catch (error) {
        console.error("태스크 수정 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "태스크 수정 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

// 5. PATCH /api/tasks/:id/status - 태스크 상태만 변경
router.patch("/:id/status", checkDatabaseConnection, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "status 필드는 필수입니다"
                }
            });
        }

        const validStatuses = ['backlog', 'todo', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "유효하지 않은 상태값입니다"
                }
            });
        }

        const updateQuery = `
            UPDATE tasks
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;

        const result = await query(updateQuery, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    message: "태스크를 찾을 수 없습니다"
                }
            });
        }

        res.json(transformTask(result.rows[0]));
    } catch (error) {
        console.error("태스크 상태 변경 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "태스크 상태 변경 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

// 6. DELETE /api/tasks/:id - 태스크 삭제
router.delete("/:id", checkDatabaseConnection, async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = "DELETE FROM tasks WHERE id = $1 RETURNING id";
        const result = await query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    message: "태스크를 찾을 수 없습니다"
                }
            });
        }

        res.json({
            success: true,
            message: "태스크가 삭제되었습니다"
        });
    } catch (error) {
        console.error("태스크 삭제 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "태스크 삭제 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

module.exports = router;

