import {S} from '../../..'

import * as actions from './actions'

export const counter       = S.scan((p, n) => p + n, 0, actions.count.stream)
export const clicks        = S.scan(p => p + 1, 0, actions.count.stream)
export const searchResults = S.flatMap(
  value => S.fromPromise(fakeAsync({value})),
  actions.search.stream
)

function fakeAsync (value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), 1000)
  })
}

