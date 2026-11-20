import { ActorType, type CardState, type Transformation, type UnknownActorState } from '@tt/states';

/**
 * A card's face points down when its local up axis flips below the table
 * plane. With Babylon's yaw-pitch-roll order the up axis Y component is
 * cos(pitch) * cos(roll), multiplied by Y scale for mirrored saves. This is the
 * serialized-state equivalent of the
 * world-up test the live draw path performs on actors.
 */
export function cardIsFaceDown(state: { type: ActorType; transformation?: Transformation }): boolean {
  if (state.type !== ActorType.CARD) return false;
  const rotation = state.transformation?.rotation;
  const [x, , z] = rotation ?? [0, 0, 0];
  const scaleY = state.transformation?.scale?.[1] ?? 1;
  return Math.cos(x) * Math.cos(z) * scaleY < 0;
}

/**
 * Hides a face-down card's face from clients that do not hold it by
 * substituting the back texture for the face texture. The input state is
 * never mutated; holders receive their own state unchanged.
 */
export function redactCardFace(
  state: UnknownActorState,
  receiverCode: string,
  holderCode: string | null,
): UnknownActorState {
  if (!cardIsFaceDown(state) || holderCode === receiverCode) return state;

  const redacted = structuredClone(state) as CardState;
  redacted.faceURL = redacted.backURL;
  redacted.cols = 1;
  redacted.rows = 1;
  redacted.sequence = 0;
  return redacted;
}
