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

      var { value: { author } } = message

      if (state[author] == null) {
        return {
          state: Object.assign(state, {
            [author]: true
          }),
          action: {
            type: 'follow',
            id: author
          }
        }
      }

      return { state }
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
