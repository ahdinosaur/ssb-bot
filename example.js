var fs = require('fs')
var Path = require('path')
var ssbConfig = require('ssb-config/inject')
var ssbKeys = require('ssb-keys')

console.log('STARTING SBOT')

var createServer = require('scuttlebot')
  .use(require('scuttlebot/plugins/gossip'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(require('ssb-friends'))
  .use(require('ssb-blobs'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-private'))
  .use(require('scuttlebot/plugins/invite'))
  .use(require('scuttlebot/plugins/local'))
  .use(require('scuttlebot/plugins/logging'))
  .use(require('ssb-about'))
  .use(require('./'))

var appName = 'ssb-bot'

var config = ssbConfig(appName, {
  path: Path.join(__dirname, 'ssb'),
  port: 9999,
  seeds: [
  //  'net:localhost:8008~shs:6ilZq3kN0F+dXFHAPjAwMm87JEb/VdB+LC9eIMW3sa0=',
  //  'net:ssb.mikey.nz:8008~shs:d64Q93XzBhbr2JCLWkZgvzKwTHMvwFgRdtw4fHFlF5k='
  ]
})

var keys = ssbKeys.loadOrCreateSync(
  Path.join(config.path, 'secret')
)

config.keys = keys

var server = createServer(config)
