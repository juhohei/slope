import React from 'react'

import Todo        from './Todo'
import {lift, S}   from '../../..'
import {todosS}    from './state'
import {toggleAll} from './actions'

export default function Todos () {
  return (
    <section className="main">
      <input onChange={toggleAll} className="toggle-all" type="checkbox"/>
      <label htmlFor="toggle-all">Mark all as complete</label>
      <ul className="todo-list">
        {lift(S.map(todos => todos.map(todo => <Todo key={todo.id} {...todo}/>), todosS))}
      </ul>
    </section>
  )
}
