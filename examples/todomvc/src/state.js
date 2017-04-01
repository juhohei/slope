import {S} from '../../..'

import * as actions from './actions'

let id = 0

const isEnter = e => e.key === 'Enter'
const assign  = (obj, prop) => Object.assign({}, obj, prop)

const clearS     = actions.clear.stream
const toggleAllS = actions.toggleAll.stream
const toggleS    = actions.toggle.stream
const delS       = actions.del.stream

const addTodoS = S.map(title => ({id: ++id, title, completed: false}),
  S.mapStream(
    S.filter(value => value.length > 0,
      S.map(e => e.target.value, actions.add.stream)
    ),
    S.filter(isEnter, actions.submit.stream)
  )
)

const routeS = S.fork(S.map(getPropsForRoute,
  S.startWith(location.hash,
    S.doAction(route => history.pushState(null, '', route), actions.navigate.stream)
  )
))


export const currentFilterS = S.map(route => route.filter, routeS)
export const currentRouteS  = S.map(route => route.route, routeS)


const allTodosS = S.fork(S.update([{id: -1, title: 'test', completed: true}],
  [addTodoS,   (todos, todo) => todos.concat(todo)],
  [toggleS,    (todos, id)   => todos.map(todo => todo.id === id ? assign(todo, {completed: !todo.completed}): todo)],
  [delS,       (todos, id)   => todos.filter(todo => todo.id !== id)],
  [toggleAllS, (todos)       => todos.map(todo => assign(todo, {completed: !todo.completed}))],
  [clearS,     (todos)       => todos.filter(todo => !todo.completed)]
))

export const todosS = S.combine((todos, filter) => todos.filter(filter), [
  allTodosS,
  currentFilterS
])

export const countS = S.fork(S.map(todos => {
  const remaining = todos.reduce((count, todo) => count + (todo.completed ? 0 : 1), 0)
  return {
    remaining,
    completed: todos.length - remaining
  }
}, allTodosS))


function getPropsForRoute (route) {
  switch (route) {
    case '#/':          return {route, filter: ()   =>  true}
    case '#/active':    return {route, filter: todo => !todo.completed}
    case '#/completed': return {route, filter: todo =>  todo.completed}
    default:            return {route, filter: ()   =>  true}
  }
}
