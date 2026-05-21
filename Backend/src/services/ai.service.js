const { GoogleGenAI } = require('@google/genai')

const apiKey = process.env.GOOGLE_GENAI_API_KEY
const ai = new GoogleGenAI({
  apiKey
})

const QUESTION_TARGETS = {
  technicalPerLevel: 6,
  behaviouralPerLevel: 5,
  projectPerLevel: 4
}

function ensureApiKey() {
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_API_KEY in environment')
  }
}

const interviewReportSchema = {
  type: 'object',
  properties: {
    matchScore: { type: 'number' },
    technicalSkills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          questions: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'intermediate', 'advanced'] },
          intention: { type: 'string' },
          answer: { type: 'string' },
          feedback: { type: 'string' }
        },
        required: ['questions', 'difficulty', 'intention', 'answer', 'feedback'],
        additionalProperties: false
      }
    },
    behaviouralSkills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          questions: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'intermediate', 'advanced'] },
          intention: { type: 'string' },
          answer: { type: 'string' },
          feedback: { type: 'string' }
        },
        required: ['questions', 'difficulty', 'intention', 'answer', 'feedback'],
        additionalProperties: false
      }
    },
    projectBasedQuestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          questions: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'intermediate', 'advanced'] },
          projectContext: { type: 'string' },
          intention: { type: 'string' },
          answer: { type: 'string' },
          feedback: { type: 'string' }
        },
        required: ['questions', 'difficulty', 'projectContext', 'intention', 'answer', 'feedback'],
        additionalProperties: false
      }
    },
    skillGaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          skill: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] }
        },
        required: ['skill', 'severity'],
        additionalProperties: false
      }
    },
    preparationTips: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'number' },
          focus: { type: 'string' },
          tasks: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['day', 'focus', 'tasks'],
        additionalProperties: false
      }
    }
  },
  required: ['matchScore', 'technicalSkills', 'behaviouralSkills', 'projectBasedQuestions', 'skillGaps', 'preparationTips'],
  additionalProperties: false
}

const DIFFICULTIES = ['easy', 'intermediate', 'advanced']

function normalizeDifficultyValue(value, index, total) {
  const normalized = String(value || '').trim().toLowerCase()

  if (['easy', 'beginner', 'basic', 'junior'].includes(normalized)) {
    return 'easy'
  }

  if (['intermediate', 'medium', 'moderate', 'mid'].includes(normalized)) {
    return 'intermediate'
  }

  if (['advanced', 'hard', 'difficult', 'expert', 'senior'].includes(normalized)) {
    return 'advanced'
  }

  const groupSize = Math.max(1, Math.ceil(total / DIFFICULTIES.length))
  const groupIndex = Math.min(DIFFICULTIES.length - 1, Math.floor(index / groupSize))

  return DIFFICULTIES[groupIndex]
}

function normalizeQuestionList(questions) {
  const list = Array.isArray(questions) ? questions : []

  return list.map((item, index) => ({
    questions: item.questions || item.question || '',
    difficulty: normalizeDifficultyValue(item.difficulty || item.level, index, list.length),
    projectContext: item.projectContext || item.context || '',
    intention: item.intention || '',
    answer: item.answer || '',
    feedback: item.feedback || ''
  }))
}

function limitQuestionsByDifficulty(questions, perLevel) {
  const normalized = normalizeQuestionList(questions)

  return DIFFICULTIES.flatMap((difficulty) => {
    const matchingQuestions = normalized.filter((item) => item.difficulty === difficulty)

    return matchingQuestions.slice(0, perLevel)
  })
}

function normalizeInterviewReport(report) {
  const technicalSkills = limitQuestionsByDifficulty(
    report.technicalSkills || report.technicalQuestions,
    QUESTION_TARGETS.technicalPerLevel
  )
  const behaviouralSkills = limitQuestionsByDifficulty(
    report.behaviouralSkills || report.behavioralSkills || report.behaviouralQuestions,
    QUESTION_TARGETS.behaviouralPerLevel
  )
  const projectBasedQuestions = limitQuestionsByDifficulty(
    report.projectBasedQuestions ||
    report.projectQuestions ||
    report.projectBased ||
    [],
    QUESTION_TARGETS.projectPerLevel
  )

  return {
    ...report,
    technicalSkills,
    behaviouralSkills,
    projectBasedQuestions
  }
}

