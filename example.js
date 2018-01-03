var fs = require('fs')
var Path = require('path')
var pull = require('pull-stream')
var ssbConfig = require('ssb-config/inject')
var ssbKeys = require('ssb-keys')

console.log('STARTING SBOT')
var Bot = require('./')

var bot = Bot({
  name: 'hello',
  version: '0.0.0',
  flumeVersion: 2,
  initBot: (sbot) => {
    var { id } = sbot.whoami()
    var hasMentionForBot = hasMentionFor(id)

    return {
      handleMessage,
      handleAction
    }

    function handleMessage (state, message) {
      if (hasMentionForBot(message)) {
        return {
          state,
          action: {
            type: 'hello',
            id: message.value.author
          }
        }
      }

      return { state }
    }

    function handleAction (action, sbot, cb) {
      var { type } = action
      if (type === 'hello') {
        var { id } = action
        sbot.about.get((err, abouts) => {
          if (err) return cb(err)
          var name = abouts[id].name[id][0]
          cb(null, {
            type: 'post',
            text: `hello [@${name}](${id})!`,
            mentions: [
              {
                name,
                link: id
              }
            ]
          })
        })
      }
      else cb()
    }
  }
})

function hasMentionFor (id) {
  return (message) => {
    var { value } = message
    var { content } = value
    var { mentions = [] } = content
    return mentions.map(mention => mention.link).includes(id)
  }
}

// ---
// boilerplate

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
  .use(bot)

var appName = 'ssb-bot'

var config = ssbConfig(appName, {
  path: Path.join(__dirname, 'ssb'),
  port: 9999,
  seeds: [
    'net:localhost:8008~shs:6ilZq3kN0F+dXFHAPjAwMm87JEb/VdB+LC9eIMW3sa0=',
  //  'net:ssb.mikey.nz:8008~shs:d64Q93XzBhbr2JCLWkZgvzKwTHMvwFgRdtw4fHFlF5k='
  ]
})

var keys = ssbKeys.loadOrCreateSync(
  Path.join(config.path, 'secret')
)

config.keys = keys

var sbot = createServer(config)
var { id } = sbot.whoami()

console.log('bot id:', id)

sbot.replicate.request(
  '@6ilZq3kN0F+dXFHAPjAwMm87JEb/VdB+LC9eIMW3sa0=.ed25519',
  (err) => {
    if (err) throw err
    console.log('done replicate.request')
  }
)

pull(
  sbot.createUserStream({
    id,
    live: true
  }),
  pull.log()
)
