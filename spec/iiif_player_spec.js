import IIIFPlayer from '../app/iiif_player'

let iiifPlayer

describe('An Avalon class', () => {
  beforeAll(() => {
    // Load fixtures
    jasmine.getFixtures().fixturesPath = 'base/spec/fixtures'
    loadFixtures('test_fixture.html')
  })

  it('should be initialized', () => {
    iiifPlayer = new IIIFPlayer()
    iiifPlayer.initialize()
    expect(iiifPlayer.toBeDefined)
    expect(iiifPlayer.configObj.toBeDefined)
  })
})
