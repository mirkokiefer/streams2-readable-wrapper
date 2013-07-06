
var wrap = require('./index')
var assert = require('assert')
var EventEmitter = require('events').EventEmitter

var source = [1, 2, 3, 4, 5]

var createOldStream = function() {
  var stream = new EventEmitter()
  var index = 0
  var interval = null
  var ended = false

  var emit = function() {
    if (index < source.length) {
      stream.emit('data', source[index])
      index++
    } else {
      stream.emit('end')
      ended = true
      stream.pause()
    }
  }

  stream.pause = function() {
    clearInterval(interval)
  }

  stream.continue = function() {
    if (!ended) {
      interval = setInterval(emit, 10)      
    }
  }
  stream.continue()

  return stream
}

describe('streams2-readable-wrapper', function() {
  it('should test if our mock stream works', function(done) {
    var index = 0
    var test = createOldStream()
      .on('data', function(data) {
        assert.equal(data, source[index])
        index++
      })
      .on('end', function() {
        assert.equal(index, source.length)
        done()
      })
  })
  it('should wrap a 0.8 stream in a streams2 stream handling backpressure', function(done) {
    var oldStream = createOldStream()
    var newStream = wrap(oldStream)

    var delayedTest = function() {
      var index = 0
      newStream
        .on('readable', function() {
          var data = newStream.read()
          assert.equal(data, source[index])
          index++
        })
        .on('end', function() {
          assert.equal(index, source.length)
          done()
        })
    }
    setTimeout(delayedTest, 100)
  })
})