function parseJsonResponse(text) {
  const content = String(text || '').trim()

  if (!content) {
    throw new Error('AI returned an empty response')
  }

  try {
    return JSON.parse(content)
  } catch (error) {
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw error
    }

    return JSON.parse(jsonMatch[0])
  }
}

async function generateJsonWithModels(prompt) {
  ensureApiKey()

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro']
  let lastError = null

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `${prompt}\n\nReturn only valid JSON. Do not include markdown, comments, or extra text.`,
        config: {
          responseMimeType: 'application/json'
        }
      })

      return parseJsonResponse(response.text)
    } catch (err) {
      lastError = err
      console.warn(`JSON generation failed with ${model}:`, err?.status, err?.message || err)
    }
  }

  throw lastError
}

function getRoleFocus(jobDescription) {
  const text = String(jobDescription || '').toLowerCase()
  const focus = []

  if (text.includes('python')) focus.push('Python')
  if (text.includes('numpy')) focus.push('NumPy')
  if (text.includes('pandas')) focus.push('Pandas')
  if (text.includes('scikit')) focus.push('Scikit-learn')
  if (text.includes('pytorch')) focus.push('PyTorch')
  if (text.includes('tensorflow') || text.includes('keras')) focus.push('TensorFlow/Keras')
  if (text.includes('nlp')) focus.push('NLP')
  if (text.includes('computer vision')) focus.push('Computer Vision')
  if (text.includes('llm')) focus.push('LLMs')
  if (text.includes('rag')) focus.push('RAG')
  if (text.includes('vector')) focus.push('Vector Databases')
  if (text.includes('fastapi')) focus.push('FastAPI')
  if (text.includes('flask')) focus.push('Flask')
  if (text.includes('docker')) focus.push('Docker')
  if (text.includes('mlflow')) focus.push('MLflow')

  return focus.length ? focus : ['Python', 'Machine Learning', 'Model Evaluation', 'APIs']
}

