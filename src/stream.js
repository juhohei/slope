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

