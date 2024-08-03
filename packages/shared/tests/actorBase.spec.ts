import { Mesh, NullEngine, Scene, Vector3 } from '@babylonjs/core';
import { ActorBase } from '@shared/playground';

describe('ActorBase', () => {
  beforeAll(() => {
    const engine = new NullEngine();
    new Scene(engine);
  });

  it('should create an instance of ActorBase', () => {
    const actor = new ActorBase('guid', 'name', new Mesh('mesh'), new Mesh('mesh'));
    expect(actor).to.be.an.instanceOf(ActorBase);
  });

  it('should have the correct properties', () => {
    const actor = new ActorBase('guid', 'name', new Mesh('mesh'), new Mesh('mesh'));
    expect(actor.guid).to.equal('guid');
    expect(actor.name).to.equal('name');
    expect(actor.model).to.be.an.instanceOf(Mesh);
  });

  it('should set the transformations correctly', () => {
    const actor = new ActorBase('guid', 'name', new Mesh('mesh'), new Mesh('mesh'), {
      scale: [2, 2, 2],
      rotation: [Math.PI / 2, 0, 0],
      position: [1, 1, 1],
    });
    expect(actor.scaling).to.deep.equal(new Vector3(2, 2, 2));
    expect(actor.rotation).to.deep.equal(new Vector3(Math.PI / 2, 0, 0));
    expect(actor.position).to.deep.equal(new Vector3(1, 1, 1));
  });

  it('should move the actor correctly', () => {
    const actor = new ActorBase('guid', 'name', new Mesh('mesh'), new Mesh('mesh'));
    actor.move(1, 2, 3);
    actor.move(1, 2, 3);
    expect(actor.position).toMatchObject(new Vector3(2, 4, 6));
  });
});
