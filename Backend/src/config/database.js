const mongoose = require("mongoose")

async function connectToDB(mongoUri, dbName = "interview-master") {
    try {
        await mongoose.connect(mongoUri, { dbName })
        console.log("Connected to Database")
    } catch (err) {
        console.error(err)
        throw err
    }
}

module.exports = connectToDB