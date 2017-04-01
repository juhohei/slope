import React from 'react'

import {add, submit} from './actions'

export default function Header () {
  return (
    <header className="header">
      <h1>todos</h1>
      <input className="new-todo"
             placeholder="What needs to be done?"
             onChange={add}
             onKeyUp={submit}
             autoFocus/>
    </header>
  )
}
