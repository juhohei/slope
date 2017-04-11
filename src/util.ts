import {Unsubscribe} from '../index'

export function noop(): void {}

export function unsubscribeAll(subscribers: Array<Unsubscribe>): Unsubscribe {
  return () => subscribers.forEach((unsubscribe: Unsubscribe) => unsubscribe())
}