function fallbackQuestion({ topic, difficulty, type, index }) {
  if (type === 'behavioral') {
    const behavioralQuestions = {
      easy: [
        {
          questions: 'Tell me about yourself and why you are interested in this role.',
          intention: 'Assess motivation, communication clarity, and role fit.',
          answer: 'Use a concise story: your education, strongest AI/ML interests, relevant projects or work experience, and why this role connects with your goal. Keep it professional and role-focused.',
          feedback: 'Avoid reciting your resume line by line. Connect your background to the company role and end with why you are ready for the opportunity.'
        },
        {
          questions: 'Tell me about a time you faced a setback or disappointment. How did you handle it?',
          intention: 'Assess adaptability, resilience, and emotional maturity.',
          answer: 'Use STAR. Situation: describe the setback briefly. Task: explain what you needed to do next. Action: show how you stayed active, learned, took responsibility, or found another path. Result: mention what improved or what you learned.',
          feedback: 'Be honest but positive. Do not blame the market, college, teammates, or luck. Show ownership and forward movement.'
        },
        {
          questions: 'Describe a situation where you had to adjust to an unexpected change.',
          intention: 'Assess flexibility and attitude during uncertainty.',
          answer: 'Pick a real academic, internship, job, or project change. Explain what changed, how you reprioritized, what actions you took, and what outcome came from adapting quickly.',
          feedback: 'Show calm decision-making. A strong answer includes what you changed in your plan, not just that you accepted the situation.'
        },
        {
          questions: 'What are your strengths and one area you are actively improving?',
          intention: 'Assess self-awareness and coachability.',
          answer: 'Name one role-relevant strength, give a short example, then mention one improvement area with a concrete action plan.',
          feedback: 'Avoid fake weaknesses. Pick something manageable and show what you are doing to improve.'
        },
        {
          questions: 'Why should we hire you as a fresher for this role?',
          intention: 'Assess confidence, preparation, and role alignment.',
          answer: 'Focus on learning ability, project experience, discipline, and match with the JD. Mention that as a fresher you bring strong fundamentals, consistency, and willingness to execute.',
          feedback: 'Do not overclaim senior expertise. Be confident about potential, effort, and relevant preparation.'
        }
      ],
      intermediate: [
        {
          questions: 'Tell me about a time you noticed a problem or inefficiency and fixed it without being asked.',
          intention: 'Assess initiative and ownership.',
          answer: 'Use STAR. Situation: manual or inefficient process. Task: explain the improvement opportunity. Action: describe what you built or changed. Result: quantify time saved, errors reduced, or clarity improved if possible.',
          feedback: 'Use "I" for your contribution. Recruiters want to hear what you personally noticed and executed.'
        },
        {
          questions: 'Tell me about a time you had to balance multiple high-priority tasks at once.',
          intention: 'Assess time management and discipline.',
          answer: 'Explain competing responsibilities, how you prioritized, how you scheduled deep work, and how you tracked progress. End with the result.',
          feedback: 'Avoid saying only "I worked hard." Show a system: calendar, task breakdown, deadlines, or daily routines.'
        },
        {
          questions: 'Describe a time you disagreed with a teammate or classmate. How did you resolve it?',
          intention: 'Assess teamwork, conflict resolution, and professionalism.',
          answer: 'Use a calm example. Explain the disagreement, how you listened, compared options with data or constraints, and reached a decision.',
          feedback: 'Do not make the teammate look bad. Show maturity, listening, and a practical decision process.'
        },
        {
          questions: 'Tell me about a time when a team member was not contributing enough. What did you do?',
          intention: 'Assess collaboration, accountability, and communication.',
          answer: 'Describe how you first understood the reason, communicated clearly, redistributed work if needed, and kept the project moving.',
          feedback: 'Avoid sounding judgmental. Strong answers show empathy plus accountability.'
        },
        {
          questions: 'Give me an example of solving a problem with limited resources, limited time, or incomplete information.',
          intention: 'Assess practical problem solving under constraints.',
          answer: 'Describe the constraint, the options you considered, the simplest workable approach you chose, and how you validated the result.',
          feedback: 'This should sound like real-world judgment, not a perfect textbook solution.'
        }
      ],
      advanced: [
        {
          questions: 'Describe a time you had to deliver under a tight deadline when things were going wrong.',
          intention: 'Assess pressure handling, ownership, and execution under stress.',
          answer: 'Use STAR. Show how you identified the critical path, reduced scope if needed, communicated risk early, and delivered the most important outcome.',
          feedback: 'Do not pretend there was no pressure. Strong answers show prioritization, communication, and recovery.'
        },
        {
          questions: 'Tell me about a time you received critical feedback. How did you respond?',
          intention: 'Assess coachability and growth mindset.',
          answer: 'Mention the feedback, your initial reflection, what you changed, and how the result improved later.',
          feedback: 'Avoid defensive language. Recruiters value candidates who learn quickly.'
        },
        {
          questions: 'Tell me about a time you had to convince others to accept your idea.',
          intention: 'Assess persuasion, communication, and stakeholder thinking.',
          answer: 'Explain the idea, why others were unsure, how you used evidence or a prototype, and how you handled concerns.',
          feedback: 'Show influence without arrogance. Evidence, listening, and compromise matter.'
        },
        {
          questions: 'Describe a situation where you took responsibility for a mistake or missed expectation.',
          intention: 'Assess integrity and accountability.',
          answer: 'Choose a real but not catastrophic example. Explain what happened, what you owned, how you fixed it, and what safeguard you added.',
          feedback: 'Do not blame others. The key is ownership and prevention.'
        },
        {
          questions: 'Where do you see yourself growing in the next two years, and how does this role fit that plan?',
          intention: 'Assess career clarity and long-term motivation.',
          answer: 'Connect your plan to becoming stronger in production AI/ML, data pipelines, model evaluation, deployment, and collaboration with teams.',
          feedback: 'Keep it realistic for a fresher. Show ambition plus willingness to learn fundamentals deeply.'
        }
      ]
    }

    const items = behavioralQuestions[difficulty]
    return {
      ...items[index % items.length],
      difficulty,
      projectContext: ''
    }
  }

  const prefix = {
    easy: 'Explain',
    intermediate: 'How would you implement and validate',
    advanced: 'How would you design, optimize, and defend'
  }[difficulty]

  const question = type === 'project'
    ? `${prefix} a project scenario involving ${topic} for this role, including your approach, tradeoffs, and expected outcome.`
    : `${prefix} ${topic} in the context of this role, and describe how you would apply it in a real task.`

  return {
    questions: question,
    difficulty,
    projectContext: type === 'project' ? `Project scenario ${index + 1} for ${topic}` : '',
    intention: `Assess ${difficulty} level understanding of ${topic} for the target role.`,
    answer: `A strong answer should define the concept, connect it to the job description, describe implementation steps, mention validation or metrics, and give a concrete example from coursework, internship, or projects.`,
    feedback: `Be specific. Mention tools, data flow, metrics, tradeoffs, and your personal contribution instead of giving a generic definition.`
  }
}

