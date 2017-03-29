import React  from 'react'

import {count} from './actions'


export default function Controls () {
  return (
    <div>
      <button onClick={() => count(1)}>+</button>
      <button onClick={() => count(-1)}>-</button>
    </div>
  )
}
