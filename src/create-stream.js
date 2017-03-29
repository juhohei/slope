export function Stream () {
  let sinks = []

  const stream = sink => {
    sinks.push(sink)
    return () => {
      sinks.splice(sinks.indexOf(sink), 1)
    }
  }

  stream.push = value => {
    if (sinks.length) {
      sinks.forEach(sink => sink(value))
    }
  }

  return stream
}