function buildFallbackQuestions({ jobDescription, perLevel, type }) {
  const topics = getRoleFocus(jobDescription)

  return DIFFICULTIES.flatMap((difficulty) => {
    return Array.from({ length: perLevel }, (_, index) => {
      const topic = topics[index % topics.length]

      return fallbackQuestion({
        topic,
        difficulty,
        type,
        index
      })
    })
  })
}

function completeQuestionSet({ questions, jobDescription, perLevel, type }) {
  const normalized = normalizeQuestionList(questions)
  const fallback = buildFallbackQuestions({ jobDescription, perLevel, type })

  return DIFFICULTIES.flatMap((difficulty) => {
    const existing = normalized.filter((item) => item.difficulty === difficulty)
    const extra = fallback.filter((item) => item.difficulty === difficulty)

    return [...existing, ...extra].slice(0, perLevel)
  })
}

function buildQuestionPrompt({ resume, selfDescription, jobDescription, section, perLevel, type }) {
  if (type === 'behavioral') {
    return `Generate HR behavioral interview questions for this candidate and target role.

Candidate resume:
${resume}

Self description:
${selfDescription}

Target job description:
${jobDescription}

Return a JSON array with exactly ${perLevel * DIFFICULTIES.length} objects: ${perLevel} easy, ${perLevel} intermediate, and ${perLevel} advanced.

Each object must have:
- questions: string
- difficulty: "easy", "intermediate", or "advanced"
- intention: string
- answer: string
- feedback: string

These must be recruiter/HR behavioral questions, not technical questions.

Question categories to cover:
- adaptability and resilience
- problem solving and initiative
- teamwork and conflict resolution
- handling pressure and deadlines
- ownership and accountability
- communication and persuasion
- learning attitude and career motivation
- ethics, honesty, and professionalism

Difficulty guidance:
- Easy: common HR screening questions about motivation, strengths, self-awareness, setbacks, and basic communication.
- Intermediate: situation-based STAR questions about initiative, teamwork, disagreement, multitasking, and limited resources.
- Advanced: deeper pressure, accountability, feedback, persuasion, ambiguity, and long-term growth questions.

Answer guidance:
- Every answer should coach the candidate to use the STAR method: Situation, Task, Action, Result.
- Where possible, tailor advice to the candidate background: final-year student, tough placement season, local operational/CA-office work, automation/OCR initiative, college capstone, upskilling at night, and fresher AI/ML role.
- Use HR language. Do not ask about Python syntax, model architecture, APIs, vector databases, or technical implementation in this behavioral section.
- Feedback should explain what the candidate should emphasize and what mistake to avoid.

Avoid duplicate questions and avoid technical interview wording.`
  }

  return `Generate ${section} interview questions for this candidate and target role.

Candidate resume:
${resume}

Self description:
${selfDescription}

Target job description:
${jobDescription}

Return a JSON array with exactly ${perLevel * DIFFICULTIES.length} objects: ${perLevel} easy, ${perLevel} intermediate, and ${perLevel} advanced.

Each object must have:
- questions: string
- difficulty: "easy", "intermediate", or "advanced"
- intention: string
- answer: string
- feedback: string
${type === 'project' ? '- projectContext: string' : ''}

Difficulty quality:
- Easy: fundamentals, direct resume claims, basic tools, terminology, and what the candidate personally did.
- Intermediate: implementation, debugging, tradeoffs, integration, data handling, metrics, and real constraints.
- Advanced: architecture, scalability, security, failure cases, optimization, deployment, and defending design decisions.

Make every question concrete for this AI/ML role. Use role topics like Python, NumPy, Pandas, Scikit-learn, PyTorch/TensorFlow, NLP, Computer Vision, LLMs, RAG, vector databases, FastAPI/Flask, Git, Linux, Docker, MLflow, metrics, latency, and data pipelines when relevant.
Avoid duplicate and generic questions.`
}

