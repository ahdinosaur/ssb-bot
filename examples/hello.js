var Bot = require('../')

module.exports = Bot({
  name: 'hello',
  version: '0.0.0',
  flumeVersion: 1,
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
