import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPredictions } from './handlers';
import { Env } from './index';

async function sha256Hex(value: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Create a mock D1 PreparedStatement
function createMockStatement(overrides: any = {}) {
  const stmt: any = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(null),
    all: vi.fn().mockResolvedValue({ results: [] }),
    run: vi.fn().mockResolvedValue({ success: true }),
    ...overrides
  };
  return stmt;
}

describe('createPredictions', () => {
  let mockEnv: Env;
  let mockDb: any;
  let mockPrepare: ReturnType<typeof vi.fn>;
  let mockCtx: any;

  beforeEach(() => {
    mockPrepare = vi.fn().mockImplementation((query) => {
      return createMockStatement();
    });
    mockDb = {
      prepare: mockPrepare,
      batch: vi.fn().mockResolvedValue([{ success: true }])
    };

    mockEnv = {
      DB: mockDb as any,
      FOOTBALL_DATA_TOKEN: 'test',
      CORS_ORIGINS: '*'
    };

    mockCtx = {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    } as any;
  });

  it('returns 400 for invalid payload', async () => {
    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, null);

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Invalid payload');
  });

  it('returns 403 for invalid origin', async () => {
    mockEnv.CORS_ORIGINS = 'http://allowed.com';
    const req = new Request('http://localhost', { method: 'POST', headers: { 'Origin': 'http://notallowed.com' } });
    const res = await createPredictions(req, mockEnv, mockCtx, {});

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Origin not allowed for this operation');
  });

  it('returns 404 if roundId is missing and match is not found', async () => {
    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM matches WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue(null) });
      }
      return createMockStatement();
    });

    const payload = {
      participantName: 'Alice',
      predictions: [{ matchId: 1, home: 1, away: 0 }],
      submissionToken: 'token'
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Match not found');
  });

  it('returns 404 if round is not found', async () => {
    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue(null) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [{ matchId: 1, home: 1, away: 0 }],
      submissionToken: 'token'
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Round not found');
  });

  it('returns 401 if submission token is missing and not dev bypass', async () => {
    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      return createMockStatement();
    });

    mockEnv.ENVIRONMENT = 'production';

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [{ matchId: 1, home: 1, away: 0 }],
      submissionToken: ''
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Submission token required');
  });

  it('returns 403 if submission token is not configured for round', async () => {
    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('FROM submission_tokens WHERE round_id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue(null) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [{ matchId: 1, home: 1, away: 0 }],
      submissionToken: 'token'
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Submission token not configured for this round');
  });

  it('returns 401 if submission token is expired', async () => {
    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('FROM submission_tokens WHERE round_id = ?')) {
        const expiredDate = new Date(Date.now() - 10000).toISOString();
        return createMockStatement({ first: vi.fn().mockResolvedValue({ expires_at: expiredDate, token_hash: 'hash' }) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [{ matchId: 1, home: 1, away: 0 }],
      submissionToken: 'token'
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Submission token expired');
  });

  it('returns 403 if submission token is invalid', async () => {
    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('FROM submission_tokens WHERE round_id = ?')) {
        const validDate = new Date(Date.now() + 100000).toISOString();
        return createMockStatement({ first: vi.fn().mockResolvedValue({ expires_at: validDate, token_hash: 'wrong_hash' }) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [{ matchId: 1, home: 1, away: 0 }],
      submissionToken: 'token'
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Invalid submission token');
  });

  it('returns 409 if name already used in this round', async () => {
    const rawToken = 'mytoken';
    const hash = await sha256Hex(rawToken);

    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('FROM submission_tokens WHERE round_id = ?')) {
        const validDate = new Date(Date.now() + 100000).toISOString();
        return createMockStatement({ first: vi.fn().mockResolvedValue({ expires_at: validDate, token_hash: hash }) });
      }
      if (query.includes('SELECT 1 FROM predictions WHERE round_id = ? AND participant_name = ? LIMIT 1')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ 1: 1 }) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [{ matchId: 1, home: 1, away: 0 }],
      submissionToken: rawToken
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Name already used in this round');
  });

  it('returns 400 if one or more matches are invalid for this round', async () => {
    const rawToken = 'mytoken';
    const hash = await sha256Hex(rawToken);

    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('FROM submission_tokens WHERE round_id = ?')) {
        const validDate = new Date(Date.now() + 100000).toISOString();
        return createMockStatement({ first: vi.fn().mockResolvedValue({ expires_at: validDate, token_hash: hash }) });
      }
      if (query.includes('SELECT 1 FROM predictions WHERE round_id = ? AND participant_name = ? LIMIT 1')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue(null) });
      }
      if (query.includes('FROM matches WHERE round_id = ? AND id IN')) {
        // Return only 1 match instead of 2 expected
        return createMockStatement({ all: vi.fn().mockResolvedValue({ results: [{ id: 1, utc_date: new Date().toISOString(), status: 'SCHEDULED' }] }) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [
        { matchId: 1, home: 1, away: 0 },
        { matchId: 2, home: 0, away: 2 }
      ],
      submissionToken: rawToken
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('One or more matches are invalid for this round');
  });

  it('returns 201 and creates predictions on happy path', async () => {
    const rawToken = 'mytoken';
    const hash = await sha256Hex(rawToken);

    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('FROM submission_tokens WHERE round_id = ?')) {
        const validDate = new Date(Date.now() + 100000).toISOString();
        return createMockStatement({ first: vi.fn().mockResolvedValue({ expires_at: validDate, token_hash: hash }) });
      }
      if (query.includes('SELECT 1 FROM predictions WHERE round_id = ? AND participant_name = ? LIMIT 1')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue(null) });
      }
      if (query.includes('FROM matches WHERE round_id = ? AND id IN')) {
        return createMockStatement({ all: vi.fn().mockResolvedValue({ results: [{ id: 1, utc_date: new Date().toISOString(), status: 'SCHEDULED' }] }) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [
        { matchId: 1, home: 1, away: 0 }
      ],
      submissionToken: rawToken
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(201);
    const body = await res.json() as { message: string, roundId: number, participantName: string };
    expect(body.message).toBe('Predictions saved');
    expect(body.roundId).toBe(1);
    expect(body.participantName).toBe('Alice');

    expect(mockDb.batch).toHaveBeenCalledTimes(1);
    expect(mockDb.batch.mock.calls[0][0].length).toBe(1); // 1 statement for 1 prediction
  });

  it('allows request when dev bypass is on and token is missing', async () => {
    mockEnv.ENVIRONMENT = 'development';
    mockEnv.DEV_BYPASS_TOKEN_CHECK = 'true';

    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('SELECT 1 FROM predictions WHERE round_id = ? AND participant_name = ? LIMIT 1')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue(null) });
      }
      if (query.includes('FROM matches WHERE round_id = ? AND id IN')) {
        return createMockStatement({ all: vi.fn().mockResolvedValue({ results: [{ id: 1, utc_date: new Date().toISOString(), status: 'SCHEDULED' }] }) });
      }
      return createMockStatement();
    });

    const payload = {
      roundId: 1,
      participantName: 'Alice',
      predictions: [
        { matchId: 1, home: 1, away: 0 }
      ],
      submissionToken: ''
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(201);
    const body = await res.json() as { message: string, roundId: number, participantName: string };
    expect(body.message).toBe('Predictions saved');
  });

  it('falls back to finding roundId from match if not provided in payload', async () => {
    const rawToken = 'mytoken';
    const hash = await sha256Hex(rawToken);

    mockPrepare.mockImplementation((query) => {
      if (query.includes('FROM matches WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ round_id: 2 }) });
      }
      if (query.includes('FROM rounds WHERE id = ?')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue({ found: 1 }) });
      }
      if (query.includes('FROM submission_tokens WHERE round_id = ?')) {
        const validDate = new Date(Date.now() + 100000).toISOString();
        return createMockStatement({ first: vi.fn().mockResolvedValue({ expires_at: validDate, token_hash: hash }) });
      }
      if (query.includes('SELECT 1 FROM predictions WHERE round_id = ? AND participant_name = ? LIMIT 1')) {
        return createMockStatement({ first: vi.fn().mockResolvedValue(null) });
      }
      if (query.includes('FROM matches WHERE round_id = ? AND id IN')) {
        return createMockStatement({ all: vi.fn().mockResolvedValue({ results: [{ id: 1, utc_date: new Date().toISOString(), status: 'SCHEDULED' }] }) });
      }
      return createMockStatement();
    });

    const payload = {
      participantName: 'Bob',
      predictions: [
        { matchId: 1, home: 1, away: 0 }
      ],
      submissionToken: rawToken
    };

    const req = new Request('http://localhost', { method: 'POST' });
    const res = await createPredictions(req, mockEnv, mockCtx, payload);

    expect(res.status).toBe(201);
    const body = await res.json() as { message: string, roundId: number, participantName: string };
    expect(body.message).toBe('Predictions saved');
    expect(body.roundId).toBe(2);
  });
});