function buildMetaFallback(jobDescription) {
  const focus = getRoleFocus(jobDescription)

  return {
    matchScore: 75,
    skillGaps: focus.slice(0, 5).map((skill, index) => ({
      skill,
      severity: index < 2 ? 'medium' : 'low'
    })),
    preparationTips: [
      {
        day: 1,
        focus: 'ML fundamentals and Python workflow',
        tasks: ['Revise supervised learning basics', 'Practice NumPy and Pandas data cleaning', 'Review model evaluation metrics']
      },
      {
        day: 2,
        focus: 'NLP, LLMs, and RAG',
        tasks: ['Review embeddings and vector search', 'Prepare a LangChain or Hugging Face project explanation', 'Practice explaining retrieval quality']
      },
      {
        day: 3,
        focus: 'Deployment and production readiness',
        tasks: ['Revise FastAPI or Flask model APIs', 'Review latency and error handling', 'Prepare Git/GitHub workflow examples']
      }
    ]
  }
}

function normalizeMetaReport(report, jobDescription) {
  const fallback = buildMetaFallback(jobDescription)
  const skillGaps = Array.isArray(report?.skillGaps) && report.skillGaps.length
    ? report.skillGaps
    : fallback.skillGaps
  const preparationTips = Array.isArray(report?.preparationTips) && report.preparationTips.length
    ? report.preparationTips
    : fallback.preparationTips

  return {
    matchScore: Number(report?.matchScore) || fallback.matchScore,
    skillGaps: skillGaps.map((gap) => {
      const severity = String(gap?.severity || '').toLowerCase()

      return {
        skill: gap?.skill || 'Role-specific skill',
        severity: ['low', 'medium', 'high'].includes(severity) ? severity : 'medium'
      }
    }),
    preparationTips: preparationTips.map((tip, index) => {
      const parsedDay = Number.parseInt(String(tip?.day || index + 1).replace(/[^\d]/g, ''), 10)
      const tasks = Array.isArray(tip?.tasks)
        ? tip.tasks
        : [tip?.task, tip?.description, tip?.tip].filter(Boolean)

      return {
        day: Number.isFinite(parsedDay) && parsedDay > 0 ? parsedDay : index + 1,
        focus: tip?.focus || tip?.title || `Preparation Day ${index + 1}`,
        tasks: tasks.length ? tasks.map((task) => String(task)) : fallback.preparationTips[index % fallback.preparationTips.length].tasks
      }
    })
  }
}

function truncateText(value, maxLength) {
  const text = String(value || '').trim()

  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength)
}

