/**
 * Official Google GenAI SDK integration for generating structured board exam quiz questions.
 * Handles schema enforcement, rigorous error classification, and model fallback management.
 */

const path = require('path');
const { GoogleGenAI, Type } = require('@google/genai');
const { validateQuizQuestions } = require('./validator');

// Load .env once if not already initialized
if (!process.env.GEMINI_API_KEY) {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
}

// Default model recommendation from Google AI
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/**
 * Returns trimmed API key from environment without quotes.
 */
function getApiKey() {
  const raw = process.env.GEMINI_API_KEY;
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/^["']|["']$/g, '');
}

/**
 * Returns whether a valid API key string is present in environment variables.
 */
function isApiKeyConfigured() {
  const key = getApiKey();
  return key.length > 0 && !key.startsWith('YOUR_');
}

/**
 * Rigorously classifies Gemini API errors into clear, actionable categories.
 * Distinguishes: missing key, invalid key, permission/project denied, quota exceeded, and unsupported models.
 */
function classifyGeminiError(error, modelName = DEFAULT_MODEL) {
  if (!isApiKeyConfigured()) {
    return {
      status: 503,
      code: 'API_KEY_MISSING',
      message: 'Gemini API key is not configured in .env. Please add GEMINI_API_KEY to your .env file.'
    };
  }

  const message = error ? (error.message || String(error)) : 'Unknown error';
  const rawCode = error && (error.status || error.code || error.statusCode);

  // 1. Invalid API Key
  if (rawCode === 400 && /API_KEY_INVALID|API key not valid|invalid api key/i.test(message) ||
      rawCode === 401 ||
      /API_KEY_INVALID/i.test(message)) {
    return {
      status: 401,
      code: 'API_KEY_INVALID',
      message: 'Invalid Gemini API key (HTTP 401). The key in .env is not recognized by Google AI Studio. Please verify or re-generate your key.'
    };
  }

  // 2. Permission Denied / Project Restrictions
  if (rawCode === 403 ||
      /PERMISSION_DENIED|denied access|access denied|forbidden|Consumer has been suspended/i.test(message)) {
    return {
      status: 403,
      code: 'PERMISSION_DENIED',
      message: 'Access Denied (HTTP 403): Your Google Cloud / AI Studio project has been denied access or lacks permissions for this model. Please check project status at https://aistudio.google.com/app/apikey or create a new key in an active Google account.'
    };
  }

  // 3. Quota Exceeded / Rate Limits
  if (rawCode === 429 ||
      /RESOURCE_EXHAUSTED|quota|rate limit|too many requests/i.test(message)) {
    return {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Quota Exceeded (HTTP 429): Your Gemini API request limit or daily token quota has been exhausted. Check usage at https://ai.google.dev/ or try again when quota resets.'
    };
  }

  // 4. Model Not Found / Deprecated
  if (rawCode === 404 ||
      /NOT_FOUND|is not found|no longer available|not supported for generateContent/i.test(message)) {
    return {
      status: 404,
      code: 'MODEL_UNSUPPORTED',
      message: `Model Unavailable (HTTP 404): "${modelName}" is no longer available or unsupported for this API key tier. Try setting GEMINI_MODEL=gemini-3.8-flash in your .env file.`
    };
  }

  // 5. Request Timeout
  if (rawCode === 504 || /timed? out|AbortError|deadline exceeded/i.test(message)) {
    return {
      status: 504,
      code: 'TIMEOUT',
      message: 'Gemini API request timed out (HTTP 504). Please try again.'
    };
  }

  // 6. Content Safety Flag
  if (rawCode === 400 && /SAFETY|blocked|HarmCategory/i.test(message)) {
    return {
      status: 400,
      code: 'CONTENT_FLAGGED',
      message: 'The requested topic could not be processed due to academic safety policies. Please select another syllabus chapter.'
    };
  }

  // 7. General Service Failure
  return {
    status: 502,
    code: 'AI_GENERATION_FAILED',
    message: 'Unable to generate quiz questions with Gemini at this time. Please try again shortly.'
  };
}

/**
 * Constructs prompt and JSON schema for Gemini.
 */
function buildPrompt(params) {
  const { classLevel, board, stateBoard, subject, chapter, difficulty, count } = params;
  const boardInfo = board === 'State Board' ? `State Board (${stateBoard})` : board;

  const promptText = `
You are an expert curriculum developer and board exam question author for Indian school education.
Generate exactly ${count} distinct multiple-choice questions (MCQs) for the following board examination preparation:

- Class / Grade: Class ${classLevel}
- Educational Board: ${boardInfo}
- Subject: ${subject}
- Chapter / Topic: ${chapter}
- Target Difficulty: ${difficulty}
- Total Questions: ${count}

PEDAGOGICAL & ACCURACY GUIDELINES:
1. Every question must be pedagogically sound, factually accurate, and strictly appropriate for Class ${classLevel} ${subject}.
2. Provide exactly 4 distinct, plausible options for each question (no duplicate or empty options).
3. Exactly ONE option must be definitively correct.
4. "correctIndex" MUST be the 0-based integer index (0, 1, 2, or 3) pointing to the correct option in the options array.
5. Provide a clear, concise educational explanation (1-3 sentences) detailing why the correct option is right and highlighting the key concept.
6. Set "topic" to the relevant sub-concept/chapter and "difficulty" to "${difficulty}".
7. Return strictly a JSON array adhering to the requested schema.
`.trim();

  const responseSchema = {
    type: Type.ARRAY,
    description: `Array of exactly ${count} quiz questions`,
    items: {
      type: Type.OBJECT,
      properties: {
        question: {
          type: Type.STRING,
          description: 'The question text, clear and concise'
        },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Exactly 4 distinct plausible answer choices'
        },
        correctIndex: {
          type: Type.INTEGER,
          description: '0-based integer index (0, 1, 2, or 3) of the correct option'
        },
        explanation: {
          type: Type.STRING,
          description: 'Concise explanation why the correct answer is right'
        },
        topic: {
          type: Type.STRING,
          description: 'Specific topic or sub-concept tested'
        },
        difficulty: {
          type: Type.STRING,
          description: 'Difficulty level (Easy, Medium, or Hard)'
        }
      },
      required: ['question', 'options', 'correctIndex', 'explanation', 'topic', 'difficulty']
    }
  };

  return { promptText, responseSchema };
}

