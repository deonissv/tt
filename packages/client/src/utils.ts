import { AccessTokenDto } from '@shared/dto/auth/access-token';
import { SaveState } from '../../shared/models/tts-model/SaveState';
import { PlaygroundStateSave, TableType } from '@shared/index';

import { ActorState } from '@shared/dto/pg/actorState';
import { ObjectState } from '@shared/models/tts-model/ObjectState';

export const fileToUrl = (file: File, type = 'application/octet-stream'): string => {
  const textureBlob = new Blob([file], { type });
  return URL.createObjectURL(textureBlob);
};

export const saveAccessToken = (tokenDto: AccessTokenDto): void => {
  window.localStorage.setItem('access_token', tokenDto.access_token);
};

export const getAccessToken = (): string | null => {
  return window.localStorage.getItem('access_token');
};

export const resetAccessToken = (): void => {
  window.localStorage.removeItem('access_token');
};

export const parseTtsSave = (tts: string): PlaygroundStateSave | null => {
  try {
    const obj = JSON.parse(tts) as SaveState;
    const save: PlaygroundStateSave = {};

    save.gravity = obj.Gravity;
    save.leftHandedSystem = true;

    save.table = {
      type: obj.Table as TableType,
      url: obj.TableURL,
    };

    save.actorStates = obj.ObjectStates.reduce<ActorState[]>((acc, o) => {
      const actorState = parseTtsObjectState(o);
      if (actorState) {
        acc.push(actorState);
      }
      return acc;
    }, []);
    return save;
  } catch (e) {
    console.error('Tts parse failed', e);
    return null;
  }
};

export const parseTtsObjectState = (objectState: ObjectState): ActorState | null => {
  try {
    const actorState: ActorState = {
      name: objectState.Nickname,
      guid: objectState.GUID,
      model: {
        meshURL: objectState.CustomMesh.MeshURL,
        colliderURL: objectState.CustomMesh.ColliderURL != '' ? objectState.CustomMesh.ColliderURL : undefined,
        diffuseURL: objectState.CustomMesh.DiffuseURL != '' ? objectState.CustomMesh.DiffuseURL : undefined,
        normalURL: objectState.CustomMesh.NormalURL != '' ? objectState.CustomMesh.NormalURL : undefined,
      },
      transformation: {
        position: [objectState.Transform.posX, objectState.Transform.posY, objectState.Transform.posZ],
        rotation: [objectState.Transform.rotX, objectState.Transform.rotY, objectState.Transform.rotZ].map(degToRad),
        scale: [objectState.Transform.scaleX, objectState.Transform.scaleY, objectState.Transform.scaleZ],
      },
    };

    if (objectState?.Rigidbody?.Mass) {
      actorState.mass = objectState?.Rigidbody?.Mass;
    }

    if (objectState?.ColorDiffuse) {
      actorState.colorDiffuse = [objectState.ColorDiffuse.r, objectState.ColorDiffuse.g, objectState.ColorDiffuse.b];
      if (objectState.ColorDiffuse.a && objectState.ColorDiffuse.a !== 1) {
        actorState.colorDiffuse.push(objectState.ColorDiffuse.a);
      }
    }

    if (objectState?.ChildObjects) {
      actorState.children = objectState.ChildObjects.reduce<ActorState[]>((acc, o) => {
        const actorState = parseTtsObjectState(o);
        if (actorState) {
          acc.push(actorState);
        }
        return acc;
      }, []);
    }

    return actorState;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const degToRad = (deg: number): number => deg * (Math.PI / 180);
