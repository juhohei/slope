import {BinaryF, Stream, Subscriber, UnaryF, Unsubscribe} from '../types'

export const combine = (fn, streams) => sink => {
  const values: Array<any> = []
  let seen: Array<boolean> = []
  let seenAll: boolean     = false
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

export function doAction<T>(fn: UnaryF<T, void>): (stream: Stream<T>) => Stream<T> {
  return stream => sink => stream(value => {
    fn(value)
    sink(value)
  })
}

export function filter<T>(fn: UnaryF<T, boolean>): (stream: Stream<T>) => Stream<T> {
  return stream => sink => stream(value => {
    if (fn(value)) {
      sink(value)
    }
  })
}

export function flatMap<A, B>(fn: UnaryF<A, Stream<B>>): (stream: Stream<A>) => Stream<B> {
  return stream => sink => stream(value => fn(value)(sink))
}

export function fork<T>(stream: Stream<T>): Stream<T> {
  const sinks: Array<Subscriber<T>> = []
  let initial: T
  const unsubscribe: Unsubscribe = stream(value => {
    if (sinks.length) {
      sinks.forEach(sink => sink(value))
    } else {
      initial = value
    }
  })
  return sink => {
    if (initial) {
      sink(initial)
    }
    sinks.push(sink)
    return () => {
      sinks.splice(sinks.indexOf(sink), 1)
      if (!sinks.length) {
        unsubscribe()
      }
    }
  }
}

export function from<T>(value: T): Stream<T> {
  return sink => {
    sink(value)
    return () => {}
  }
}

export function fromArray<T>(arr: Array<T>): Stream<T> {
  return sink => {
    arr.forEach(sink)
    return () => {}
  }
}

export function fromPromise<T>(promise: Promise<T>): Stream<T> {
  return sink => {
    promise.then(sink)
    return () => {}
  }
}

export function fromEvent(element: HTMLElement, event: string): Stream<Event> {
  return sink => {
    element.addEventListener(event, sink)
    return () => element.removeEventListener(event, sink)
  }
}

export function map<A, B>(fn: UnaryF<A, B>): (stream: Stream<A>) => Stream<B> {
  return stream => sink => stream(value => sink(fn(value)))
}

export function mapStream<A, B>(valueStream: Stream<A>, triggerStream: Stream<B>): Stream<A> {
  let payload: A
  return sink => unsubscribeAll([
    valueStream(value => payload = value),
    triggerStream(() => sink(payload))
  ])
}

export function merge(streams: Array<Stream<any>>): Stream<any> {
  return sink => unsubscribeAll(streams.map(stream => stream(sink)))
}

export function pipe(fns: Array<(s: Stream<any>) => Stream<any>>): (stream: Stream<any>) => Stream<any> {
  return stream => sink => fns.reduce((s, fn) => fn(s), stream)(value => sink(value))
}

export function scan<A, B>(fn: BinaryF<B, A, B>, initial: B): (stream: Stream<A>) => Stream<B> {
  let payload: B = initial
  return stream => sink => {
    sink(payload)
    return stream(value => {
      payload = fn(payload, value)
      sink(payload)
    })
  }
}

export function skipDuplicates<T>(fn: BinaryF<T, T, boolean>): (stream: Stream<T>) => Stream<T> {
  let previous: T
  return stream => sink => stream(value => {
    if (!fn(previous, value)) {
      sink(value)
    }
    previous = value
  })
}

export function startWith<T>(initial: T): (stream: Stream<T>) => Stream<T> {
  return stream => sink => {
    sink(initial)
    return stream(sink)
  }
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

function unsubscribeAll(subscribers: Array<Unsubscribe>): Unsubscribe {
  return () => subscribers.forEach((unsubscribe: Unsubscribe) => unsubscribe())
}

