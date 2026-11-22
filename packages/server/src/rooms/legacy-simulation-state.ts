import { ActorType, type SimulationStateSave, type UnknownActorState } from '@tt/states';
import { isInfiniteBagName } from '@tt/tts-parser';

/**
 * Rooms start from parsed save content that earlier releases persisted, so a
 * stored state can predate features the current parser records. Re-derive
 * those flags in place before the simulation consumes the state.
 *
 * The first such case is the endless-container marker: parses made before the
 * flag existed dropped the bag's `infinite` marker, which turns an
 * Infinite_Bag into a regular container that empties after a single draw. The
 * stored actor keeps its reference-save name, so the same rule the parser
 * applies recovers the flag from it.
 *
 * @param simSave The simulation state a room is about to start from. Mutated
 * in place; both callers own a freshly materialized object.
 * @returns The same state, upgraded.
 */
export function upgradeLegacySimulationState(
  simSave: SimulationStateSave | undefined,
): SimulationStateSave | undefined {
  if (!simSave) return simSave;
  upgradeLegacyActorStates(simSave.actorStates ?? []);
  return simSave;
}

function upgradeLegacyActorStates(actorStates: UnknownActorState[]): void {
  for (const actorState of actorStates) {
    if (actorState.type !== ActorType.BAG) continue;
    if (!actorState.infinite && isInfiniteBagName(actorState.name)) actorState.infinite = true;
    // Drawn templates become live actors later, so nested bags need the flag too.
    upgradeLegacyActorStates(actorState.containedObjects);
  }
}
