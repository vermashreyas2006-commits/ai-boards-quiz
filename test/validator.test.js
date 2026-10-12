/**
 * Automated tests for input validation, question schema checks, and scoring calculations.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  validateQuizParams,
  validateSingleQuestion,
  validateQuizQuestions,
  calculateQuizScore,
  sanitizeText
} = require('../lib/validator');

describe('Sanitize Text', () => {
  test('strips HTML brackets and collapses whitespace', () => {
    const input = '  <script>alert("xss")</script>  Physics &  Chemistry  ';
    const clean = sanitizeText(input);
    assert.strictEqual(clean, 'scriptalert("xss")/script Physics & Chemistry');
  });

  test('handles null and non-string inputs safely', () => {
    assert.strictEqual(sanitizeText(null), '');
    assert.strictEqual(sanitizeText(undefined), '');
    assert.strictEqual(sanitizeText(123), '');
  });
});

describe('Validate Quiz Parameters', () => {
  test('accepts valid CBSE parameters', () => {
    const params = {
      classLevel: '10',
      board: 'CBSE',
      subject: 'Science',
      chapter: 'Chemical Reactions',
      difficulty: 'Medium',
      count: 10
    };
    const res = validateQuizParams(params);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
    assert.strictEqual(res.sanitized.classLevel, '10');
    assert.strictEqual(res.sanitized.count, 10);
  });

  test('requires stateBoard when board is State Board', () => {
    const params = {
      classLevel: '12',
      board: 'State Board',
      stateBoard: '',
      subject: 'Physics',
      chapter: 'Current Electricity',
      difficulty: 'Hard',
      count: 5
    };
    const res = validateQuizParams(params);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('State selection is required')));
  });

  test('accepts State Board with state specified', () => {
    const params = {
      classLevel: '12',
      board: 'State Board',
      stateBoard: 'Maharashtra State Board',
      subject: 'Physics',
      chapter: 'Current Electricity',
      difficulty: 'Hard',
      count: 5
    };
    const res = validateQuizParams(params);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized.stateBoard, 'Maharashtra State Board');
  });

  test('rejects invalid class level', () => {
    const params = {
      classLevel: '5',
      board: 'CBSE',
      subject: 'Science',
      chapter: 'Plants',
      difficulty: 'Easy',
      count: 5
    };
    const res = validateQuizParams(params);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Invalid Class')));
  });

  test('rejects invalid question count', () => {
    const params = {
      classLevel: '10',
      board: 'CBSE',
      subject: 'Maths',
      chapter: 'Real Numbers',
      difficulty: 'Easy',
      count: 15
    };
    const res = validateQuizParams(params);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Question count must be 5, 10, or 20')));
  });
});

describe('Validate Single Question Schema', () => {
  const validQ = {
    question: 'What is the chemical formula of rust?',
    options: [
      'Fe2O3 · xH2O',
      'FeO',
      'Fe3O4',
      'Fe(OH)2'
    ],
    correctIndex: 0,
    explanation: 'Rust is hydrated iron(III) oxide with formula Fe2O3·xH2O.',
    topic: 'Chemical Reactions',
    difficulty: 'Medium'
  };

  test('accepts completely valid question', () => {
    const res = validateSingleQuestion(validQ, 0);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.question.options.length, 4);
    assert.strictEqual(res.question.correctIndex, 0);
  });

  test('rejects question with fewer than 4 options', () => {
    const invalid = { ...validQ, options: ['A', 'B', 'C'] };
    const res = validateSingleQuestion(invalid, 0);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('exactly 4 options')));
  });

  test('rejects question with duplicate options', () => {
    const invalid = { ...validQ, options: ['Option A', 'Option B', 'Option A', 'Option C'] };
    const res = validateSingleQuestion(invalid, 0);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('duplicate options')));
  });

  test('rejects question with empty option', () => {
    const invalid = { ...validQ, options: ['Option A', '  ', 'Option B', 'Option C'] };
    const res = validateSingleQuestion(invalid, 0);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('empty option')));
  });

  test('rejects question with invalid correctIndex out of range', () => {
    const invalid = { ...validQ, correctIndex: 5 };
    const res = validateSingleQuestion(invalid, 0);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('correct answer index')));
  });

  test('converts correctAnswer letter (A, B, C, D) to correctIndex', () => {
    const withLetter = {
      ...validQ,
      correctIndex: undefined,
      correctAnswer: 'B'
    };
    const res = validateSingleQuestion(withLetter, 0);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.question.correctIndex, 1);
  });
});

describe('Validate Quiz Question List', () => {
  const sampleQ = (id, qText) => ({
    question: qText || `Sample Question Number ${id} for Testing`,
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correctIndex: 1,
    explanation: 'Detailed sample explanation for testing.',
    topic: 'Testing Topic',
    difficulty: 'Easy'
  });

  test('validates correct list of requested count', () => {
    const list = [1, 2, 3, 4, 5].map(i => sampleQ(i));
    const res = validateQuizQuestions(list, 5);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.questions.length, 5);
  });

  test('filters out duplicate questions and flags insufficient count', () => {
    const list = [
      sampleQ(1, 'What is acceleration?'),
      sampleQ(2, 'What is velocity?'),
      sampleQ(3, 'What is acceleration?'), // duplicate
      sampleQ(4, 'What is speed?')
    ];
    const res = validateQuizQuestions(list, 4);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.questions.length, 3);
  });
});

describe('Score Calculation Logic', () => {
  const questions = [
    { id: 1, question: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
    { id: 2, question: 'Q2', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
    { id: 3, question: 'Q3', options: ['A', 'B', 'C', 'D'], correctIndex: 2 },
    { id: 4, question: 'Q4', options: ['A', 'B', 'C', 'D'], correctIndex: 3 },
    { id: 5, question: 'Q5', options: ['A', 'B', 'C', 'D'], correctIndex: 0 }
  ];

  test('calculates perfect score (100%)', () => {
    const answers = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 0 };
    const res = calculateQuizScore(answers, questions, 120);

    assert.strictEqual(res.totalQuestions, 5);
    assert.strictEqual(res.correctCount, 5);
    assert.strictEqual(res.incorrectCount, 0);
    assert.strictEqual(res.unansweredCount, 0);
    assert.strictEqual(res.score, 5);
    assert.strictEqual(res.percentage, 100);
    assert.strictEqual(res.timeTaken, 120);
  });

  test('calculates mixed score with unanswered and incorrect', () => {
    // Q1: correct (0)
    // Q2: wrong (0 instead of 1)
    // Q3: unanswered
    // Q4: correct (3)
    // Q5: unanswered
    const answers = { 0: 0, 1: 0, 3: 3 };
    const res = calculateQuizScore(answers, questions, 85);

    assert.strictEqual(res.totalQuestions, 5);
    assert.strictEqual(res.answeredCount, 3);
    assert.strictEqual(res.unansweredCount, 2);
    assert.strictEqual(res.correctCount, 2);
    assert.strictEqual(res.incorrectCount, 1);
    assert.strictEqual(res.score, 2);
    assert.strictEqual(res.percentage, 40);
  });

  test('handles zero answers gracefully', () => {
    const res = calculateQuizScore({}, questions, 30);
    assert.strictEqual(res.totalQuestions, 5);
    assert.strictEqual(res.correctCount, 0);
    assert.strictEqual(res.unansweredCount, 5);
    assert.strictEqual(res.percentage, 0);
  });
});
