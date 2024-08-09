// actions sent by client
export const enum ClientAction {
  NICKNAME = 0,

  MOVE_ACTOR,

  PICK_ITEM,
  CURSOR,
  PICK_ACTOR,
  RELEASE_ACTOR,
}

// actions sent by server
export const enum ServerAction {
  CLIENT_ID = ClientAction.RELEASE_ACTOR + 1,
  STATE,
  DOWNLOAD_PROGRESS,

  MOVE_ACTOR,

  CURSORS,
  SPAWN_ACTOR, // spawnig absoultelly new actor
  DROP_ACTOR, // spawning actor that is present in original state save. e.g. dropping item deck / state
  REMOVE_ACTOR,
}

export type SimAction = ClientAction | ServerAction;
