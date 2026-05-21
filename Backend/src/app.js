const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: "https://gen-ai-full-stack-project-rajoshikdas-projects.vercel.app/",
        credentials: true,
    })
);

// ROUTES
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// HEALTH CHECK
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend running successfully",
    });
});

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);

    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;