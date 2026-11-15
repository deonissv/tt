import { Logger } from '@nestjs/common';
import type { ClientActionMsg } from '@tt/actions';
import { ClientAction } from '@tt/actions';
import type { Tuple } from '@tt/utils';

const MAX_ACTIONS_PER_FRAME = 100;
const MAX_GUID_LENGTH = 64;
const MAX_MOVE_DELTA = 25;
const MAX_PICK_HEIGHT = 10;
const MAX_ROTATION_STEP = Math.PI * 2;

const staticLogger = new Logger('ActionValidation');

const isGuid = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= MAX_GUID_LENGTH;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function cursorPayload(payload: unknown): Tuple<number, 2> | null {
  if (!Array.isArray(payload) || payload.length !== 2) return null;
  const [x, y] = payload as unknown[];
  if (!isFiniteNumber(x) || !isFiniteNumber(y)) return null;
  return [x, y];
}

function movePayload(payload: unknown): { guid: string; position: Tuple<number, 2> } | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const { guid, position } = payload as Record<string, unknown>;
  if (!isGuid(guid)) return null;
  if (!Array.isArray(position) || position.length !== 2) return null;
  const [dx, dy] = position as unknown[];
  if (!isFiniteNumber(dx) || !isFiniteNumber(dy)) return null;
  return {
    guid,
    position: [clamp(dx, -MAX_MOVE_DELTA, MAX_MOVE_DELTA), clamp(dy, -MAX_MOVE_DELTA, MAX_MOVE_DELTA)],
  };
}

function guidPayload(payload: unknown): string | null {
  return isGuid(payload) ? payload : null;
}

function pickHeightPayload(payload: unknown): number | null {
  if (!isFiniteNumber(payload)) return null;
  return clamp(payload, 0, MAX_PICK_HEIGHT);
}

function rotationStepPayload(payload: unknown): number | null {
  if (!isFiniteNumber(payload)) return null;
  return clamp(payload, 0, MAX_ROTATION_STEP);
}

const GUID_PAYLOAD_ACTIONS = [
  ClientAction.PICK_ITEM,
  ClientAction.PICK_ACTOR,
  ClientAction.RELEASE_ACTOR,
  ClientAction.ROLL,
  ClientAction.SHUFFLE,
  ClientAction.FLIP,
  ClientAction.CW,
  ClientAction.CCW,
] as const;

/**
 * Validates a batch of client actions from the transport: unknown types,
 * malformed payloads and non-finite numbers are dropped, numeric payloads are
 * clamped to sane ranges, and oversized batches are truncated.
 */
export function parseClientActions(messages: unknown): ClientActionMsg[] {
  if (!Array.isArray(messages)) return [];

  const accepted: ClientActionMsg[] = [];
  let rejected = 0;

  for (const raw of messages.slice(0, MAX_ACTIONS_PER_FRAME)) {
    if (typeof raw !== 'object' || raw === null) {
      rejected++;
      continue;
    }
    const { type, payload } = raw as Record<string, unknown>;
    let msg: ClientActionMsg | null = null;

    switch (type) {
      case ClientAction.MOVE_ACTOR: {
        const valid = movePayload(payload);
        if (valid) msg = { type, payload: valid };
        break;
      }
      case ClientAction.CURSOR: {
        const valid = cursorPayload(payload);
        if (valid) msg = { type, payload: valid };
        break;
      }
      case ClientAction.SET_PICK_HEIGHT: {
        const valid = pickHeightPayload(payload);
        if (valid !== null) msg = { type, payload: valid };
        break;
      }
      case ClientAction.SET_ROTATION_STEP: {
        const valid = rotationStepPayload(payload);
        if (valid !== null) msg = { type, payload: valid };
        break;
      }
      case ClientAction.NICKNAME: {
        if (typeof payload === 'string' && payload.length > 0) msg = { type, payload };
        break;
      }
      case ClientAction.CLOSE: {
        if (payload === null) msg = { type, payload: null };
        break;
      }
      default: {
        const guidType = GUID_PAYLOAD_ACTIONS.find(action => action === type);
        if (guidType !== undefined) {
          const valid = guidPayload(payload);
          if (valid) msg = { type: guidType, payload: valid };
        }
        break;
      }
    }

    if (msg) accepted.push(msg);
    else rejected++;
  }

  if (rejected > 0) {
    staticLogger.warn(`Rejected ${rejected} malformed client action${rejected > 1 ? 's' : ''}`);
  }
  return accepted;
}
