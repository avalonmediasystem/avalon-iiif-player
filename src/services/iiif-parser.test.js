import manifest from '../json/lunchroom-manners';
import IIIFParser from './iiif-parser';

const iiifParser = new IIIFParser();

// TODO: Do we still need this?
it('should build a manifest map object', () => {
  const obj = iiifParser.buildManifestMap(manifest);

  expect(obj).toHaveProperty('hasCanvases');
  expect(obj).toHaveProperty('hasMultipleCanvases');
  expect(obj).toHaveProperty('hasSequences');
  expect(obj).toHaveProperty('isAudio');
  expect(obj).toHaveProperty('isVideo');
});

it('should contain a structures[] array which represents structured metadata', () => {
  expect(manifest.structures).toBeDefined();
  expect(Array.isArray(manifest.structures)).toBeTruthy();
});

// TODO: extend these tests to cover recursive calls
it('should create a nestable HTML unordered list structure from a manifest', () => {
  const html = iiifParser.createStructure(manifest.structures, undefined, true);
  const htmlArray = html.split('<ul>');

  expect(htmlArray[1]).toEqual('<li>Lunchroom Manners');
  expect(htmlArray[2]).toEqual('<li>Getting Ready for Lunch');
  expect(htmlArray[4]).toContain('<li><a');
});

it('should build a structure link from a member object', () => {
  const member = {
    id: 'http://dlib.indiana.edu/iiif_av/lunchroom_manners/range/1-1-1',
    type: 'Range',
    label: 'Using Soap',
    members: [
      {
        id:
          'http://dlib.indiana.edu/iiif_av/lunchroom_manners/canvas/1#t=157,160',
        type: 'Canvas'
      }
    ]
  };
  const expected = '<a href="http://dlib.indiana.edu/iiif_av/lunchroom_manners/canvas/1#t=157,160">Using Soap</a>';

  expect(iiifParser.buildStructureLink(member)).toEqual(expected);
});
