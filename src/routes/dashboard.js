const express = require("express");
const { query } = require("../database/connection");

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
                message: "데이터베이스 서비스를 사용할 수 없습니다."
            }
        });
    }
};

const router = express.Router();

// 8. GET /api/dashboard/stats - 대시보드 통계 정보
router.get("/stats", checkDatabaseConnection, async (req, res) => {
    try {
        // 총 태스크 수
        const totalQuery = "SELECT COUNT(*) as count FROM tasks";
        const totalResult = await query(totalQuery);
        const totalTasks = parseInt(totalResult.rows[0].count);

        // 상태별 태스크 수
        const statusQuery = `
            SELECT status, COUNT(*) as count 
            FROM tasks 
            GROUP BY status
        `;
        const statusResult = await query(statusQuery);
        const tasksByStatus = {
            backlog: 0,
            todo: 0,
            'in-progress': 0,
            done: 0
        };
        statusResult.rows.forEach(row => {
            tasksByStatus[row.status] = parseInt(row.count);
        });

        // 우선순위별 태스크 수
        const priorityQuery = `
            SELECT priority, COUNT(*) as count 
            FROM tasks 
            GROUP BY priority
        `;
        const priorityResult = await query(priorityQuery);
        const tasksByPriority = {
            low: 0,
            medium: 0,
            high: 0
        };
        priorityResult.rows.forEach(row => {
            tasksByPriority[row.priority] = parseInt(row.count);
        });

        // 다가오는 마감일 (완료되지 않은 태스크 중 오늘 이후)
        const upcomingQuery = `
            SELECT id, title, due_date, assignee
            FROM tasks
            WHERE status != 'done' AND due_date >= CURRENT_DATE
            ORDER BY due_date ASC
            LIMIT 5
        `;
        const upcomingResult = await query(upcomingQuery);
        const upcomingDeadlines = upcomingResult.rows.map(task => ({
            id: task.id,
            title: task.title,
            dueDate: task.due_date,
            assignee: task.assignee
        }));

        res.json({
            totalTasks,
            tasksByStatus,
            tasksByPriority,
            upcomingDeadlines
        });
    } catch (error) {
        console.error("통계 조회 오류:", error);
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "통계 조회 중 오류가 발생했습니다",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            }
        });
    }
});

module.exports = router;

