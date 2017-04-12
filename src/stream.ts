import {noop, unsubscribeAll} from './util'

import {BinaryF, Stream, Subscriber, UnaryF, Unsubscribe} from '../index'

function _combine(aStream: Stream<any>, bStream: Stream<any>): Stream<Array<any>> {
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

export function combine(streams: Array<Stream<any>>): Stream<Array<any>> {
  return streams.reduce(_combine, from([]))
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
  return stream => (sink, end = noop) => {
    const unsubscribeFns: Array<Unsubscribe> = []
    let isLastStream: boolean  = false
    let receivedValues: number = 0
    let passedValues: number   = 0
    const unsubscribe = stream(
      value => {
        receivedValues++
        unsubscribeFns.push(fn(value)(sink, () => {
          passedValues++
          if (isLastStream && receivedValues === passedValues) {
            end()
          }
        }))
      },
      () => {
        isLastStream = true
      }
    )
    return unsubscribeAll(unsubscribeFns.concat(unsubscribe))
  }
}

export function flatMapLatest<A, B>(fn: UnaryF<A, Stream<B>>): (stream: Stream<A>) => Stream<B> {
  return stream => (sink, end = noop) => {
    let unsubscribePrevious: Unsubscribe = noop
    let isLastStream: boolean  = false
    let receivedValues: number = 0
    let passedValues: number   = 0
    const unsubscribe = stream(
      value => {
        receivedValues++
        unsubscribePrevious()
        unsubscribePrevious = fn(value)(sink, () => {
          passedValues++
          if (isLastStream && receivedValues === passedValues) {
            end()
          }
        })
      },
      () => {
        isLastStream = true
      }
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
      fromArray<T>(passed)(sink, end)
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
    let cancelled: boolean = false
    promise.then(value => {
      if (!cancelled) {
        sink(value)
      }
      end()
    })

    return () => {
      cancelled = true
    }
  }
}

export function map<A, B>(fn: UnaryF<A, B>): (stream: Stream<A>) => Stream<B> {
  return stream => (sink, end) => stream(
    value => sink(fn(value)),
    end
  )
}

export function merge(streams: Array<Stream<any>>): Stream<any> {
  return flatMap<Stream<any>, Stream<any>>(stream => stream)(fromArray<any>(streams))
}

export function pipe(fns: Array<(s: Stream<any>) => Stream<any>>): (stream: Stream<any>) => Stream<any> {
  return stream => fns.reduce((s, fn) => fn(s), stream)
}

export function sample<A, B>(stream: Stream<A>, sampler: Stream<B>): Stream<A> {
  return (sink, end) => {
    let payload: A
    return unsubscribeAll([
      stream(value => payload = value),
      sampler(() => sink(payload), end)
    ])
  }
}

export function scan<A, B>(fn: BinaryF<B, A, B>, initial: B): (stream: Stream<A>) => Stream<B> {
  return stream => (sink, end) => {
    let payload: B = initial
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
  return stream => (sink, end) => {
    let previous: T
    return stream(
      value => {
        if (!fn(previous, value)) {
          sink(value)
        }
        previous = value
      },
      end
    )
  }
}

export function startWith<T>(initial: T): (stream: Stream<T>) => Stream<T> {
  return stream => (sink, end) => {
    sink(initial)
    return stream(sink, end)
  }
}

export function tap<T>(fn: UnaryF<T, void>): (stream: Stream<T>) => Stream<T> {
  return map<T, T>(value => {
    fn(value)
    return value
  })
}

