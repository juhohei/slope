import React from 'react'

import Counter  from './Counter'
import Clicks   from './Clicks'
import Controls from './Controls'
import Search   from './Search'
import Link     from './Link'
import NotFound from './NotFound'

import {router}  from './state'
import {lift, S} from '../../..'


export default function App () {
  return (
    <main>
      {lift(S.map(route => {
        switch (route) {
          case '/':       return <div><Counter/><Clicks/><Controls/></div>
          case '/search': return <Search/>
          default:        return <NotFound/>
        }
      }, router))}
      <div><Link href="/">Counter</Link></div>
      <div><Link href="/search">Search</Link></div>
      <div><Link href="/404">404</Link></div>
    </main>
  )
}
