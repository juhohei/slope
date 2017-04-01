export const combine = (fn, streams) => sink => {
  let values   = []
  let seen     = []
  let seenAll  = false
  return unsubscribeAll(streams.map((stream, i) => stream(value => {
    values[i] = value
    if (seenAll) {
      sink(fn(...values))
    } else {
      seen[i] = true
      if (seen.filter(x => x).length === streams.length) {
        sink(fn(...values))
        seenAll = true
        seen    = null
      }
    }
  })))
}

export const doAction = (fn, stream) => sink =>
  stream(value => {
    fn(value)
    sink(value)
  })

export const filter = (fn, stream) => sink =>
  stream(value => {
    if (fn(value)) {
      sink(value)
    }
  })

export const flatMap = (fn, stream) => sink =>
  stream(value => fn(value)(sink))

export const fromPromise = promise => sink =>
  promise.then(sink)

export const fromEvent = (element, event) => sink => {
  element.addEventListener(event, sink)
  return () => element.removeEventListener(sink)
}

export const map = (fn, stream) => sink =>
  stream(value => sink(fn(value)))

export const mapStream = (valueStream, triggerStream) => sink => {
  let payload
  return unsubscribeAll([
    valueStream(value => payload = value),
    triggerStream(() => sink(payload))
  ])
}

export const scan = (fn, initial, stream) => sink => {
  let payload = initial
  sink(payload)
  return stream(value => {
    payload = fn(payload, value)
    sink(payload)
  })
}

export const skipDuplicates = (fn, stream) => sink => {
  let previous = null
  return stream(value => {
    if (!fn(previous, value)) {
      sink(value)
    }
    previous = value
  })
}

export const startWith = (initial, stream) => sink => {
  sink(initial)
  return stream(sink)
}

export const update = (initial, ...pairs) => sink => {
  let payload = initial
  sink(payload)
  return unsubscribeAll(pairs.map(pair => {
    const [stream, fn] = pair
    return stream(value => {
      payload = fn(payload, value)
      sink(payload)
    })
  }))
}

function unsubscribeAll (subscribers) {
  return () => subscribers.forEach(unsubscribe => unsubscribe())
}

