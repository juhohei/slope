import React     from 'react'
import {S, lift} from '../../..'

import {search}        from './actions'
import {searchResults} from './state'


export default function Counter () {
  return (
    <div>
      <input onChange={e => search(e.target.value)}/>
      <div>
        {lift(S.map(json => <pre>{JSON.stringify(json)}</pre>, searchResults))}
      </div>
    </div>
  )
}
