import {Bus, Noop, Stream, Subscriber, Unsubscribe} from './'
import {noop, throwAlreadySubscribedError}          from './util'

export function Action<T>(): Bus<T> {
  let sink: Subscriber<T> = null

  const action = ((value: T): void => {
    if (sink) {
      sink(value)
    }
  }) as Bus<T>

  action.stream = (subscriber: Subscriber<T>, end: Noop = noop): Unsubscribe => {
    if (sink) {
      throwAlreadySubscribedError(`Action()(${subscriber.toString()}, ${end.toString})`)
    }
    sink = subscriber
    return () => {
      sink = null
      end()
    }
  }

  return action
}

