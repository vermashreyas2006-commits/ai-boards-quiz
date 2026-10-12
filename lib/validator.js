/**
 * Input validation, schema sanitization, and score calculation engine.
 * Ensures data integrity, prevents XSS, and strictly validates questions.
 */

const VALID_CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const VALID_BOARDS = ['CBSE', 'ICSE', 'State Board'];
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const VALID_COUNTS = [5, 10, 20];

/**
 * Basic HTML escaping for safe storage and rendering.
 */
function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // remove direct angle brackets to prevent script tags
    .replace(/\s+/g, ' '); // collapse redundant spaces
}

/**
 * Validates quiz creation request parameters.
 */
function validateQuizParams(params = {}) {
  const errors = [];
  const classLevel = String(params.classLevel || '').trim();
  const board = String(params.board || '').trim();
  const stateBoard = String(params.stateBoard || '').trim();
  const subject = sanitizeText(params.subject);
  const chapter = sanitizeText(params.chapter);
  const difficulty = String(params.difficulty || '').trim();
  const count = parseInt(params.count, 10);

  if (!VALID_CLASSES.includes(classLevel)) {
    errors.push(`Invalid Class: must be one of ${VALID_CLASSES.join(', ')}.`);
  }

  if (!VALID_BOARDS.includes(board)) {
    errors.push(`Invalid Board: must be one of ${VALID_BOARDS.join(', ')}.`);
  }

  if (board === 'State Board' && (!stateBoard || stateBoard.length < 2)) {
    errors.push('State selection is required when State Board is chosen.');
  }

  if (!subject || subject.length < 2 || subject.length > 80) {
    errors.push('Subject must be between 2 and 80 characters.');
  }

  if (!chapter || chapter.length < 2 || chapter.length > 120) {
    errors.push('Chapter/Topic must be between 2 and 120 characters.');
  }

  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.`);
  }

  if (!VALID_COUNTS.includes(count)) {
    errors.push(`Question count must be 5, 10, or 20.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      classLevel,
      board,
      stateBoard: board === 'State Board' ? stateBoard : '',
      subject,
      chapter,
      difficulty,
      count
    }
  };
}

/**
 * Validates a single question against strict requirements:
 * - Clear question (> 8 chars)
 * - Exactly four distinct options
 * - Exactly one valid correct answer index (0, 1, 2, 3)
 * - Concise explanation (> 5 chars)
 */
function validateSingleQuestion(item, index = 0, fallbackTopic = '', fallbackDifficulty = 'Medium') {
  const errors = [];
  if (!item || typeof item !== 'object') {
    return { valid: false, errors: [`Question ${index + 1} is not an object.`] };
  }

  const question = sanitizeText(item.question);
  if (!question || question.length < 8) {
    errors.push(`Question ${index + 1} text is too short or empty.`);
  }

  // Options validation: exactly 4 distinct options
  let options = item.options;
  if (!Array.isArray(options)) {
    errors.push(`Question ${index + 1} options must be an array.`);
    return { valid: false, errors };
  }

  const cleanOptions = options.map(opt => sanitizeText(String(opt || '')));

  if (cleanOptions.length !== 4) {
    errors.push(`Question ${index + 1} must have exactly 4 options. Found ${cleanOptions.length}.`);
  }

  // Check all options are non-empty
  const hasEmpty = cleanOptions.some(opt => opt.length === 0);
  if (hasEmpty) {
    errors.push(`Question ${index + 1} has empty option(s).`);
  }

  // Check options are distinct (case-insensitive deduplication check)
  const lowerOptions = cleanOptions.map(opt => opt.toLowerCase());
  const uniqueCount = new Set(lowerOptions).size;
  if (uniqueCount !== cleanOptions.length) {
    errors.push(`Question ${index + 1} contains duplicate options.`);
  }

  // Determine correct answer index
  let correctIndex = -1;

  if (typeof item.correctIndex === 'number' && Number.isInteger(item.correctIndex)) {
    correctIndex = item.correctIndex;
  } else if (typeof item.correctIndex === 'string' && /^[0-3]$/.test(item.correctIndex.trim())) {
    correctIndex = parseInt(item.correctIndex.trim(), 10);
  } else if (item.correctAnswer !== undefined) {
    // If provided as option string or letter (A, B, C, D)
    const ansStr = String(item.correctAnswer).trim();
    if (/^[ABCD]$/i.test(ansStr)) {
      const charMap = { A: 0, B: 1, C: 2, D: 3 };
      correctIndex = charMap[ansStr.toUpperCase()];
    } else {
      const matchIdx = cleanOptions.findIndex(
        opt => opt.toLowerCase() === ansStr.toLowerCase()
      );
      if (matchIdx !== -1) {
        correctIndex = matchIdx;
      }
    }
  }

  if (correctIndex < 0 || correctIndex > 3) {
    errors.push(`Question ${index + 1} correct answer index must be between 0 and 3.`);
  }

  const explanation = sanitizeText(item.explanation);
  if (!explanation || explanation.length < 5) {
    errors.push(`Question ${index + 1} explanation is missing or too short.`);
  }

  const topic = sanitizeText(item.topic) || fallbackTopic || 'General';
  const difficulty = VALID_DIFFICULTIES.includes(item.difficulty)
    ? item.difficulty
    : fallbackDifficulty;

  return {
    valid: errors.length === 0,
    errors,
    question: {
      id: index + 1,
      question,
      options: cleanOptions,
      correctIndex,
      explanation,
      topic,
      difficulty
    }
  };
}