function isRetryableModelError(err) {
  const status = err?.status
  const message = String(err?.message || '')
  return (
    status === 429 ||
    status === 503 ||
    status === 404 ||
    message.includes('quota') ||
    message.includes('unavailable') ||
    message.includes('not found') ||
    message.includes('not available') ||
    message.includes('high demand')
  )
}

const interviewQuestionSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      intention: { type: 'string' },
      answer: { type: 'string' }
    },
    required: ['question', 'intention', 'answer'],
    additionalProperties: false
  }
}

const optimizedResumeSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    headline: { type: 'string' },
    contact: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        phone: { type: 'string' },
        location: { type: 'string' },
        linkedin: { type: 'string' },
        portfolio: { type: 'string' }
      },
      required: ['email', 'phone', 'location', 'linkedin', 'portfolio'],
      additionalProperties: false
    },
    professionalSummary: { type: 'string' },
    coreSkills: {
      type: 'array',
      items: { type: 'string' }
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          company: { type: 'string' },
          location: { type: 'string' },
          dates: { type: 'string' },
          bullets: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['role', 'company', 'location', 'dates', 'bullets'],
        additionalProperties: false
      }
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          technologies: {
            type: 'array',
            items: { type: 'string' }
          },
          bullets: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['name', 'description', 'technologies', 'bullets'],
        additionalProperties: false
      }
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          degree: { type: 'string' },
          institution: { type: 'string' },
          location: { type: 'string' },
          dates: { type: 'string' }
        },
        required: ['degree', 'institution', 'location', 'dates'],
        additionalProperties: false
      }
    },
    certifications: {
      type: 'array',
      items: { type: 'string' }
    },
    atsKeywords: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: [
    'name',
    'headline',
    'contact',
    'professionalSummary',
    'coreSkills',
    'experience',
    'projects',
    'education',
    'certifications',
    'atsKeywords'
  ],
  additionalProperties: false
}

async function generateJson(prompt) {
  ensureApiKey()

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro']
  let lastError = null

  for (const model of models) {
    let retries = 2
    let retryCount = 0

    while (retryCount <= retries) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${prompt}\n\nReturn only a JSON array of objects. Each object must contain exactly these keys: \"question\", \"intention\", and \"answer\`. Do not include any extra text outside the JSON array.`,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: interviewQuestionSchema
          }
        })

        const text = response.text?.trim() ?? ''
        let parsed = null
        try {
          parsed = JSON.parse(text)
        } catch (err) {
          parsed = null
        }

        return {
          ...response,
          modelUsed: model,
          text,
          json: parsed
        }
      } catch (err) {
        lastError = err
        
        if (!isRetryableModelError(err)) {
          console.warn(`Model ${model} error (non-retryable):`, err?.message || err)
          break
        }

        retryCount++
        if (retryCount <= retries) {
          const delayMs = 1000 * (retryCount + 1)
          console.warn(`Model ${model} failed (attempt ${retryCount}/${retries}), retrying in ${delayMs}ms:`, err?.status, err?.message)
          await new Promise(resolve => setTimeout(resolve, delayMs))
        } else {
          console.warn(`Model ${model} failed after ${retries} retries:`, err?.status, err?.message)
          break
        }
      }
    }
  }

  throw lastError
}

