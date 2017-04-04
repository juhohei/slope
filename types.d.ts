export interface Action<T> {
  (value: T): void
  stream: Stream<T>
}

export type BinaryF<A, B, C> = (a: A, b: B) => C

export type Stream<T> = (subscriber: Subscriber<T>) => Unsubscribe

export type Subscriber<T> = (value: T) => void

export type UnaryF<A, B> = (a: A) => B

export type Unsubscribe = () => void

