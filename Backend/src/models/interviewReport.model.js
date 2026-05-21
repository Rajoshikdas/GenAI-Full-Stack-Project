const mongoose = require("mongoose")

const interviewReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    resume: {
      type: String,
      default: ""
    },
    selfDescription: {
      type: String,
      default: ""
    },
    jobDescription: {
      type: String,
      required: true
    },
    matchScore: {
      type: Number,
      default: null
    },
    technicalSkills: [
      {
        questions: String,
        difficulty: {
          type: String,
          enum: ["easy", "intermediate", "advanced"]
        },
        intention: String,
        answer: String,
        feedback: String
      }
    ],
    behaviouralSkills: [
      {
        questions: String,
        difficulty: {
          type: String,
          enum: ["easy", "intermediate", "advanced"]
        },
        intention: String,
        answer: String,
        feedback: String
      }
    ],
    projectBasedQuestions: [
      {
        questions: String,
        difficulty: {
          type: String,
          enum: ["easy", "intermediate", "advanced"]
        },
        projectContext: String,
        intention: String,
        answer: String,
        feedback: String
      }
    ],
    skillGaps: [
      {
        skill: String,
        severity: {
          type: String,
          enum: ["low", "medium", "high"]
        }
      }
    ],
    preparationTips: [
      {
        day: {
          type: Number,
          set: (value) => {
            const parsed = Number.parseInt(String(value || "").replace(/[^\d]/g, ""), 10)
            return Number.isFinite(parsed) ? parsed : undefined
          }
        },
        focus: String,
        tasks: [String]
      }
    ]
  },
  {
    timestamps: true
  }
)

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)

module.exports = interviewReportModel
