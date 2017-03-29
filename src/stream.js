export const map = (fn, stream) => sink =>
  stream(value => sink(fn(value)))

export const filter = (fn, stream) => sink =>
  stream(value => {
    if (fn(value)) {
      sink(value)
    }
  })

export const scan = (fn, initial, stream) => sink => {
  let payload = initial
  sink(payload)
  return stream(value => {
    payload = fn(payload, value)
    sink(value)
  })
}

export const startWith = (initial, stream) => sink => {
  sink(initial)
  return stream(sink)
}

export const flatMap = (fn, stream) => sink =>
  stream(value => fn(value)(sink))

