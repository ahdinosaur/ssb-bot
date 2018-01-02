const pull = require('pull-stream')

module.exports = {
  name: 'bot',
  version: '0.0.0',
  manifest: {},
  init
}

function init (sbot) {
  const { id } = sbot.whoami()
  console.log('id:', id)

  //sbot.emit('rpc:connect', sbot)

  pull(
    sbot.createLogStream(),
    pull.drain(message => {
      console.log('public', message)
    }, (err) => {
      if (err) throw err
    })
  )

  pull(
    sbot.private.read(),
    pull.drain(message => {
      console.log('private', message)
    }, (err) => {
      if (err) throw err
    })
  )
}
