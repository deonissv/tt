import { SimulationRoom } from './SimulationRoom';

const mocks = vi.hoisted(() => ({ connect: vi.fn(), getJWT: vi.fn(), init: vi.fn() }));

vi.mock('@services', () => ({
  RoomService: { connect: mocks.connect },
  AuthService: { getJWT: mocks.getJWT },
}));
vi.mock('./Simulation', () => ({ Simulation: { init: mocks.init } }));

describe('SimulationRoom initialization cleanup', () => {
  afterEach(() => vi.resetAllMocks());

  it('closes a connection that resolves after the room was abandoned', async () => {
    const controller = new AbortController();
    const close = vi.fn();
    mocks.connect.mockImplementation(() => {
      controller.abort();
      return Promise.resolve([{ close }, {}]);
    });

    await expect(
      SimulationRoom.init({} as HTMLCanvasElement, 'room', vi.fn(), vi.fn(), vi.fn(), controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(close).toHaveBeenCalledOnce();
    expect(mocks.init).not.toHaveBeenCalled();
  });

  it('closes the socket if simulation initialization fails', async () => {
    const close = vi.fn();
    mocks.connect.mockResolvedValue([{ close, addEventListener: vi.fn() }, {}]);
    mocks.getJWT.mockReturnValue({ code: 'client' });
    mocks.init.mockRejectedValue(new Error('initialization failed'));

    await expect(SimulationRoom.init({} as HTMLCanvasElement, 'room', vi.fn(), vi.fn(), vi.fn())).rejects.toThrow(
      'initialization failed',
    );
    expect(close).toHaveBeenCalledOnce();
  });
});
