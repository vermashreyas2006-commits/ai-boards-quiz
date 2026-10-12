/**
 * AI Boards Quiz - Express Backend Server
 * Handles AI quiz generation, input validation, rate limiting, and secure Gemini integration.
 */

const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env once at application startup
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const rateLimit = require('express-rate-limit');

const { BOARDS, STATE_BOARDS, CLASSES, SYLLABUS } = require('./lib/syllabus-data');
const { validateQuizParams, calculateQuizScore } = require('./lib/validator');
const {
  isApiKeyConfigured,
  classifyGeminiError,
  testGeminiConnection,
  generateQuizWithGemini
} = require('./lib/gemini');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Disable X-Powered-By
app.disable('x-powered-by');

// Body parsers with sensible size limit
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Security Guard: Prevent any HTTP access to sensitive files
app.use((req, res, next) => {
  const sensitivePatterns = [
    /^\/\.env/i,
    /^\/\.git/i,
    /^\/package\.json/i,
    /^\/package-lock\.json/i,
    /^\/server\.js/i,
    /^\/lib(\/.*)?$/i,
    /^\/test(\/.*)?$/i
  ];

  if (sensitivePatterns.some(pattern => pattern.test(req.path))) {
    return res.status(403).json({ error: 'Access forbidden.' });
  }
  next();
});

// Serve frontend static assets from workspace root (with dotfiles denied)
app.use(express.static(__dirname, {
  dotfiles: 'deny',
  index: 'index.html',
  maxAge: '0'
}));

// Rate limiter for quiz generation (protects against accidental abuse / quota drainage)
const quizGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 generation requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    error: 'Too many quiz requests from this IP. Please wait a few minutes before generating more quizzes.'
  }
});

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

/**
 * Configuration status check (Safe: never leaks the API key)
 */
app.get('/api/config-status', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const configured = isApiKeyConfigured();

  res.json({
    configured,
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    hasKey: configured,
    message: configured
      ? 'Gemini API key is configured.'
      : 'Gemini API key is not configured in .env. Setup required.'
  });
});

/**
 * Live test connection endpoint: executes a minimal test ping to Gemini
 */
app.get('/api/test-connection', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const testResult = await testGeminiConnection(process.env.GEMINI_MODEL || 'gemini-3.8-flash');
    return res.status(testResult.status).json(testResult);
  } catch (error) {
    const classified = classifyGeminiError(error, process.env.GEMINI_MODEL || 'gemini-3.8-flash');
    return res.status(classified.status).json({
      success: false,
      status: classified.status,
      code: classified.code,
      message: classified.message
    });
  }
});

/**
 * Syllabus metadata helper endpoint for frontend form suggestions
 */
app.get('/api/syllabus', (req, res) => {
  res.json({
    boards: BOARDS,
    stateBoards: STATE_BOARDS,
    classes: CLASSES,
    syllabus: SYLLABUS
  });
});

/**
 * Quiz generation endpoint
 * Invokes Gemini via Google GenAI SDK with structured schema
 */
app.post('/api/generate-quiz', quizGenLimiter, async (req, res) => {
  try {
    // 1. Validate request parameters
    const paramValidation = validateQuizParams(req.body);
    if (!paramValidation.valid) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PARAMETERS',
        error: paramValidation.errors.join(' '),
        details: paramValidation.errors
      });
    }

    // 2. Generate quiz with Gemini
    const result = await generateQuizWithGemini(paramValidation.sanitized);

    return res.json({
      success: true,
      questions: result.questions,
      metadata: result.metadata,
      modelUsed: result.modelUsed
    });
  } catch (error) {
    const custom = error.custom || classifyGeminiError(error);
    const status = custom.status || 500;

    return res.status(status).json({
      success: false,
      code: custom.code || 'GENERATION_ERROR',
      error: custom.message || 'An error occurred while generating the quiz.'
    });
  }
});

/**
 * Server-side score validation endpoint
 */
app.post('/api/validate-score', (req, res) => {
  try {
    const { userAnswers, questions, timeTaken } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Questions array is required.'
      });
    }

    const scoreResult = calculateQuizScore(userAnswers || {}, questions, timeTaken || 0);
    return res.json({
      success: true,
      result: scoreResult
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: 'Failed to calculate score: invalid input.'
    });
  }
});

// Fallback to index.html for any remaining frontend route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Boards Quiz Server running at http://localhost:${PORT}`);
    console.log(`🔑 Gemini API Configured: ${isApiKeyConfigured() ? 'YES' : 'NO (.env setup needed)'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
