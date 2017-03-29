export function Action () {
  let sinks = []

  const action = value => {
    if (sinks.length) {
      sinks.forEach(sink => sink(value))
    }
  }

  action.stream = sink => {
    sinks.push(sink)
    return () => {
      sinks.splice(sinks.indexOf(sink), 1)
    }
  }

  return action
}
