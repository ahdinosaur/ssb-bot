const pull = require('pull-stream')
const FlumeviewReduce = require('flumeview-reduce')
const series = require('run-series')

module.exports = {
  name: 'bot',
  version: '0.0.0',
  manifest: {},
  init
}

const version = 13

const botKey = 'GWMbWihPXDMJpSgaduGr'

function hasMentionFor (id) {
  return (message) => {
    const { value } = message
    const { content } = value
    const { mentions = [] } = content
    return mentions.map(mention => mention.link).includes(id)
  }
}

function init (sbot) {
  const { id } = sbot.whoami()
  console.log('id:', id)
  
  const hasMentionForBot = hasMentionFor(id)
  
  function update (state, message) {
    console.log('update', message)

    if (state == null) {
      state = {}
    }

    var actions = []

    if (hasMentionForBot(message)) {
      console.log('HELLLLLLLOOOOOO')
      console.log('HELLLLLLLOOOOOO')
      console.log('HELLLLLLLOOOOOO')
      console.log('HELLLLLLLOOOOOO')
      actions = [
        {
          type: 'hello'
        }
      ]
    }

    return { state, actions }
  }

  function run (action, sbot, cb) {
    console.log('run', action)
    if (action.type === 'hello') {
      console.log('hello!')
    }
    cb()
  }

  function reduce (index, data) {
    console.log('reduce', index, data)
    const { message, state, actions } = data
    const { key, value } = message
    const { author } = value
    const bot = value[botKey]
    // if message from bot self
    if (author === id) {
      // if message is from action
      if (bot) {
        const [ botMessageId, botActionIndex ] = bot
        if (index.actions[botMessageId][botActionIndex] !== null) {
          index.actions[botMessageId][botActionIndex] = null
        }
      }
    }
    // if message from somebody else
    else {
      index.state = data.state
      if (Array.isArray(data.actions) && data.actions.length > 0) {
        console.log('i got actions', actions)
        index.actions[data.message.key] = data.actions
      }
    }
    return index
  }

  function map (message) {
    console.log('map', message)
    if (typeof message.value.content === 'string') {
      message = sbot.private.unbox(message) || message
    }
    // if message from bot self, return as is
    if (message.value.key === id) return { message }
    // if message not from bot, 
    const value = index.value.value
    const state = (value == null) ? null : value.state
    const { state: nextState, actions } = update(state, message)
    return {
      message,
      state: nextState,
      actions
    }
  }
  
  const codec = null

  const initial = {
    state: null,
    actions: {}
  }

  var index = sbot._flumeUse('bot', FlumeviewReduce(
    version,
    reduce,
    map,
    codec,
    initial
  ))

  pull(
    index.stream({
      live: true
    }),
    pull.asyncMap(function (data, cb) {
      const { actions } = data
      if (actions) {
        series(
          Object.keys(actions).map(messageId => {
            const messageActions = actions[messageId]
            if (Array.isArray(messageActions) && messageActions.length > 0) {
              return cb => series(
                messageActions.map(action => cb => run(action, sbot, cb)),
                cb
              )
            }
            else return cb => cb()
          }),
          cb
        )
      }
    }),
    pull.onEnd(err => {
      if (err) throw err
    })
  )
  
  /*
  sbot.replicate.request(
    '@6ilZq3kN0F+dXFHAPjAwMm87JEb/VdB+LC9eIMW3sa0=.ed25519',
    (err) => {
      if (err) throw err
      console.log('done replicate.request')

      pull(
        sbot.private.read(),
        pull.drain(message => {
          console.log('private', message)
        }, (err) => {
          if (err) throw err
          console.log('done private.read')
        })
      )
    }
  )
  */
}
