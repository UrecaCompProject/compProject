import { http, HttpResponse } from 'msw';

import {
  MOCK_USER_ID,
  MOCK_USER_EMAIL,
  MOCK_USER_PASSWORD,
  mockSession,
  setMockSession,
  clearMockSession,
} from '../db';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// mock 세션 객체 생성
type MockSessionData = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    app_metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
};

function createMockSession(userId: string, email: string): MockSessionData {
  const now = Date.now();
  return {
    access_token: `mock-access-token-${now}`,
    refresh_token: `mock-refresh-token-${now}`,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email,
      app_metadata: {},
      user_metadata: {
        name: 'UserOne',
        phone: '010-1111-1111',
        age_group: '일반',
      },
      created_at: new Date(now - 86400000).toISOString(),
      updated_at: new Date(now).toISOString(),
    },
  };
}

export const authHandlers = [
  // signInWithPassword — POST /auth/v1/token?grant_type=password
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get('grant_type');

    if (grantType === 'password') {
      const body = (await request.json()) as {
        email: string;
        password: string;
      };
      if (
        body.email === MOCK_USER_EMAIL &&
        body.password === MOCK_USER_PASSWORD
      ) {
        const session = createMockSession(MOCK_USER_ID, MOCK_USER_EMAIL);
        setMockSession(session);
        return HttpResponse.json(session);
      }
      return HttpResponse.json(
        {
          error: 'invalid_credentials',
          error_description: 'Invalid login credentials',
        },
        { status: 400 },
      );
    }

    // 토큰 갱신 — grant_type=refresh_token
    if (grantType === 'refresh_token') {
      if (mockSession) {
        const session = createMockSession(
          mockSession.user.id,
          mockSession.user.email,
        );
        setMockSession(session);
        return HttpResponse.json(session);
      }
      return HttpResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid refresh token' },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { error: 'unsupported_grant_type' },
      { status: 400 },
    );
  }),

  // signUp — POST /auth/v1/signup
  http.post(`${SUPABASE_URL}/auth/v1/signup`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      data?: Record<string, unknown>;
    };

    if (body.email === MOCK_USER_EMAIL) {
      return HttpResponse.json(
        {
          error: 'user_already_exists',
          error_description: 'User already registered',
        },
        { status: 400 },
      );
    }

    const newUserId = crypto.randomUUID();
    const session = createMockSession(newUserId, body.email);
    session.user.user_metadata = body.data ?? {};
    setMockSession(session);

    return HttpResponse.json({
      id: newUserId,
      aud: 'authenticated',
      role: 'authenticated',
      email: body.email,
      app_metadata: {},
      user_metadata: body.data ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // getUser — GET /auth/v1/user
  http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !mockSession) {
      return HttpResponse.json(
        { error: 'auth_session_missing' },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockSession.user);
  }),

  // signOut — POST /auth/v1/logout
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    clearMockSession();
    return HttpResponse.json({}, { status: 200 });
  }),
];
