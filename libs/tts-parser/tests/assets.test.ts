import { collectAssetRefs, parseTtsSave } from '../src';

describe('asset collection', () => {
  it('collects every asset URL family with its source and object attribution', () => {
    const save = {
      SaveName: 'assets',
      TableURL: 'http://example.com/table.obj',
      SkyURL: 'http://example.com/sky.jpg',
      Lighting: { LutURL: 'http://example.com/lut.png' },
      MusicPlayer: {
        RepeatSong: false,
        PlaylistEntry: 0,
        CurrentAudioTitle: 'song',
        CurrentAudioURL: 'http://example.com/current.mp3',
        AudioLibrary: [{ Item1: 'song', Item2: 'http://example.com/song.mp3' }],
      },
      ObjectStates: [
        {
          GUID: 'deck1',
          Name: 'DeckCustom',
          CustomDeck: {
            '100': { FaceURL: 'http://example.com/faces.png', BackURL: 'http://example.com/backs.png' },
          },
          DeckIDs: [10001],
          ContainedObjects: [],
        },
        {
          GUID: 'model1',
          Name: 'Custom_Model',
          CustomMesh: {
            MeshURL: 'http://example.com/mesh.obj',
            DiffuseURL: 'http://example.com/diffuse.png',
            NormalURL: 'http://example.com/normal.png',
            ColliderURL: 'http://example.com/collider.obj',
            Convex: true,
            MaterialIndex: 0,
            TypeIndex: 0,
          },
        },
        {
          GUID: 'pdf1',
          Name: 'Custom_PDF',
          CustomPDF: { PDFUrl: 'http://example.com/book.pdf', PDFPassword: '', PDFPage: 0, PDFPageOffset: 0 },
        },
        {
          GUID: 'tablet1',
          Name: 'Tablet',
          Tablet: { PageURL: 'http://example.com/app' },
        },
      ],
    };

    const result = parseTtsSave(JSON.stringify(save));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const bySource = (source: string) => result.assets.filter(a => a.source === source);
    expect(bySource('SaveState.TableURL').map(a => a.url)).toEqual(['http://example.com/table.obj']);
    expect(bySource('SaveState.SkyURL').length).toBe(1);
    expect(bySource('LightingState.LutURL').length).toBe(1);
    expect(bySource('MusicPlayerState.CurrentAudioURL').length).toBe(1);
    expect(bySource('AudioLibraryEntry.Item2').map(a => a.url)).toEqual(['http://example.com/song.mp3']);
    expect(bySource('CustomDeckState.FaceURL').map(a => a.objectGuid)).toEqual(['deck1']);
    expect(bySource('CustomMeshState.MeshURL').map(a => a.objectGuid)).toEqual(['model1']);
    expect(bySource('CustomMeshState.ColliderURL').length).toBe(1);
    expect(bySource('CustomPDFState.PDFUrl').map(a => a.objectGuid)).toEqual(['pdf1']);
    expect(bySource('TabletState.PageURL').map(a => a.objectGuid)).toEqual(['tablet1']);
  });

  it('collects assets beyond the old 128-depth scanner limit', () => {
    const mesh = {
      GUID: 'model1',
      Name: 'Custom_Model',
      CustomMesh: { MeshURL: 'https://example.com/deep.obj' },
    };
    let object: Record<string, unknown> = mesh;
    for (let i = 0; i < 70; i++) {
      object = { GUID: `bag${i}`, Name: 'Bag', ContainedObjects: [object] };
    }
    const save = { ObjectStates: [object] };
    const result = parseTtsSave(JSON.stringify(save));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.assets).toEqual([
      { url: 'https://example.com/deep.obj', source: 'CustomMeshState.MeshURL', objectGuid: 'model1' },
    ]);
    expect(collectAssetRefs(save)).toEqual(result.assets);
    expect(collectAssetRefs(save, 8)).toEqual([]);
  });

  it('ignores empty and non-remote values', () => {
    const save = {
      SaveName: 'noassets',
      ObjectStates: [
        {
          GUID: 'model1',
          Name: 'Custom_Model',
          CustomMesh: {
            MeshURL: '',
            DiffuseURL: 'not a url',
            NormalURL: '',
            ColliderURL: '',
            Convex: true,
            MaterialIndex: 0,
            TypeIndex: 0,
          },
        },
      ],
    };
    const result = parseTtsSave(JSON.stringify(save));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.assets).toEqual([]);
  });
});
