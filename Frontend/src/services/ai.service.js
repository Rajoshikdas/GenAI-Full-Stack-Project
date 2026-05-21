const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
  matchScore: z.number().describe(
    "A score between 0 and 100 indicating how well the candidate matches the job requirements based on their resume, self-description, and the job description."
  ),
  technicalQuestions: z
    .array(
      z.object({
        questions: z.string().describe("The interview question can be asked in the interview"),
        intention: z
          .string()
          .describe(
            "The intention behind asking the question, what the interviewer is trying to assess by asking this question"
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take, etc."
          ),
        feedback: z
          .string()
          .describe(
            "What the candidate did wrong in their answer, what they missed, what they could have done better, etc."
          )
      })
    )
    .describe(
      "The technical skills part of the interview report, which focuses on assessing the candidate's technical abilities and problem-solving skills."
    ),
  behaviouralQuestions: z
    .array(
      z.object({
        questions: z.string().describe("The interview question can be asked in the interview"),
        intention: z
          .string()
          .describe(
            "The intention behind asking the question, what the interviewer is trying to assess by asking this question"
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take, etc."
          ),
        feedback: z
          .string()
          .describe(
            "What the candidate did wrong in their answer, what they missed, what they could have done better, etc."
          )
      })
    )
    .describe(
      "The behavioural skills part of the interview report, which focuses on assessing the candidate's soft skills, cultural fit, and interpersonal abilities."
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe("The specific skill that the candidate is lacking or needs improvement in"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity level of the skill gap, indicating how critical it is for the candidate to improve in this area"
          )
      })
    )
    .describe(
      "The skill gaps part of the interview report, which identifies areas where the candidate lacks necessary skills or knowledge."
    ),
  preparationPlane: z
    .array(
      z.object({
        day: z.number().describe(
          "The specific day in the preparation timeline, indicating when the candidate should focus on this particular tip"
        ),
        focus: z
          .string()
          .describe(
            "The main area or topic that the candidate should concentrate on during their preparation for this day"
          ),
        tasks: z
          .array(z.string())
          .describe(
            "The specific tasks or activities that the candidate should undertake to effectively prepare for the interview on this day"
          )
      })
    )
    .describe(
      "The preparation plan part of the interview report, which provides a structured plan for candidates to follow in their interview preparation."
    ),
  title: z.string().describe("The title of the job for which the interview report is generated"),
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
 
  const prompt = `Generate a JSON interview report based on the following information:
                      Resume:${resume}
                      Self Description:${selfDescription}
                      Job Description:${jobDescription}
                      Return only valid JSON that matches the following schema. Do not include any extra text.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(interviewReportSchema)
    }
  });

  return JSON.parse(response.text)
}

module.exports = generateInterviewReport;
