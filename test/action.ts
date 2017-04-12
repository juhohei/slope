import {expect} from 'chai'
import {Action} from '../src'

describe('Action', () => {

  it('creates a pushable stream', () => {
    const push     = Action<number>()
    const expected = [1, 2, 3]
    push.stream(
      value  => {
        expect(value).to.eql(expected.shift())
      }
    )
    push(1)
    push(2)
    push(3)
  })

})

