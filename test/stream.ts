import {expect} from 'chai'
import {S}      from '../src'


const delayedPromise = (x: number) => new Promise(resolve => {
  setTimeout(() => resolve(x), x * 100)
})
const delayedStream  = (x: number) => S.fromPromise<number>(delayedPromise(x))


describe('S', () => {

  describe('combine', () => {

    it('combines an array of streams to an stream of arrays', () => {
      const stream1  = S.fromArray([1, 2, 3])
      const stream2  = S.fromArray([4, 5, 6])
      const stream3  = S.fromArray([7, 8, 9])
      const expected = [[3, 6, 7], [3, 6, 8], [3, 6, 9]]
      S.combine([stream1, stream2, stream3])(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

    it('keeps values intact', () => {
      const stream1  = S.fromArray([1, 2, 3])
      const stream2  = S.fromArray([[4], [5], [6]])
      const expected = [[3, [4]], [3, [5]], [3, [6]]]
      S.combine([stream1, stream2])(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

  })

  describe('filter', () => {

    it('filters values that don\'t pass the test implemented by the provided function', () => {
      const stream   = S.fromArray([1, 2, 3])
      const expected = [1, 3]
      S.filter<number>(x => x % 2 === 1)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

  })

  describe('flatMap', () => {

    it('flattens a stream of streams of values to a stream of values (sync)', () => {
      const stream   = S.fromArray([3, 2, 1])
      const expected = [3, 2, 1]
      S.flatMap<number, number>(S.from)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

    it('flattens a stream of streams of values to a stream of values (async)', done => {
      const stream   = S.fromArray([3, 2, 1])
      const expected = [1, 2, 3]
      S.flatMap<number, number>(delayedStream)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        done
      )
    })

  })


  describe('flatMapLatest', () => {

    it('flattens a stream of streams of values to a stream of values of the latest stream (sync)', () => {
      const stream   = S.fromArray([3, 2, 1])
      const expected = [3, 2, 1]
      S.flatMapLatest<number, number>(S.from)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })


    it('flattens a stream of streams of values to a stream of values of the latest stream (async)', done => {
      const stream   = S.fromArray([1, 2, 1])
      const expected = [1, 1]
      S.flatMapLatest<number, number>(delayedStream)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        done
      )
    })

  })

  describe('fork', () => {

    it('allows multiple subscribers to a stream', () => {
      const stream    = S.fork(S.fromArray([1, 2, 3]))
      const expected1 = [1, 2, 3]
      const expected2 = [1, 2, 3]
      stream(
        value => {
          expect(value).to.eql(expected1.shift())
        },
        () => {
          expect(undefined).to.eql(expected1.shift())
        }
      )
      stream(
          value => {
            expect(value).to.eql(expected2.shift())
          },
          () => {
            expect(undefined).to.eql(expected2.shift())
          }
        )
    })

  })

  describe('from', () => {

    it('creates a stream of a single value', () => {
      const stream   = S.from(1)
      const expected = [1]
      stream(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

    it('allows a single subsriber to a stream if `fork` is not called', () => {
      const stream   = S.from(1)
      const expected = [1]
      stream(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
      expect(() => stream(x => x)).to.throw()
    })

  })

  describe('fromArray', () => {

    it('creates a stream from the values of the given array', () => {
      const stream   = S.fromArray([1, 2, 3])
      const expected = [1, 2, 3]
      stream(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

    it('allows a single subsriber to a stream if `fork` is not called', () => {
      const stream   = S.fromArray([1, 2, 3])
      const expected = [1, 2, 3]
      stream(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
      expect(() => stream(x => x)).to.throw()
    })

  })

  describe('fromPromise', () => {

    it('creates a stream from the value of the given promise', done => {
      const stream   = S.fromPromise(Promise.resolve(1))
      const expected = [1]
      stream(
        value => {
          expect(value).to.eql(expected.shift())
        },
        done
      )
    })

    it('allows a single subsriber to a stream if `fork` is not called', () => {
      const stream   = S.fromPromise(Promise.resolve(1))
      const expected = [1]
      stream(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
      expect(() => stream(x => x)).to.throw()
    })

  })

  describe('map', () => {

    it('applies a function to every value of the stream', () => {
      const stream   = S.map<number, number>(x => x * 2)(S.fromArray([1, 2, 3]))
      const expected = [2, 4, 6]
      stream(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

  })

  describe('merge', () => {

    it('merges an array of streams to a single stream', done => {
      const stream1  = S.flatMap<number, number>(delayedStream)(S.fromArray([1, 4, 7]))
      const stream2  = S.flatMap<number, number>(delayedStream)(S.fromArray([2, 5, 8]))
      const stream3  = S.flatMap<number, number>(delayedStream)(S.fromArray([3, 6, 9]))
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      S.merge([stream1, stream2, stream3])(
        value => {
          expect(value).to.eql(expected.shift())
        },
        done
      )
    })

  })
  describe('pipe', () => {

    it('applies an array of stream functions to the stream', () => {
      const stream   = S.fromArray([1, 2, 3, 4, 5])
      const expected = [6, 12]
      S.pipe([
        S.map<number, number>(x => x * 3),
        S.filter<number>(x => x % 2 === 0)
      ])(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

  })

  describe('sample', () => {

    it('streams the latest value of the value stream when the trigger stream receives a value', done => {
      const stream   = S.fromArray([1, 2, 3, 4, 5])
      const sampler  = delayedStream(1)
      const expected = [5]
      S.sample(stream, sampler)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        done
      )
    })

  })

  describe('scan', () => {

    it('applies the given funciton to the previous and current values of the stream', () => {
      const stream   = S.fromArray([1, 2, 3, 4, 5])
      const expected = [0, 1, 3, 6, 10, 15]
      S.scan<number, number>((a, b) => a + b, 0)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

  })

  describe('skipDuplicates', () => {

    it('filters values that are equal to the previous values according to the provided funciton from the stream', () => {
      const stream   = S.fromArray([1, 1, 2, 1, 3])
      const expected = [1, 2, 1, 3]
      S.skipDuplicates<number>((a, b) => a === b)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

  })

  describe('startWith', () => {

    it('starts the stream with the given value', () => {
      const stream   = S.fromArray([1, 2, 3])
      const expected = [0, 1, 2, 3]
      S.startWith<number>(0)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(undefined).to.eql(expected.shift())
        }
      )
    })

  })

  describe('tap', () => {

    it('adds a side effect to the stream', () => {
      const stream   = S.fromArray([1, 2, 3])
      const expected = [1, 2, 3]
      let someNumber = 0
      S.tap<number>(x => someNumber += x)(stream)(
        value => {
          expect(value).to.eql(expected.shift())
        },
        () => {
          expect(someNumber).to.eql(6)
        }
      )
    })

  })

})

