## Slope

Slope is a small, functional stream library.

### Usage

```sh
npm i slope
```

```js
const {S, Action} = require('slope')
```

```ts
import {S, Action} from 'slope'
```

### API

Check `index.d.ts` for common types used below.

#### Action

```ts
interface Action<T> {
  (value: T) => void
  stream: Stream<T>
}
```

```js
// example
const {S, Action} = require('slope')

const count   = Action()
const counter = S.scan((previous, next) => previous + next, 0)(counter.stream)

const unsubscribe = counter(
  value => console.log(`The current value is ${value}`,
  end   => console.log('The stream has ended')
)
//logs 'The current value is 0'

count(10)
// logs 'The current value is 10'
count(-5)
// logs 'The current value is 5'
unsubscribe()
// logs 'The stream has ended'
```

#### S

```ts
combine = Array<Stream<any>> => Stream<Array<any>>

filter<T> = UnaryF<T, boolean> => Stream<T> => Stream<T>

flatMap<A, B> = UnaryF<A, Stream<B>> => Stream<A> => Stream<B>

flatMapLatest<A, B> = UnaryF<A, Stream<B>> => Stream<A> => Stream<B>

fork<T> = Stream<T> => Stream<T>

from<T> = T => Stream<T>

fromArray<T> = Array<T> => Stream<T>

fromPromise<T> = Promise<T> => Stream<T>

map<A, B> => UnaryF<A, B> => Stream<A> => Stream<B>

merge = Array<Stream<any>> => Stream<any>

pipe = Array<() => Stream<any>> => Stream<any>

sample<A, B> = (Stream<A>, Stream<B>) => Stream<A>

scan<A, B> = (BinaryF<B, A, B>, B) => Stream<A> => Stream<B>

skipDuplicates<T> = BinaryF<T, T, boolean> => Stream<T> => Stream<T>

startWith<T> = T => Stream<T> => Stream<T>

tap<T> = UnaryF<T, void> => Stream<T> => Stream<T>
```
