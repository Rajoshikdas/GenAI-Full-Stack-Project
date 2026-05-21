const aiService = require('../services/ai.service')
const { resume, selfDescription, jobDescription } = require('../services/temp')

async function generate(req, res) {
  const { prompt } = req.body
  let response

  try {
    if (prompt && prompt.trim().length > 0) {
      response = await aiService.generateJson(prompt)
    } else {
      response = await aiService.generateFromResume({ resume, selfDescription, jobDescription })
    }

    const jsonResponse = response.json || null

    console.log('\n--- Gemini response start ---')
    if (jsonResponse) {
      console.log(JSON.stringify(jsonResponse, null, 2))
    } else {
      console.log('Invalid JSON from model, raw text:')
      console.log(response.text)
    }
    console.log('--- Gemini response end ---\n')

    if (!jsonResponse) {
      return res.status(502).json({
        message: 'AI did not return valid JSON',
        rawText: response.text
      })
    }

    return res.json(jsonResponse)
  } catch (err) {
    const isQuotaError = err?.status === 429 || String(err?.message).toLowerCase().includes('quota')
    
    if (isQuotaError) {
      console.warn('API quota exceeded, using mock response for development')
      const mockResponse = aiService.generateMockResponse()
      console.log('\n--- Mock response (development) ---')
      console.log(JSON.stringify(mockResponse.json, null, 2))
      console.log('--- End mock response ---\n')
      return res.json(mockResponse.json)
    }

    console.error('AI generate error:', err)
    return res.status(500).json({ message: 'AI service error', error: err?.message })
  }
}

module.exports = { generate }