/**
 * Validates a list of questions returned from Gemini.
 * Discards duplicates, verifies count and structure.
 */
function validateQuizQuestions(rawQuestions, expectedCount = 5, meta = {}) {
  const errors = [];
  if (!Array.isArray(rawQuestions)) {
    return {
      valid: false,
      errors: ['Generated quiz output must be a JSON array of questions.'],
      questions: []
    };
  }

  const validatedQuestions = [];
  const seenQuestions = new Set();

  for (let i = 0; i < rawQuestions.length; i++) {
    const raw = rawQuestions[i];
    const validation = validateSingleQuestion(
      raw,
      i,
      meta.chapter || meta.subject,
      meta.difficulty
    );

    if (!validation.valid) {
      errors.push(...validation.errors);
      continue;
    }

    const qKey = validation.question.question.toLowerCase();
    if (seenQuestions.has(qKey)) {
      errors.push(`Duplicate question detected: "${validation.question.question.slice(0, 40)}..."`);
      continue;
    }

    seenQuestions.add(qKey);
    // Assign sequential 1-based id
    validation.question.id = validatedQuestions.length + 1;
    validatedQuestions.push(validation.question);
  }

  if (validatedQuestions.length < expectedCount) {
    errors.push(
      `Insufficient valid questions generated: expected ${expectedCount}, got ${validatedQuestions.length} valid.`
    );
  }

  return {
    valid: validatedQuestions.length >= expectedCount,
    errors,
    questions: validatedQuestions.slice(0, expectedCount)
  };
}

/**
 * Calculates quiz score based strictly on validated correctIndex.
 * Protects against tampering.
 */
function calculateQuizScore(userAnswers = {}, questions = [], timeTakenSeconds = 0) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      totalQuestions: 0,
      answeredCount: 0,
      unansweredCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      score: 0,
      percentage: 0,
      timeTaken: timeTakenSeconds,
      details: []
    };
  }

  const total = questions.length;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  const details = [];

  questions.forEach((q, idx) => {
    // Determine selected answer without key collision between index and ID
    let selected = undefined;
    if (Object.prototype.hasOwnProperty.call(userAnswers, idx)) {
      selected = userAnswers[idx];
    } else if (Object.prototype.hasOwnProperty.call(userAnswers, String(idx))) {
      selected = userAnswers[String(idx)];
    } else if (q.id !== undefined && Object.prototype.hasOwnProperty.call(userAnswers, q.id) && !Object.prototype.hasOwnProperty.call(userAnswers, 0)) {
      selected = userAnswers[q.id];
    }

    const hasSelection = selected !== null && selected !== undefined && selected !== '';
    const selectedIndex = hasSelection ? parseInt(selected, 10) : null;
    const isAnswered = selectedIndex !== null && !isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex <= 3;

    let isCorrect = false;
    if (!isAnswered) {
      unanswered++;
    } else if (selectedIndex === q.correctIndex) {
      correct++;
      isCorrect = true;
    } else {
      incorrect++;
    }

    details.push({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      correctOption: q.options[q.correctIndex],
      selectedIndex: isAnswered ? selectedIndex : null,
      selectedOption: isAnswered ? q.options[selectedIndex] : null,
      isAnswered,
      isCorrect,
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty
    });
  });

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    totalQuestions: total,
    answeredCount: total - unanswered,
    unansweredCount: unanswered,
    correctCount: correct,
    incorrectCount: incorrect,
    score: correct,
    percentage,
    timeTaken: timeTakenSeconds,
    details
  };
}

module.exports = {
  VALID_CLASSES,
  VALID_BOARDS,
  VALID_DIFFICULTIES,
  VALID_COUNTS,
  sanitizeText,
  validateQuizParams,
  validateSingleQuestion,
  validateQuizQuestions,
  calculateQuizScore
};
