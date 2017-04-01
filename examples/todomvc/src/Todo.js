import React from 'react'

import * as actions from './actions'

export default function Todo (todo) {
  const classes = (todo.completed ? 'completed' : '') + (todo.editing ? ' editing' : '')

  return (
    <li className={classes}>
      <div className="view">
        <input className="toggle"
               type="checkbox"
               checked={todo.completed}
               onChange={() => actions.toggle(todo.id)}/>
        <label onDoubleClick={() => {}}>
          {todo.title}
        </label>
        <button className="destroy"
                onClick={() => actions.del(todo.id)}/>
      </div>
      {todo.editing
        ? <input className="edit"
                 defaultValue={title}
                 onBlur={() => {}}
                 onKeyUp={() => {}}
                 onChange={() => {}}
                 autoFocus/>
        : null
      }
    </li>
  )
}

