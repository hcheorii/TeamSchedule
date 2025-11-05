const fs = require("fs");
const path = require("path");
const { connectDB, query, closeConnection } = require("./connection");

async function initializeDatabase() {
    try {
        console.log("데이터베이스 초기화를 시작합니다...");

        // 데이터베이스 연결
        await connectDB();

        // schema.sql 파일 읽기
        const schemaPath = path.join(__dirname, "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");

        // SQL 실행
        await query(schema);

        console.log("✅ 데이터베이스 초기화가 완료되었습니다.");
    } catch (error) {
        console.error("❌ 데이터베이스 초기화 실패:", error);
        throw error;
    } finally {
        await closeConnection();
    }
}

// 직접 실행된 경우에만 초기화 수행
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log("프로세스를 종료합니다.");
            process.exit(0);
        })
        .catch((error) => {
            console.error("초기화 중 오류 발생:", error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };

