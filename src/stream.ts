import {noop, unsubscribeAll} from './util'

import {BinaryF, Stream, Subscriber, UnaryF, Unsubscribe} from '../types'

export function combine(aStream: Stream<any>, bStream: Stream<any>): Stream<Array<any>> {
  return (sink, end) => {
    let latestA: any
    let latestB: any
    const push = () => {
      if (latestA && latestB) {
        sink([].concat(latestA, latestB))
      }
    }
    const unsubscribeA = aStream(
      value => {
        latestA = value
        push()
      }
    )
    const unsubscribeB = bStream(
      value => {
        latestB = value
        push()
      },
      end
    )

    return unsubscribeAll([unsubscribeA, unsubscribeB])
  }
}

export function combineAll(streams: Array<Stream<any>>): Stream<Array<any>> {
  return streams.reduce(combine, from([]))
}

export function doAction<T>(fn: UnaryF<T, void>): (stream: Stream<T>) => Stream<T> {
  return stream => (sink, end) => stream(
    value => {
      fn(value)
      sink(value)
    },
    end
  )
}

export function filter<T>(fn: UnaryF<T, boolean>): (stream: Stream<T>) => Stream<T> {
  return stream => (sink, end) => stream(
    value => {
      if (fn(value)) {
        sink(value)
      }
    },
    end
  )
}

export function flatMap<A, B>(fn: UnaryF<A, Stream<B>>): (stream: Stream<A>) => Stream<B> {
  return stream => (sink, end) => {
    const unsubscribeFns: Array<Unsubscribe> = []
    const unsubscribe = stream(
      value => {
        unsubscribeFns.push(fn(value)(sink))
      },
      end
    )
    return () => {
      unsubscribeAll(unsubscribeFns)()
      unsubscribe()
    }
  }
}

export function flatMapLatest<A, B>(fn: UnaryF<A, Stream<B>>): (stream: Stream<A>) => Stream<B> {
  return stream => (sink, end) => {
    let unsubscribePrevious: Unsubscribe = noop
    const unsubscribe = stream(
      value => {
        unsubscribePrevious()
        unsubscribePrevious = fn(value)(sink)
      },
      end
    )
    return () => {
      unsubscribePrevious()
      unsubscribe()
    }
  }
}

export function fork<T>(stream: Stream<T>): Stream<T> {
  const sinks: Array<Subscriber<T>> = []
  const ends: Array<Unsubscribe> = []
  const passed: Array<T> = []
  const unsubscribe: Unsubscribe = stream(
    value => {
      if (sinks.length) {
        sinks.forEach(sink => sink(value))
      } else {
        passed.push(value)
      }
    },
    () => ends.forEach(end => end())
  )

  return (sink, end = noop) => {
    if (passed.length) {
      fromArray(passed)(sink, end)
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
  return (sink, end = noop) => {
    sink(value)
    end()
    return noop
  }
}

export function fromArray<T>(arr: Array<T>): Stream<T> {
  return (sink, end = noop) => {
    arr.forEach(value => sink(value))
    end()
    return noop
  }
}

export function fromEvent(element: HTMLElement, event: string): Stream<Event> {
  return sink => {
    element.addEventListener(event, sink)
    return () => element.removeEventListener(event, sink)
  }
}

export function fromPromise<T>(promise: Promise<T>): Stream<T> {
  return (sink, end = noop) => {
    promise.then(value => {
      sink(value)
      end()
    })
    return noop
  }
}

export function map<A, B>(fn: UnaryF<A, B>): (stream: Stream<A>) => Stream<B> {
  return stream => (sink, end) => stream(
    value => sink(fn(value)),
    end
  )
}

export function merge(streams: Array<Stream<any>>): Stream<any> {
  return flatMap<Stream<any>, Stream<any>>(stream => stream)(fromArray(streams))
}

export function pipe(fns: Array<(s: Stream<any>) => Stream<any>>): (stream: Stream<any>) => Stream<any> {
  return stream => (sink, end) => fns.reduce((s, fn) => fn(s), stream)(value => sink(value), end)
}

export function sample<A, B>(stream: Stream<A>, sampler: Stream<B>): Stream<A> {
  let payload: A
  return (sink, end) => unsubscribeAll([
    stream(value => payload = value, end),
    sampler(() => sink(payload), end)
  ])
}

export function scan<A, B>(fn: BinaryF<B, A, B>, initial: B): (stream: Stream<A>) => Stream<B> {
  let payload: B = initial
  return stream => (sink, end) => {
    sink(payload)
    return stream(
      value => {
        payload = fn(payload, value)
        sink(payload)
      },
      end
    )
  }
}

export function skipDuplicates<T>(fn: BinaryF<T, T, boolean>): (stream: Stream<T>) => Stream<T> {
  let previous: T
  return stream => (sink, end) => stream(
    value => {
      if (!fn(previous, value)) {
        sink(value)
      }
      previous = value
    },
    end
  )
}

export function startWith<T>(initial: T): (stream: Stream<T>) => Stream<T> {
  return stream => (sink, end) => {
    sink(initial)
    return stream(sink, end)
  }
}

