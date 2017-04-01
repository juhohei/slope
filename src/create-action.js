export function Action () {
  let sink = null

  const action = value => {
    if (sink) {
      sink(value)
    }
  }

  action.stream = subscriber => {
    if (sink) {
      throw new Error('This stream has already been subscribed to. Use `fork` to allow more subscribers.')
    }
    sink = subscriber
    return () => {
      sink = null
    }
  }

  return action
}

