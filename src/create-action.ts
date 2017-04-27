import {Bus, Stream, Subscriber, Unsubscribe} from './'

export function Action<T>(): Bus<T> {
  let sink: Subscriber<T> = null

  const action = ((value: T): void => {
    if (sink) {
      sink(value)
    }
  }) as Bus<T>

  action.stream = (subscriber: Subscriber<T>, end: Unsubscribe): Unsubscribe => {
    if (sink) {
      throw new Error('This stream has already been subscribed to. Use `fork` to allow more subscribers.')
    }
    sink = subscriber
    return () => {
      sink = null
      end && end()
    }
  }

  return action
}