async function generateFromResume({ resume, selfDescription, jobDescription }) {
  const prompt = `Generate an interview question list based on the candidate resume, self description, and job description below.\n\nCandidate resume:\n${resume}\n\nSelf description:\n${selfDescription}\n\nJob description:\n${jobDescription}\n\nReturn only a JSON array of items with the keys: question, intention, answer. Do not include any other text.`
  return generateJson(prompt)
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const resumeText = truncateText(resume, 8000)
  const selfText = truncateText(selfDescription, 2000)
  const jobText = truncateText(jobDescription, 6000)

  const metaPrompt = `Analyze this candidate for the target role and return a JSON object with:
- matchScore: number from 0 to 100
- skillGaps: array of 3 to 6 objects with skill and severity ("low", "medium", "high")
- preparationTips: array of 3 to 5 objects with day, focus, and tasks array

Candidate resume:
${resumeText}

Self description:
${selfText}

Target job description:
${jobText}`

  const technicalPrompt = buildQuestionPrompt({
    resume: resumeText,
    selfDescription: selfText,
    jobDescription: jobText,
    section: 'technical',
    perLevel: QUESTION_TARGETS.technicalPerLevel,
    type: 'technical'
  })

  const behaviouralPrompt = buildQuestionPrompt({
    resume: resumeText,
    selfDescription: selfText,
    jobDescription: jobText,
    section: 'behavioral',
    perLevel: QUESTION_TARGETS.behaviouralPerLevel,
    type: 'behavioral'
  })

  const projectPrompt = buildQuestionPrompt({
    resume: resumeText,
    selfDescription: selfText,
    jobDescription: jobText,
    section: 'project-based',
    perLevel: QUESTION_TARGETS.projectPerLevel,
    type: 'project'
  })

  const [metaResult, technicalResult, behaviouralResult, projectResult] = await Promise.allSettled([
    generateJsonWithModels(metaPrompt),
    generateJsonWithModels(technicalPrompt),
    generateJsonWithModels(behaviouralPrompt),
    generateJsonWithModels(projectPrompt)
  ])

  if (metaResult.status === 'rejected') {
    console.warn('Metadata generation failed, using fallback:', metaResult.reason?.message || metaResult.reason)
  }

  if (technicalResult.status === 'rejected') {
    console.warn('Technical question generation failed, using fallback:', technicalResult.reason?.message || technicalResult.reason)
  }

  if (behaviouralResult.status === 'rejected') {
    console.warn('Behavioral question generation failed, using fallback:', behaviouralResult.reason?.message || behaviouralResult.reason)
  }

  if (projectResult.status === 'rejected') {
    console.warn('Project question generation failed, using fallback:', projectResult.reason?.message || projectResult.reason)
  }

  const meta = normalizeMetaReport(
    metaResult.status === 'fulfilled' ? metaResult.value : null,
    jobText
  )

  return {
    ...meta,
    technicalSkills: completeQuestionSet({
      questions: technicalResult.status === 'fulfilled' ? technicalResult.value : [],
      jobDescription: jobText,
      perLevel: QUESTION_TARGETS.technicalPerLevel,
      type: 'technical'
    }),
    behaviouralSkills: completeQuestionSet({
      questions: behaviouralResult.status === 'fulfilled' ? behaviouralResult.value : [],
      jobDescription: jobText,
      perLevel: QUESTION_TARGETS.behaviouralPerLevel,
      type: 'behavioral'
    }),
    projectBasedQuestions: completeQuestionSet({
      questions: projectResult.status === 'fulfilled' ? projectResult.value : [],
      jobDescription: jobText,
      perLevel: QUESTION_TARGETS.projectPerLevel,
      type: 'project'
    })
  }
}

async function generateOptimizedResume({ resume, selfDescription, jobDescription }) {
  ensureApiKey()

  const prompt = `Create an ATS-friendly, professionally written resume tailored to the target job description.

Use the candidate's existing resume and self description as the source of truth. Do not invent employers, degrees, dates, certifications, links, phone numbers, email addresses, metrics, or technologies that are not supported by the source material. If a detail is missing, return an empty string or an empty array for that field.

Optimize wording toward the job description by:
- matching relevant keywords naturally
- using concise accomplishment-focused bullets
- keeping a single-column ATS-safe structure
- avoiding graphics, tables, columns, icons, or rating bars
- preserving truthful candidate experience

Candidate resume:
${resume}

Self description:
${selfDescription}

Target job description:
${jobDescription}

Return only valid JSON matching the schema.`

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro']
  let lastError = null

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: optimizedResumeSchema
        }
      })

      return JSON.parse(response.text)
    } catch (err) {
      lastError = err

      if (!isRetryableModelError(err)) {
        break
      }
    }
  }

  throw lastError
}

