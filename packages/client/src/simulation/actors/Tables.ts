import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';

import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { TableState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import {
  CustomRectangleTableMixin,
  CustomSquareTableMixin,
  GlassTableMixin,
  HexTableMixin,
  Loader,
  OctagonTableMixin,
  PokerTableMixin,
  RectangleTableMixin,
  SquareTableMixin,
} from '@shared/playground';
import { getGlassMaterial } from '@shared/playground/materials/glassMaterial';
import { degToRad } from '@shared/utils';
import { AssetsManager } from './AssetsManages';
import { ClientBase } from './ClientBase';

export class HexTable extends HexTableMixin(ClientBase) {
  static async fromState(): Promise<HexTable | null> {
    const [leg, _] = await Loader.loadModel(AssetsManager.HEX_TABLE_MODEL.leg);
    const [top, __] = await Loader.loadModel(AssetsManager.HEX_TABLE_MODEL.top);

    if (!top || !leg) return null;

    [leg, top].forEach(mesh => mesh.setEnabled(true));
    (top.material as StandardMaterial).specularColor = Color3.Black();

    leg.position.z = -14;

    const wrapper = new Mesh('hex_table_wrapper');
    wrapper.addChild(top);
    wrapper.addChild(leg);

    const table = new this(
      {
        guid: '#HexTable',
        name: '#HexTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.HEX_TABLE_MODEL.transformation,
      },
      wrapper,
    );
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}

export class CircleTable extends CircleTableMixin(ClientBase) {
  static async fromState(): Promise<CircleTable | null> {
    const glass = await Loader.loadMesh(AssetsManager.CIRCLE_TABLE_MODEL.glass.meshURL);
    const [legs] = await Loader.loadModel(AssetsManager.CIRCLE_TABLE_MODEL.legs);
    const [top] = await Loader.loadModel(AssetsManager.CIRCLE_TABLE_MODEL.top);

    if (!glass || !legs || !top) return null;
    [glass, legs, top].forEach(mesh => mesh.setEnabled(true));

    glass.material = getGlassMaterial();
    (top.material as StandardMaterial).specularColor = Color3.Black();

    const wrapper = new Mesh('circle_table_wrapper');
    wrapper.addChild(glass);
    wrapper.addChild(legs);
    wrapper.addChild(top);

    const table = new this(
      {
        guid: '#CircleTable',
        name: '#CircleTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.CIRCLE_TABLE_MODEL.transformation,
      },
      wrapper,
    );
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}

export class GlassTable extends GlassTableMixin(ClientBase) {
  static async fromState(): Promise<GlassTable | null> {
    const [metal] = await Loader.loadModel(AssetsManager.GLASS_TABLE_MODEL.metal);
    const [glassMid, _gCollider] = await Loader.loadModel(AssetsManager.GLASS_TABLE_MODEL.glassMid);
    const [glassBottom, _gTopCollider] = await Loader.loadModel(AssetsManager.GLASS_TABLE_MODEL.glassTop);

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

    const table = new this(
      {
        guid: '#CustomSquareTable',
        name: '#CustomSquareTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.GLASS_TABLE_MODEL.transformation,
      },
      wrapper,
    );
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
export class SquareTable extends SquareTableMixin(ClientBase) {
  static async fromState(): Promise<SquareTable | null> {
    const [model, _] = await Loader.loadModel(AssetsManager.SQUARE_TABLE_MODEL.frame);
    if (!model) return null;

    (model.material as StandardMaterial).diffuseColor = new Color3(0.5, 0, 0);
    (model.material as StandardMaterial).specularColor = Color3.Black();

    const table = new this(
      {
        guid: '#SquareTable',
        name: '#SquareTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.SQUARE_TABLE_MODEL.transformation,
      },
      model,
    );
    if (table) {
      table.model.isPickable = false;
    }
    return table;
  }
}

export class CustomRectangleTable extends CustomRectangleTableMixin(ClientBase) {
  static async fromState(tableState: TableState): Promise<CustomRectangleTable | null> {
    const [tableFrame, _] = await Loader.loadModel(AssetsManager.CUSTOM_RECTANGLE_TABLE.frame);
    const grid = await Loader.loadMesh(AssetsManager.CUSTOM_RECTANGLE_TABLE.grid.meshURL);
    if (!tableFrame || !grid) return null;
    const wrapper = new Mesh('rectangle_table_wrapper');
    [tableFrame, grid].forEach(mesh => mesh.setEnabled(true));
    [tableFrame, grid].forEach(mesh => wrapper.addChild(mesh));
    if (grid) {
      grid.material = tableFrame.material;
      grid.rotation.x = -Math.PI / 2;
      grid.position.y = 0.215;
    }
    const plane = CreatePlane('plane', { width: 1.108891, height: 0.66187126 });
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.3;
    const planeMatetialProps = tableState.url ? { diffuseURL: tableState.url } : AssetsManager.feltMaterialProps;
    const planeMatetial = await Loader.loadModelMaterial(planeMatetialProps);
    planeMatetial.specularColor = Color3.Black();
    plane.material = planeMatetial;
    wrapper.addChild(plane);
    wrapper.scaling = Vector3.FromArray(AssetsManager.CUSTOM_RECTANGLE_TABLE.transformation.scale);
    wrapper.position.y = -23.2;
    const table = new this(
      {
        guid: '#CustomRectangleTable',
        name: '#CustomRectangleTable',
        type: ActorType.ACTOR,
      },
      wrapper,
    );

    table.model.isPickable = false;
    return table;
  }
}
export class OctagonTable extends OctagonTableMixin(ClientBase) {
  static async fromState(): Promise<OctagonTable | null> {
    const [leg, _] = await Loader.loadModel(AssetsManager.OCTAGON_TABLE.leg);
    const [top, __] = await Loader.loadModel(AssetsManager.OCTAGON_TABLE.top);

    if (!top || !leg) return null;
    [leg, top].forEach(mesh => mesh.setEnabled(true));
    (top.material as StandardMaterial).specularColor = Color3.Black();

    leg.position.z = -14;
    const wrapper = new Mesh('octagon_table_wrapper');
    wrapper.addChild(top);
    wrapper.addChild(leg);

    wrapper.rotation.x = (6 * Math.PI) / 4;
    wrapper.rotation.y = degToRad(22.5);
    wrapper.scaling = wrapper.scaling.scale(1.04);
    wrapper.position.y = -0.65;

    const table = new this(
      {
        guid: '#OctagonTable',
        name: '#OctagonTable',
        type: ActorType.ACTOR,
      },
      wrapper,
    );
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
export class CustomSquareTable extends CustomSquareTableMixin(ClientBase) {
  static async fromState(tableState: TableState): Promise<CustomSquareTable | null> {
    const [tableBox, _tableCollider] = await Loader.loadModel(AssetsManager.CUSTOM_SQUARE_TABLE.frame);
    if (!tableBox) return null;

    const plane = CreatePlane('CustomSquareTablePlane', { size: 0.8554 });
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.85;

    const planeMatetial = await Loader.loadModelMaterial({ diffuseURL: tableState.url! });
    plane.material = planeMatetial;
    planeMatetial.specularColor = Color3.Black();

    const wrapper = new Mesh('CustomSquareTable');
    wrapper.addChild(tableBox);
    wrapper.addChild(plane);

    tableBox.setEnabled(true);

    const table = new this(
      {
        guid: '#CustomSquareTable',
        name: '#CustomSquareTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.CUSTOM_SQUARE_TABLE.transformation,
      },
      wrapper,
    );
    if (tableBox) {
      table.model.isPickable = false;
    }

    return table;
  }
}

export class RectangleTable extends RectangleTableMixin(ClientBase) {
  static async fromState(): Promise<RectangleTable | null> {
    const [tableFrame] = await Loader.loadModel(AssetsManager.RECTANGLE_TABLE.frame);

    const handles = await Loader.loadMesh(AssetsManager.RECTANGLE_TABLE.handles.meshURL);
    const feltMaterial = await Loader.loadModelMaterial(AssetsManager.feltMaterialProps);
    if (!tableFrame || !handles) return null;

    const wrapper = new Mesh('rectangle_table_wrapper');
    const felt = CreatePlane('felt', { width: 57, height: 38 });
    felt.rotation.x = Math.PI / 2;
    felt.position.y = 0.85;
    [tableFrame, handles].forEach(mesh => mesh.setEnabled(true));
    [tableFrame, handles, felt].forEach(mesh => wrapper.addChild(mesh));
    if (AssetsManager.feltMaterialProps) {
      feltMaterial.specularColor = Color3.Black();
      felt.material = feltMaterial;
    }

    const table = new this(
      {
        guid: '#RectangleTable',
        name: '#RectangleTable',
        type: ActorType.ACTOR,
      },
      wrapper,
    );

    table.model.isPickable = false;
    return table;
  }
}
export class PokerTable extends PokerTableMixin(ClientBase) {
  static async fromState(): Promise<PokerTable | null> {
    const [frame, _] = await Loader.loadModel(AssetsManager.POKER_TABLE.frame);
    const [legs, __] = await Loader.loadModel(AssetsManager.POKER_TABLE.legs);

    if (!frame || !legs) return null;

    const wrapper = new Mesh('poker_table_wrapper');
    [frame, legs].forEach(mesh => mesh.setEnabled(true));
    [frame, legs].forEach(mesh => wrapper.addChild(mesh));

    legs.position.z = -0.223;

    wrapper.scaling = wrapper.scaling.scale(40.5);
    wrapper.position.y = -9.25;
    wrapper.rotation.x = (3 * Math.PI) / 2;

    const table = new this(
      {
        guid: '#PokerTable',
        name: '#PokerTable',
        type: ActorType.ACTOR,
      },
      wrapper,
    );

    table.model.isPickable = false;
    return table;
  }
}
