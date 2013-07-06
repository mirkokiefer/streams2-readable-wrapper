
var stream = require('stream')

var wrapOldReadableStream = function(oldStream) {

  var newStream = stream.Readable({objectMode: true})
  var paused = false

  oldStream
    .on('data', function(data) {
      var pushMore = newStream.push(data)
      if (!pushMore) {
        oldStream.pause()
        paused = true
      }
    })
    .on('end', function() {
      newStream.push(null)
    })

  newStream._read = function() {
    if (paused) {
      oldStream.continue()
      paused = false
    }
  }

  return newStream
}

module.exports = wrapOldReadableStream