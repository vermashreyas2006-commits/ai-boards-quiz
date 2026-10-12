/**
 * Automated API integration tests for Express server endpoints and security rules.
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Set NODE_ENV to test so app does not start listening automatically
process.env.NODE_ENV = 'test';
const app = require('../server');

let server;
let baseUrl;

before(async () => {
  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
});

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.request(url, options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      const payload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      req.setHeader('Content-Type', 'application/json');
      req.write(payload);
    }

    req.end();
  });
}

describe('Server Health and Config Status', () => {
  test('GET /api/health returns 200 ok', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  test('GET /api/config-status returns safe status without exposing any key', async () => {
    const res = await request('/api/config-status');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(typeof res.body.configured, 'boolean');
    assert.strictEqual(res.body.apiKey, undefined);
    assert.strictEqual(res.body.GEMINI_API_KEY, undefined);
    assert.ok(res.body.message);
  });

  test('GET /api/syllabus returns board and class data', async () => {
    const res = await request('/api/syllabus');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.boards));
    assert.ok(Array.isArray(res.body.classes));
    assert.ok(res.body.syllabus['10']);
  });

  test('GET /api/test-connection returns structured diagnostic status without leaking key', async () => {
    const res = await request('/api/test-connection');
    assert.ok([200, 401, 403, 404, 429, 503].includes(res.status));
    assert.strictEqual(typeof res.body.code, 'string');
    assert.strictEqual(typeof res.body.message, 'string');
    assert.strictEqual(res.body.apiKey, undefined);
    assert.strictEqual(res.body.GEMINI_API_KEY, undefined);
  });
});

describe('Security: Sensitive File Blocking', () => {
  test('GET /.env is blocked with 403 Forbidden', async () => {
    const res = await request('/.env');
    assert.strictEqual(res.status, 403);
  });

  test('GET /package.json is blocked with 403 Forbidden', async () => {
    const res = await request('/package.json');
    assert.strictEqual(res.status, 403);
  });

  test('GET /server.js is blocked with 403 Forbidden', async () => {
    const res = await request('/server.js');
    assert.strictEqual(res.status, 403);
  });
});

describe('Quiz Generation Endpoint Validation', () => {
  test('POST /api/generate-quiz rejects missing parameters with 400', async () => {
    const res = await request('/api/generate-quiz', {
      method: 'POST',
      body: {}
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.code, 'INVALID_PARAMETERS');
  });

  test('POST /api/generate-quiz handles missing key gracefully with 503', async () => {
    // With empty GEMINI_API_KEY in .env, should return 503 setup error
    const res = await request('/api/generate-quiz', {
      method: 'POST',
      body: {
        classLevel: '10',
        board: 'CBSE',
        subject: 'Science',
        chapter: 'Chemical Reactions',
        difficulty: 'Medium',
        count: 5
      }
    });

    // If key is not configured, expect 503 API_KEY_MISSING
    if (!process.env.GEMINI_API_KEY) {
      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.body.code, 'API_KEY_MISSING');
      assert.ok(res.body.error.includes('.env'));
    }
  });

  test('POST /api/validate-score computes validated score', async () => {
    const res = await request('/api/validate-score', {
      method: 'POST',
      body: {
        userAnswers: { 0: 2, 1: 1 },
        questions: [
          { id: 1, question: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 2 },
          { id: 2, question: 'Q2', options: ['A', 'B', 'C', 'D'], correctIndex: 1 }
        ],
        timeTaken: 45
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.result.score, 2);
    assert.strictEqual(res.body.result.percentage, 100);
  });
});
