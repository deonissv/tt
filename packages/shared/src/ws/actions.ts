// actions sent by client
export enum ClientAction {
  NICKNAME = 'NICKNAME',

  MOVE_ACTOR = 'CLIENT_MOVE_ACTOR',

  PICK_ITEM = 'PICK_ITEM',
  ROLL = 'ROLL',
  CURSOR = 'CURSOR',
  PICK_ACTOR = 'PICK_ACTOR',
  RELEASE_ACTOR = 'RELEASE_ACTOR',
}

// actions sent by server
export enum ServerAction {
  CLIENT_ID = 'CLIENT_ID',
  STATE = 'STATE',
  DOWNLOAD_PROGRESS = 'DOWNLOAD_PROGRESS',

  MOVE_ACTOR = 'SERVER_MOVE_ACTOR',
  ROTATE_ACTOR = 'ROTATE_ACTOR',

  CURSORS = 'CURSORS',
  SPAWN_PICKED_ACTOR = 'SPAWN_PICKED_ACTOR', // spawnig absoultelly new actor
  SPAWN_ACTOR = 'SPAWN_ACTOR', // spawnig absoultelly new actor
  DROP_ACTOR = 'DROP_ACTOR', // spawning actor that is present in original state save. e.g. dropping item deck / state
  REMOVE_ACTOR = 'REMOVE_ACTOR',
}

export type SimAction = ClientAction | ServerAction;