/**
 * Executes a single Gemini API generation call.
 */
async function callGemini(ai, modelName, promptText, responseSchema) {
  const timeoutMs = 35000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.4
      }
    });

    clearTimeout(timeout);
    return response;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Performs a minimal test request to verify API key validity with Google.
 * Returns sanitized connection status without exposing the key.
 */
async function testGeminiConnection(modelName = DEFAULT_MODEL) {
  if (!isApiKeyConfigured()) {
    return {
      success: false,
      status: 503,
      code: 'API_KEY_MISSING',
      message: 'Gemini API key is not configured in .env.'
    };
  }

  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Ping test. Reply with one word: OK'
    });

    let reply = '';
    if (response && response.text) {
      reply = typeof response.text === 'function' ? response.text() : response.text;
    }

    return {
      success: true,
      status: 200,
      code: 'CONNECTED',
      modelUsed: modelName,
      message: 'Gemini API connection test succeeded.'
    };
  } catch (err) {
    const classified = classifyGeminiError(err, modelName);
    return {
      success: false,
      status: classified.status,
      code: classified.code,
      modelUsed: modelName,
      message: classified.message
    };
  }
}

/**
 * Generates and validates a complete quiz using Gemini.
 */
async function generateQuizWithGemini(params) {
  if (!isApiKeyConfigured()) {
    const classified = classifyGeminiError(null);
    const err = new Error(classified.message);
    err.custom = classified;
    throw err;
  }

  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const { promptText, responseSchema } = buildPrompt(params);

  // Model list: prioritizes user's GEMINI_MODEL, then recommended models
  const configuredModel = (process.env.GEMINI_MODEL || '').trim();
  const candidateModels = [];
  if (configuredModel) candidateModels.push(configuredModel);
  ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'].forEach(m => {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  });

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const response = await callGemini(ai, modelName, promptText, responseSchema);

      // Extract generated text
      let rawText = '';
      if (response && response.text) {
        rawText = typeof response.text === 'function' ? response.text() : response.text;
      } else if (response && response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
        rawText = response.candidates[0].content.parts[0].text;
      }

      if (!rawText) {
        throw new Error('Gemini returned an empty response.');
      }

      // Parse JSON safely
      let parsed;
      try {
        parsed = JSON.parse(rawText.trim());
      } catch (parseErr) {
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        parsed = JSON.parse(cleaned);
      }

      // Strictly validate questions against pedagogical and schema rules
      const validation = validateQuizQuestions(parsed, params.count, {
        subject: params.subject,
        chapter: params.chapter,
        difficulty: params.difficulty
      });

      if (!validation.valid || validation.questions.length < params.count) {
        const validationMsg = validation.errors.join('; ');
        throw new Error(`Generated questions failed validation: ${validationMsg}`);
      }

      // Successfully generated and validated
      return {
        modelUsed: modelName,
        questions: validation.questions,
        metadata: {
          classLevel: params.classLevel,
          board: params.board,
          stateBoard: params.stateBoard || null,
          subject: params.subject,
          chapter: params.chapter,
          difficulty: params.difficulty,
          count: params.count,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      lastError = err;
      const classified = classifyGeminiError(err, modelName);

      // Stop immediately on fatal auth or quota restrictions
      if (['API_KEY_MISSING', 'API_KEY_INVALID', 'PERMISSION_DENIED', 'RATE_LIMIT_EXCEEDED'].includes(classified.code)) {
        const error = new Error(classified.message);
        error.custom = classified;
        throw error;
      }

      // If 404 (model unsupported), continue loop to test next model candidate
    }
  }

  // If all candidate models failed
  const classified = classifyGeminiError(lastError, candidateModels[0]);
  const error = new Error(classified.message);
  error.custom = classified;
  throw error;
}

module.exports = {
  getApiKey,
  isApiKeyConfigured,
  classifyGeminiError,
  testGeminiConnection,
  generateQuizWithGemini
};
