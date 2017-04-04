import {Action, Stream, Subscriber, Unsubscribe} from '../types'

export function Action<T>(): Action<T> {
  let sink: Subscriber<T> = null

  const action = ((value: T): void => {
    if (sink) {
      sink(value)
    }
  }) as Action<T>

  action.stream = (subscriber: Subscriber<T>): Unsubscribe => {
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

