var pull = require('pull-stream')
var FlumeviewReduce = require('flumeview-reduce')
var pullThrough = require('pull-through')

module.exports = Bot

function Bot (options) {
  var {
    name = 'bot',
    version = '0.0.0',
    initBot = () => ({
      handleMessage: (state, message) => ({ state: null }),
      handleAction: (action, sbot, cb) => cb()
    }),
    flumeVersion = 1
  } = options

  return {
    name,
    version,
    manifest: {},
    init
  }
  
  function init (sbot) {
    var {
      handleMessage,
      handleAction
    } = initBot(sbot)

    var { id } = sbot.whoami()

    function reduce (index, data) {
      // console.log('reduce', index, data)
      var { message, state, action } = data
      var { key, value } = message
      var { author, content } = value
      // if message from bot self
      if (author === id) {
        var { branch: inReplyToId } = content
        // if message is reply to
        if (inReplyToId) {
          if (index.actions[inReplyToId] !== undefined) {
            delete index.actions[inReplyToId]
          }
        }
      }
      // if message from somebody else
      else {
        index.state = data.state
        if (action != null) index.actions[key] = action
      }
      return index
    }

    function map (message) {
      // console.log('map', message)
      if (typeof message.value.content === 'string') {
        message = sbot.private.unbox(message) || message
      }
      // if message from bot self, return as is
      if (message.value.key === id) return { message }
      // if message not from bot, 
      var value = index.value.value
      var state = (value == null) ? null : value.state
      console.log('handle message!', message)
      var { state: nextState, action } = handleMessage(state, message)
      console.log('action?', action)
      return {
        message,
        state: nextState,
        action
      }
    }

    var codec = null

    var initial = {
      state: null,
      actions: {}
    }

    var index = sbot._flumeUse(name, FlumeviewReduce(
      flumeVersion,
      reduce,
      map,
      codec,
      initial
    ))

    pull(
      index.stream({
        live: true
      }),
      pullThrough(function (data) {
        var { actions } = data
        if (actions) {
          Object.keys(actions).forEach(messageId => {
            var action = actions[messageId]
            this.queue({ messageId, action })
          })
        }
      }),
      pull.asyncMap(function ({ messageId, action }, cb) {
        console.log('handle action!', action)
        handleAction(action, sbot, (err, content) => {
          if (err) return cb(err)
          sbot.get(messageId, (err, inReplyTo) => {
            if (err) return cb(err)
            if (typeof inReplyTo.content === 'string') {
              inReplyTo.content = sbot.private.unbox(inReplyTo.content) || inReplyTo.content
            }
            console.log('in reply to', inReplyTo)
            content.root = inReplyTo.content.root || messageId
            content.branch = messageId

            if (inReplyTo.content.recps) {
              content.recps = inReplyTo.content.recps
            }

            cb(null, content)
          })
        })
      }),
      pull.asyncMap(function (content, cb) {
        console.log('publishing!', content)
        if (content.recps) sbot.private.publish(content, content.recps, cb)
        else sbot.publish(content, cb)
      }),
      pull.onEnd(err => {
        if (err) throw err
      })
    )
  }
}
