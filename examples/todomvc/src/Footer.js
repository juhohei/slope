import React from 'react'

import {currentRouteS, countS} from './state'
import {navigate, clear}       from './actions'
import {S, lift}               from '../../..'

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
      {lift(S.map(todos => (
        <span className="todo-count"><strong>{todos.remaining}</strong> item{todos.remaining !== 1 ? 's' : ''} left</span>
      ), countS))}
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
      {lift(S.map(todos => (todos.completed > 0
        ? <button className="clear-completed" onClick={clear}>Clear completed</button>
        : null
      ), countS))}
    </footer>
  )
}

