const test = require('tape')

const ssbBot = require('../')

test('ssb-bot', function (t) {
  t.ok(ssbBot, 'module is require-able')
  t.end()
})
