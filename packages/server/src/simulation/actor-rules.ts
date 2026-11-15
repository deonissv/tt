import { can as canState, type Capability, type PlayerCtx } from '@tt/rules';
import type { UnknownActorState } from '@tt/states';
import type { Bag, Deck, ServerBase, ServerDie, TileStack } from './actors';

// ServerActorBuilder constructs the actor class matching its state type.
// These predicates add server method types to the shared permission rules.
export function can(
  actor: ServerBase,
  capability: Capability.Container,
  ctx?: PlayerCtx,
): actor is Bag | Deck | TileStack;
export function can(actor: ServerBase, capability: Capability.Shuffleable, ctx?: PlayerCtx): actor is Bag | Deck;
export function can(actor: ServerBase, capability: Capability.Rollable, ctx?: PlayerCtx): actor is ServerDie;
export function can(actor: ServerBase, capability: Capability, ctx?: PlayerCtx): boolean;
export function can(actor: ServerBase, capability: Capability, ctx?: PlayerCtx): boolean {
  return canState(actor.toState() as UnknownActorState, capability, ctx);
}
