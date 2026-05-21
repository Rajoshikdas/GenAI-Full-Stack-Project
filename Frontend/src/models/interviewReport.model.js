const mongoose = require('mongoose');


/**
 * -job description: string
 * -resume text : string
 * -self description : string
 * 
 * -match score : number
 * 
 * - technical skills : 
 *    [{
 *     question : "",
 *     intention : "",
 *     answer : "",
 *     feedback : ""
 *     }]
 * - Behavioural skills :
 *   [{
 *     question : "",
 *     intention : "",
 *     answer : "",
 *     feedback : ""
 *     }]
 * - skills gaps : [{
 *       skill : "",
 *       severity : {
 *        type : String,
 *        enum : ["low","medium","high"]
 * }
 * }]
 * - preparation tips : [{
 *           day: number,
 *           focus : string,
 *           tasks : [string]
 * }]
 * 
 */

const technicalSkillSchema = new mongoose.Schema({
    question : {
        type : String,
        required : [true, "Question is required"]
    },
    intention : {
        type : String,
        required : [true, "Intention is required"]
    },
    answer : {
        type : String,
        required : [true, "Answer is required"]
    },
    feedback : {
        type : String,
        required : [true, "Feedback is required"]
    }
}, {
  _id : false
});

const behaviouralSkillSchema = new mongoose.Schema({
    question : {
        type : String,
        required : [true, "Question is required"]
    },
    intention : {
        type : String,
        required : [true, "Intention is required"]
    },
    answer : {
        type : String,
        required : [true, "Answer is required"]
    },
    feedback : {
        type : String,
        required : [true, "Feedback is required"]
    }, {
  _id : false
    }
});

const skillGapSchema = new mongoose.Schema({
    skill : {
        type : String,
        required : [true, "Skill is required"]
    },
    severity : {
        type : String,
        enum : ["low", "medium", "high"]
        required : [true, "Severity is required"]
    }
}, {
  _id : false
});

const preparationTipSchema = new mongoose.Schema({
    day : {
        type : Number,
        required : [true, "Day is required"]
    },
    focus : {
        type : String,
        required : [true, "Focus is required"]
    },
    tasks : [{
        type : String,
        required : [true, "Task is required"]
    }]
}, {
  _id : false
});

const interviewReportSchema = new mongoose.Schema({
    jobDescription : {
      type : String, 
      required : [true, "Job description is required"]
    },
    resume : {
      type : String,
    },
    matchScore : {
        type : Number,
        min : 0,
        max : 100
    },
    technicalSkills : [technicalSkillSchema],
    behaviouralSkills : [behaviouralSkillSchema],
    skillGaps : [skillGapSchema],
    preparationTips : [preparationTipSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
        title : {   
        type : String,
        required : [true, "Job title is required"]
    }
}, {
    timestamps : true
})

const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = InterviewReport;