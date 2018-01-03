const pull = require('pull-stream')
const FlumeviewReduce = require('flumeview-reduce')
const pullThrough = require('pull-through')

module.exports = {
  name: 'bot',
  version: '0.0.0',
  manifest: {},
  init
}

const version = 1

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
    // console.log('update', message)

    if (state == null) {
      state = {}
    }

    var action = null

    if (hasMentionForBot(message)) {
      action = {
        type: 'hello',
        id: message.value.author
      }
    }

    return { state, action }
  }

  function run (action, sbot, cb) {
    const { type } = action
    if (type === 'hello') {
      const { id } = action
      sbot.about.get((err, abouts) => {
        if (err) return cb(err)
        const name = abouts[id].name[id][0]
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

  function reduce (index, data) {
    // console.log('reduce', index, data)
    const { message, state, action } = data
    const { key, value } = message
    const { author, content } = value
    // if message from bot self
    if (author === id) {
      const { branch: inReplyToId } = content
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
    const value = index.value.value
    const state = (value == null) ? null : value.state
    const { state: nextState, action } = update(state, message)
    return {
      message,
      state: nextState,
      action
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
    pullThrough(function (data) {
      const { actions } = data
      if (actions) {
        Object.keys(actions).forEach(messageId => {
          const action = actions[messageId]
          this.queue({ messageId, action })
        })
      }
    }),
    pull.asyncMap(function ({ messageId, action }, cb) {
      run(action, sbot, (err, content) => {
        if (err) return cb(err)
        sbot.get(messageId, (err, inReplyTo) => {
          if (err) return cb(err)
          content.root = inReplyTo.content.root || messageId
          content.branch = messageId

          cb(null, content)
        })
      })
    }),
    pull.asyncMap(function (content, cb) {
      console.log('publishing!', content)
      return cb()
      sbot.publish(content, cb)
    }),
    pull.onEnd(err => {
      if (err) throw err
    })
  )

  pull(
    sbot.createUserStream({ id }),
    pull.log()
  )
  
  sbot.replicate.request(
    '@6ilZq3kN0F+dXFHAPjAwMm87JEb/VdB+LC9eIMW3sa0=.ed25519',
    (err) => {
      if (err) throw err
      console.log('done replicate.request')
    }
  )
}
