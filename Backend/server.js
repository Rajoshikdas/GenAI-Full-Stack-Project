require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME || "interview-master";

const PORT = process.env.PORT || 3000;

if (!mongoUri) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
}

async function startServer() {
    try {
        // CONNECT DATABASE
        await connectToDB(mongoUri, mongoDbName);

        console.log("Connected to MongoDB");

        // START SERVER
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

startServer();