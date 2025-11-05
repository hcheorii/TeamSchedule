const express = require("express");
const cors = require("cors");
require("dotenv").config();

const tasksRoutes = require("./routes/tasks");
const dashboardRoutes = require("./routes/dashboard");
const { connectDB } = require("./database/connection");

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(
    cors({
        origin: true, // 모든 오리진 허용 (개발용)
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-Frame-Options",
        ],
        exposedHeaders: ["Content-Type", "Content-Disposition"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use("/api/tasks", tasksRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 기본 라우트
app.get("/", (req, res) => {
    res.json({
        message: "Team Scheduler API 서버",
        version: "1.0.0",
        endpoints: {
            "GET /api/tasks": "태스크 목록 조회",
            "POST /api/tasks": "태스크 생성",
            "GET /api/tasks/:id": "태스크 상세 조회",
            "PUT /api/tasks/:id": "태스크 수정",
            "PATCH /api/tasks/:id/status": "태스크 상태 변경",
            "DELETE /api/tasks/:id": "태스크 삭제",
            "GET /api/tasks/by-date-range": "날짜 범위로 태스크 조회",
            "GET /api/dashboard/stats": "대시보드 통계"
        },
    });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "서버 내부 오류가 발생했습니다.",
        message:
            process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// 404 핸들러
app.use("*", (req, res) => {
    res.status(404).json({ error: "요청한 리소스를 찾을 수 없습니다." });
});

// 서버 시작
async function startServer() {
    // 먼저 서버를 시작하고 데이터베이스는 나중에 연결 시도
    app.listen(PORT, () => {
        console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
        console.log(`API 문서: http://localhost:${PORT}`);
    });

    // 데이터베이스 연결 시도 (실패해도 서버는 계속 실행)
    try {
        await connectDB();
        console.log("데이터베이스 연결 성공");

        // 데이터베이스 초기화 시도
        try {
            const { initializeDatabase } = require("./database/init");
            await initializeDatabase();
            console.log("데이터베이스 테이블 초기화 완료");
        } catch (initError) {
            console.warn(
                "데이터베이스 초기화 건너뜀 (이미 초기화되었거나 권한 없음):",
                initError.message
            );
        }
    } catch (error) {
        console.error("데이터베이스 연결 실패:", error);
        console.log(
            "데이터베이스 없이 서버가 실행됩니다. Railway에서 PostgreSQL 서비스를 추가해주세요."
        );
        console.log(
            "환경변수 확인: DATABASE_URL =",
            process.env.DATABASE_URL ? "설정됨" : "설정되지 않음"
        );
    }
}

startServer();

module.exports = app;

