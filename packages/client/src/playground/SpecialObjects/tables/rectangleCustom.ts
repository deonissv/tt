import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Loader } from '../../loader';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Actor } from '@shared/playground/Actor';

const STATIC_SERVER = 'http:/localhost:5500';
const SCALING = 87;

const meshSizes = (mesh: Mesh) => {
  const vectorsWorld = mesh.getBoundingInfo().boundingBox.vectorsWorld;
  const width = Math.abs(vectorsWorld[1].x - vectorsWorld[0].x);
  const height = Math.abs(vectorsWorld[1].y - vectorsWorld[0].y);
  const depth = Math.abs(vectorsWorld[1].z - vectorsWorld[0].z);
  return { width, height, depth };
};

const model = {
  meshURL: `${STATIC_SERVER}/GreenFelt_Table.obj`,
  diffuseURL: `${STATIC_SERVER}/GreenFeltTable_D.png`,
  specularURL: `${STATIC_SERVER}/GreenFeltTable_S.png`,
  normalURL: `${STATIC_SERVER}/GreenFeltTable_N.png`,
};

export const RectangleCustomTableBuilder = async (url?: string) => {
  const wrapper = await Loader.loadMesh(`${STATIC_SERVER}/GreenFelt_Table.obj`);
  if (!wrapper) {
    return null;
  }

  const material = await Loader.loadModelMaterial(model);
  wrapper.material = material;

  const grid = await Loader.loadMesh(`${STATIC_SERVER}/GreenFelt_Table_Grid.obj`);

  if (grid) {
    grid.material = material;
    grid.setEnabled(true);
    wrapper.addChild(grid);
    grid.rotation.x = -Math.PI / 2;
  }

  const felt = await Loader.loadMesh(`${STATIC_SERVER}/GreenFelt_Table_Felt.obj`);

  if (felt) {
    const { width, depth } = meshSizes(felt);

    const plane = CreatePlane('plane', { width: width, height: depth });
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.3;

    const planeMatetial = await Loader.loadModelMaterial({ diffuseURL: url });
    plane.material = planeMatetial;
    wrapper.addChild(plane);
  }

  wrapper.scaling = new Vector3(SCALING, SCALING, SCALING);
  const wrapperHeight = meshSizes(wrapper).height;
  wrapper.position.y = -(wrapperHeight * SCALING) / 2;
  wrapper.setEnabled(true);

  // const state: ActorState = {
  //   guid: '1',
  //   name: 'Rectangle Custom Table',
  //   // transformation: {
  //   //   rotation: [4.71, 0, 0],
  //   //   scale: [1.2, 1.2, 1.2],
  //   // },
  //   ,
  //   children: [
  //     {
  //       guid: '2',
  //       name: 'Rectangle Custom Table - plane',
  //       model: {
  //         meshURL: `${STATIC_SERVER}/GreenFelt_Table_Felt.obj`,
  //         diffuseURL: url,
  //       },
  //     },
  //     {
  //       guid: '3',
  //       name: 'Rectangle Custom Table - handles',
  //       transformation: {
  //         rotation: [-3.14 / 2, 0, 0],
  //         position: [0, 1, 0],
  //       },
  //       model: {
  //         meshURL: `${STATIC_SERVER}/GreenFelt_Table_Grid.obj`,
  //         diffuseURL: `${STATIC_SERVER}/GreenFeltTable_D.png`,
  //         specularURL: `${STATIC_SERVER}/GreenFeltTable_S.png`,
  //         normalURL: `${STATIC_SERVER}/GreenFeltTable_N.png`,
  //       },
  //     },
  //   ],
  // };
  const actor = new Actor('RectangleCustomTable', 'RectangleCustomTable', wrapper!);
  if (actor) {
    actor.model.isPickable = false;
  }
  return actor;
};
