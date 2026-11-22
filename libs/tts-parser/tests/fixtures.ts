/** Minimal but structurally complete save used as a base for edge-case fixtures. */
export function baseSave(): { [key: string]: unknown; ObjectStates: Record<string, unknown>[] } {
  return {
    SaveName: 'fixture',
    Date: '1/1/2026 12:00:00 AM',
    VersionNumber: 'v13.3',
    Gravity: 1,
    Table: 'Table_Custom',
    Sky: 'Sky_Museum',
    ObjectStates: [
      {
        GUID: 'aabbcc',
        Name: 'Card',
        Transform: { posX: 0, posY: 1, posZ: 0, rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1, scaleZ: 1 },
        Nickname: '',
        Description: '',
        GMNotes: '',
        AltLookAngle: { x: 0, y: 0, z: 0 },
        ColorDiffuse: { r: 0.5, g: 0.5, b: 0.5 },
        LayoutGroupSortIndex: 0,
        Value: 0,
        Locked: false,
        Grid: true,
        Snap: true,
        IgnoreFoW: false,
        MeasureMovement: false,
        DragSelectable: true,
        Autoraise: true,
        Sticky: true,
        Tooltip: true,
        GridProjection: false,
        CardID: 100,
        Hands: true,
        HideWhenFaceDown: true,
        SidewaysCard: false,
        RPGmode: null, // The game writes explicit nulls for unset nullable fields
        XmlUI: '',
        LuaScript: '',
        LuaScriptState: '',
      },
    ],
  };
}
