import HashHandler from '../app/hash_handler'

let lunchRoomMannersJSON = {}

describe('the Hash Handler class', () => {
  beforeAll(() => {
    // Load JSON fixture
    jasmine.getJSONFixtures().fixturesPath = 'base/build'
    lunchRoomMannersJSON = getJSONFixture('lunchroom_manners_v2.json')
  })

  it('returns an object with starting/stopping time and quality when given a location hash', () => {
    let playerClass = {
      contentObj: lunchRoomMannersJSON.content[0]
    }
    let hashHandler = new HashHandler({ playerClass: playerClass })

    let options = hashHandler.processHash('#avalon/time/227,245/quality/Medium')
    expect(options).toEqual({start: '227', stop: '245', time: '227,245', quality: 'Medium'})
  })
})
