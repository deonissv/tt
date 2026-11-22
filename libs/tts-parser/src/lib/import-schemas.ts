import { z } from 'zod';
import {
  ColourStateSchema,
  CustomDeckStateSchema,
  CustomImageStateSchema,
  CustomMeshStateSchema,
  CustomTileStateSchema,
  ObjectStateSchema,
  RigidbodyStateSchema,
  RotationValueStateSchema,
  SaveStateSchema,
  TransformStateSchema,
  Vector3Schema,
} from '@tt/tts-schema';
import { TileType } from '@tt/states';
import type { ActorBaseState, CustomImage, Model, RotationValue, Transformation } from '@tt/states';
import { degToRad, isUnknownObject, isURL } from '@tt/utils';

/** Application import constraints are views of the wire schemas, not a second save format. */
export function createImportSchemas(report: (issues: z.core.$ZodIssue[]) => void) {
  // Numeric strings occur in old/modded saves. Do not coerce null, booleans or empty strings to zero.
  const numeric = z.union([z.number(), z.string().trim().min(1).pipe(z.coerce.number())]);
  // Validate with Zod but retain URL spelling, including whitespace in legacy exports.
  const remoteUrl = z.string().refine(isURL, 'Expected an HTTP(S) URL');

  // Preserve partial import: an invalid optional field is reported and omitted, not fatal to its owner.
  function optional<T extends z.ZodType>(key: string, schema: T) {
    return schema.optional().catch(ctx => {
      report(
        ctx.issues.map(issue =>
          z.core.util.finalizeIssue({ ...issue, path: [key, ...(issue.path ?? [])] }, undefined, z.config()),
        ),
      );
      return undefined;
    });
  }

  function optionalUrl(key: string) {
    return z.preprocess(value => (value === '' ? undefined : value), optional(key, remoteUrl));
  }

  const identity = ObjectStateSchema.pick({ GUID: true, Name: true });
  const transform = TransformStateSchema.extend({
    posX: optional('Transform.posX', numeric),
    posY: optional('Transform.posY', numeric),
    posZ: optional('Transform.posZ', numeric),
    rotX: optional('Transform.rotX', numeric),
    rotY: optional('Transform.rotY', numeric),
    rotZ: optional('Transform.rotZ', numeric),
    scaleX: optional('Transform.scaleX', numeric),
    scaleY: optional('Transform.scaleY', numeric),
    scaleZ: optional('Transform.scaleZ', numeric),
  }).transform(({ posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ }) => {
    const result: Transformation = {};
    if (posX !== undefined && posY !== undefined && posZ !== undefined) result.position = [posX, posY, posZ];
    if (rotX !== undefined && rotY !== undefined && rotZ !== undefined) {
      result.rotation = [degToRad(rotX), degToRad(rotY), degToRad(rotZ)];
    }
    if (scaleX !== undefined && scaleY !== undefined && scaleZ !== undefined) result.scale = [scaleX, scaleY, scaleZ];
    return result.position || result.rotation || result.scale ? result : undefined;
  });

  const base = identity
    .extend({
      Transform: optional('Transform', transform),
      Rigidbody: optional(
        'Rigidbody',
        RigidbodyStateSchema.pick({ Mass: true }).extend({ Mass: optional('Mass', numeric) }),
      ),
      ColorDiffuse: optional('ColorDiffuse', ColourStateSchema.nullable()),
      Locked: optional('Locked', ObjectStateSchema.shape.Locked),
    })
    .transform(data => {
      const actor: Omit<ActorBaseState, 'type'> = { guid: data.GUID, name: data.Name };
      if (data.Transform !== undefined) actor.transformation = data.Transform;
      if (data.Rigidbody?.Mass !== undefined) actor.mass = data.Rigidbody.Mass;
      if (data.ColorDiffuse) {
        const { r, g, b, a } = data.ColorDiffuse;
        actor.colorDiffuse = [r, g, b];
        if (a && a !== 1) actor.colorDiffuse.push(a);
      }
      if (data.Locked) actor.locked = true;
      return actor;
    });

  const model = CustomMeshStateSchema.pick({ MeshURL: true })
    .extend({
      MeshURL: remoteUrl,
      ColliderURL: optionalUrl('ColliderURL'),
      DiffuseURL: optionalUrl('DiffuseURL'),
      NormalURL: optionalUrl('NormalURL'),
    })
    .transform(
      data =>
        ({
          meshURL: data.MeshURL,
          ...(data.ColliderURL !== undefined ? { colliderURL: data.ColliderURL } : {}),
          ...(data.DiffuseURL !== undefined ? { diffuseURL: data.DiffuseURL } : {}),
          ...(data.NormalURL !== undefined ? { normalURL: data.NormalURL } : {}),
        }) satisfies Model,
    );

  const imageInput = CustomImageStateSchema.pick({ ImageURL: true }).extend({
    ImageURL: remoteUrl,
    ImageSecondaryURL: optionalUrl('ImageSecondaryURL'),
    WidthScale: optional('WidthScale', numeric),
  });
  function imageState(data: z.output<typeof imageInput>): CustomImage {
    return {
      faceURL: data.ImageURL,
      ...(data.ImageSecondaryURL !== undefined ? { backURL: data.ImageSecondaryURL } : {}),
      ...(data.WidthScale !== undefined ? { widthScale: data.WidthScale } : {}),
    };
  }
  const image = imageInput.transform(imageState);
  const tileImage = imageInput
    .extend({
      CustomTile: optional('CustomTile', CustomTileStateSchema.pick({ Type: true }).extend({ Type: z.enum(TileType) })),
    })
    .transform(data => ({ ...imageState(data), tileType: data.CustomTile?.Type ?? TileType.BOX }));

  const rotation = RotationValueStateSchema.extend({
    Value: numeric,
    Rotation: Vector3Schema.extend({ x: numeric, y: numeric, z: numeric }),
  }).transform(
    data =>
      ({
        value: data.Value,
        rotation: [degToRad(data.Rotation.x), degToRad(data.Rotation.y), degToRad(data.Rotation.z)],
      }) satisfies RotationValue,
  );

  // Cards only consume the selected grid. Keep the map intact and validate that grid at lookup.
  const customDeck = optional('CustomDeck', z.custom<Record<string, unknown>>(isUnknownObject, 'Expected a deck map'));
  const containedObjects = z.array(z.unknown()).default([]);
  const dimension = numeric.pipe(z.number().int().positive());
  const deckGrid = CustomDeckStateSchema.pick({ FaceURL: true, BackURL: true }).extend({
    FaceURL: remoteUrl,
    BackURL: remoteUrl,
    NumWidth: optional('NumWidth', dimension),
    NumHeight: optional('NumHeight', dimension),
  });

  return {
    base,
    transform,
    model,
    image,
    rotation,
    deckGrid,
    gravity: optional('Gravity', numeric),
    table: SaveStateSchema.pick({ Table: true }).extend({
      TableURL: optionalUrl('TableURL'),
    }),
    bag: z.object({ ContainedObjects: containedObjects, CustomMesh: optional('CustomMesh', model) }),
    card: z.object({
      CardID: numeric.pipe(z.number().int().nonnegative()),
      CustomDeck: customDeck,
    }),
    deck: z.object({ ContainedObjects: containedObjects, CustomDeck: customDeck }),
    tile: z.object({ CustomImage: tileImage }),
    tileStack: ObjectStateSchema.pick({ Number: true }).extend({ Number: numeric.pipe(z.number().int().positive()) }),
    actor: z.object({ CustomMesh: model, ChildObjects: optional('ChildObjects', z.array(z.unknown())) }),
    rotationValues: ObjectStateSchema.pick({ RotationValues: true }).extend({ RotationValues: z.array(rotation) }),
  };
}
