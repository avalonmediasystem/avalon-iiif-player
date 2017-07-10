import Avalon from '../app/avalon/avalon'

let avalon

describe('An Avalon class', () => {
  beforeAll(() => {
    // Load fixtures
    jasmine.getFixtures().fixturesPath = 'base/spec/fixtures'
    loadFixtures('myfixture.html')
  })

  it('should be initialized', () => {
    avalon = new Avalon()
    avalon.initialize()
    expect(avalon.toBeDefined)
    expect(avalon.configObj.toBeDefined)
  })
})
