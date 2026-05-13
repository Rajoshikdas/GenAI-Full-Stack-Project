require("dotenv").config()
const mongoose = require("mongoose")
const app = require("./src/app")
const connectToDB = require("./src/config/database")

const mongoUri = process.env.MONGO_URI
const mongoDbName = process.env.MONGO_DB_NAME || "interview-master"

if (!mongoUri) {
    console.error("Missing MONGO_URI in .env")
    process.exit(1)
}

mongoose.connect(mongoUri, {
    dbName: mongoDbName,
})
.then(() => {
    console.log("Connected to MongoDB")
    app.listen(3000, () => {
        console.log("Server is running on port 3000")
    })
})
.catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
})