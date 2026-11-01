import { expect, type APIRequestContext } from '@playwright/test';
import type { AccessTokenDto, GamePreviewDto } from '@tt/dto';
import type { SimulationStateSave } from '@tt/states';
import { randomUUID } from 'node:crypto';

export interface PlayerLogin {
  email: string;
  password: string;
}

export interface RoomFixture {
  roomCode: string;
  authorToken: string;
  observerToken: string;
  authorLogin: PlayerLogin;
  guestLogin?: PlayerLogin;
}

interface Resource {
  path: string;
  token: string;
}

export async function createDataset(api: APIRequestContext, fixture: SimulationStateSave, guest = true) {
  const resources: Resource[] = [];
  const cleanup = async (request = api): Promise<void> => {
    const failures: unknown[] = [];
    for (let index = resources.length - 1; index >= 0; index--) {
      const resource = resources[index];
      try {
        const response = await request.delete(resource.path, {
          headers: { Authorization: `Bearer ${resource.token}` },
        });
        await expect(response, `Could not delete visual fixture resource ${resource.path}`).toBeOK();
        resources.splice(index, 1);
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length) throw new AggregateError(failures, 'Visual fixture cleanup failed');
  };
  const createUser = async (kind: string): Promise<{ token: string; login: PlayerLogin }> => {
    const username = `${kind}-${randomUUID()}`;
    const login = { email: `${username}@visual.test`, password: randomUUID() };
    const response = await api.post('/api/v1/auth/signup', {
      data: { username, ...login },
    });
    await expect(response, 'Visual fixture signup failed').toBeOK();
    const { access_token: token } = (await response.json()) as AccessTokenDto;
    // The authenticated public client also identifies the current user by this
    // JWT claim. Tokens are obtained from signup and never signed by the suite.
    const { code } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as { code?: string };
    if (!code) throw new Error('Signup token is missing its public user code');
    resources.push({ path: `/api/v1/users/${encodeURIComponent(code)}`, token });
    return { token, login };
  };
  try {
    const author = await createUser('author');
    const guestAccount = guest ? await createUser('guest') : undefined;
    const observer = await createUser('observer');
    const authorToken = author.token;
    const headers = { Authorization: `Bearer ${authorToken}` };
    const gameResponse = await api.post('/api/v1/games', {
      headers,
      data: {
        name: `Visual fixture ${randomUUID()}`,
        description: 'Reviewed visual regression scene',
        bannerUrl: '',
        content: JSON.stringify(fixture),
      },
    });
    await expect(gameResponse, 'Visual fixture game creation failed').toBeOK();
    const game = (await gameResponse.json()) as GamePreviewDto;
    resources.push({ path: `/api/v1/games/${encodeURIComponent(game.code)}`, token: authorToken });
    return {
      authorToken,
      observerToken: observer.token,
      authorLogin: author.login,
      guestLogin: guestAccount?.login,
      createRoom: async (): Promise<string> => {
        const roomResponse = await api.post('/api/v1/rooms', { headers, data: { gameCode: game.code } });
        await expect(roomResponse, 'Visual fixture room creation failed').toBeOK();
        const roomCode = (await roomResponse.text()).trim();
        if (!roomCode) throw new Error('Room creation returned an empty room code');
        resources.push({ path: `/api/v1/rooms/${encodeURIComponent(roomCode)}`, token: authorToken });
        return roomCode;
      },
      cleanup,
    };
  } catch (error) {
    try {
      await cleanup();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Visual fixture creation and cleanup failed');
    }
    throw error;
  }
}
