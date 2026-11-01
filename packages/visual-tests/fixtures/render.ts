import { ActorType } from '@tt/states';
import { buildDemoFixture } from './demo';
import { manifestActor } from './manifest';

export function buildRenderFixture(assetURL: string, guid: string, behavior: 'move' | 'rotate' | 'flip' | 'extract') {
  const actor = manifestActor(guid);
  const fixture = buildDemoFixture(assetURL, 'default', [actor.guid]);
  const target = fixture.actorStates![0];
  target.transformation!.position = [0, 3, 0];
  target.transformation!.rotation = [0, 0, 0];
  // Isolate rendering from floor contacts in these focused fixtures. The
  // normal-gravity action matrix still checks real settling and physics.
  fixture.gravity = 0.000001;
  if ('cards' in target) target.cards = target.cards.slice(0, 8);
  if (target.type === ActorType.CARD) {
    // Keep the card distinct from the felt so a missing or unrotated mesh
    // cannot disappear within the image comparison's pixel allowance.
    if (behavior === 'rotate') target.faceURL = target.backURL = new URL('/assets/wood_diff.png', assetURL).href;
    target.cols = target.rows = 1;
    target.sequence = 0;
  }
  if ('cards' in target) {
    for (const card of target.cards) {
      card.faceURL = new URL('/assets/wood_diff.png', assetURL).href;
      card.cols = card.rows = 1;
      card.sequence = 0;
    }
  }
  return fixture;
}