function generateMockResponse() {
  const mockReport = {
    matchScore: 82,
    technicalSkills: [
      {
        questions: 'You mentioned migrating a legacy monolithic platform to a React/Node.js microservices architecture. Can you elaborate on the key architectural decisions?',
        intention: 'To assess architectural design skills and experience with system modernization.',
        answer: 'Expected to cover service decomposition, API design, data migration strategies, and technical challenges. Look for understanding of trade-offs between monolith and microservices.',
        feedback: 'Strong response if candidate discusses messaging patterns, service boundaries, and deployment strategies.'
      },
      {
        questions: 'How do you approach performance optimization in React applications at scale?',
        intention: 'To evaluate knowledge of React performance optimization techniques.',
        answer: 'Expected to discuss code splitting, lazy loading, memoization, suspense, and profiling tools.',
        feedback: 'Good answer should include practical examples from their experience.'
      },
      {
        questions: 'Describe your experience with Docker and containerization in production environments.',
        intention: 'To confirm hands-on experience with containerization and deployment.',
        answer: 'Expected to cover Docker concepts, multi-stage builds, container orchestration, and debugging containerized applications.',
        feedback: 'Look for specific examples of production issues they solved using Docker.'
      }
    ],
    behaviouralSkills: [
      {
        questions: 'You mentored junior developers and achieved 15% sprint velocity improvement. Describe your mentoring approach.',
        intention: 'To assess leadership and team development skills.',
        answer: 'Expected to discuss code reviews, pair programming, knowledge sharing sessions, and how success was measured.',
        feedback: 'Strong answer should include specific metrics and examples of developer growth.'
      },
      {
        questions: 'Tell us about a time you disagreed with a technical decision. How did you handle it?',
        intention: 'To evaluate communication, collaboration, and conflict resolution skills.',
        answer: 'Expected to show ability to voice concerns professionally, listen to others, and reach consensus.',
        feedback: 'Look for maturity in handling disagreements and focus on technical merits rather than personal opinions.'
      },
      {
        questions: 'How do you approach learning and staying updated with new technologies?',
        intention: 'To assess commitment to continuous learning and professional development.',
        answer: 'Expected to mention reading blogs, contributing to open source, attending conferences, or side projects.',
        feedback: 'Excellent if they show passion and structured approach to learning.'
      }
    ],
    skillGaps: [
      {
        skill: 'GraphQL expertise - Resume mentions GraphQL but limited examples of complex implementations',
        severity: 'medium'
      },
      {
        skill: 'Mobile development experience - No mention of React Native or mobile platforms',
        severity: 'low'
      },
      {
        skill: 'Kubernetes/Advanced DevOps - Docker mentioned but no specific Kubernetes experience noted',
        severity: 'medium'
      }
    ],
    preparationTips: [
      {
        day: 1,
        focus: 'System Design and Architecture',
        tasks: [
          'Review microservices architecture patterns',
          'Practice designing scalable systems',
          'Prepare examples from your AWS infrastructure optimization'
        ]
      },
      {
        day: 2,
        focus: 'React and Frontend Performance',
        tasks: [
          'Deep dive into React hooks and performance optimization',
          'Review code splitting and lazy loading implementations',
          'Prepare examples of high-traffic applications you worked on'
        ]
      },
      {
        day: 3,
        focus: 'Backend and DevOps',
        tasks: [
          'Review Node.js best practices and REST API design',
          'Prepare CI/CD pipeline examples',
          'Study AWS services mentioned in job description'
        ]
      },
      {
        day: 4,
        focus: 'Behavioral and Soft Skills',
        tasks: [
          'Prepare STAR method answers for leadership questions',
          'Review the company culture and prepare alignment questions',
          'Practice discussing collaboration and conflict resolution scenarios'
        ]
      }
    ]
  };

  return {
    modelUsed: 'mock-development',
    text: JSON.stringify(mockReport),
    json: mockReport
  };
}

module.exports = { generateJson, generateFromResume, generateInterviewReport, generateOptimizedResume, generateMockResponse }
