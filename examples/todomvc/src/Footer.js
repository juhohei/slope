import React from 'react'

import {currentRouteS} from './state'
import {navigate}      from './actions'
import {S, lift}       from '../../..'

const routes = [
  {
    href: '#/',
    label: 'All'
  },
  {
    href: '#/active',
    label: 'Active'
  },
  {
    href: '#/completed',
    label: 'Completed'
  }
]

export default function Footer () {
  return (
    <footer className="footer">
      {/*lift(countP
        .map('.remaining')
        .map(n => <span className="todo-count"><strong>{n}</strong> item{n !== 1 ? 's' : ''} left</span>)
      )*/}
      <ul className="filters">
        {lift(S.map(currentRoute => routes.map(route => (
          <li key={route.href}>
            <a href={route.href}
               onClick={() => navigate(route.href)}
               className={currentRoute === route.href ? 'selected' : ''}>
              {route.label}
            </a>
          </li>
        )), currentRouteS))}
      </ul>
      {/*lift(countP
        .map('.completed')
        .map(n => n > 0
          ? <button className="clear-completed" onClick={clear}>Clear completed</button>
          : null
        )
      )*/}
    </footer>
  )
}

