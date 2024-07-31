import type { StandardMaterial } from '@babylonjs/core';
import { Color3, Mesh, Vector3 } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { Loader } from '../../Loader';
import { ActorBase } from '../ActorBase';

export class GlassTable extends ActorBase {
  static async fromState(): Promise<GlassTable | null> {
    const [metal, _mCollider] = await Loader.loadModel({
      meshURL: `${STATIC_HOST}/glass_table_metal.obj`,
      diffuseURL: `${STATIC_HOST}/metal_diff.png`,
    });
    const [glassMid, _gCollider] = await Loader.loadModel({
      meshURL: `${STATIC_HOST}/glass_table_mid.obj`,
      diffuseURL: `${STATIC_HOST}/metal_diff.png`,
    });
    const [glassBottom, _gTopCollider] = await Loader.loadModel({
      meshURL: `${STATIC_HOST}/glass_table_top_bottom.obj`,
      diffuseURL: `${STATIC_HOST}/glass_table_N.png`,
    });

    if (!metal || !glassMid || !glassBottom) {
      return null;
    }

    const glassMaterial = glassBottom.material as StandardMaterial;
    glassMaterial.alpha = 0.5;
    glassMaterial.diffuseColor = new Color3(0, 0, 0.1);

    const glassTop = glassBottom.clone();
    [metal, glassMid, glassTop, glassBottom].forEach(mesh => mesh.setEnabled(true));

    const wrapper = new Mesh('glass_table_wrapper');
    glassBottom.position.z = 0.633;
    glassBottom.scaling.x = 0.45;
    glassBottom.scaling.y = 0.45;

    metal.rotation.x = Math.PI;
    metal.position.z = -0.037;

    glassTop.position.z = -0.134;

    wrapper.addChild(metal);
    wrapper.addChild(glassMid);
    wrapper.addChild(glassTop);
    wrapper.addChild(glassBottom);
    wrapper.position.y = -3;
    wrapper.rotation.x = Math.PI / 2;
    wrapper.scaling = new Vector3(38, 38, 38);

    const table = new GlassTable('#GlassTable', '#GlassTable', wrapper);
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
