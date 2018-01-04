var Bot = require('../')

module.exports = Bot({
  name: 'follow',
  version: '0.0.0',
  flumeVersion: 1,
  initBot: (sbot) => {
    return {
      handleMessage,
      handleAction
    }

    function handleMessage (state, message) {
      if (state == null) {
        state = {}
      }

      var { value } = message
      var { author, content } = value
      var { type, contact } = content

      var id
      if (state[author] == null) {
        id = author
      } else if (
        type === 'contact' &&
        state[contact] == null
      ) {
        id = contact
      }

      var action
      if (id != null) {
        state[id] = true
        action = {
          type: 'follow',
          id
        }
      }

      return { state, action }
    }

    function handleAction (action, sbot, cb) {
      var { type } = action
      if (type === 'follow') {
        var { id } = action
        cb(null, {
          type: 'contact',
          contact: id,
          following: true
        })
      }
      else cb()
    }
  }
})
