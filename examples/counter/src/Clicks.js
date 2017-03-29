import React  from 'react'
import {lift} from '../../..'

import {clicks} from './state'


export default function Clicks () {
  return (
    <div>
      The controls have been clicked {lift(clicks)} times.
    </div>
  )
}
