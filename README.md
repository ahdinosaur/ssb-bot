# ssb-bot :computer: :speech_balloon:

```shell
npm install --save ssb-bot
```
## what?

original post: [%2JaltAdhcWnJwOXJPbHvGE9+SlVrR7Vfq+RhJbMhVUM=.sha256](https://viewer.scuttlebot.io/%252JaltAdhcWnJwOXJPbHvGE9%2BSlVrR7Vfq%2BRhJbMhVUM%3D.sha256)

`ssb-bot` is [scuttlebot](https://github.com/ssbc/scuttlebot) plugin to help make it easy to develop conversational user interfaces, similar to a Slack bot or a Facebook Messenger bot.

## example

```js
var bot = Bot({
  name: 'greeter',
  version: '0.0.0',
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
```

see [`example.js`](./example.js) and [`examples/hello.js`](./examples/hello.js) for the full example source.

with your main Scuttlebutt client (such as Patchwork) running, run `node example hello`, which should create a new bot who will request to replicate with your current feed.

if you @mention this new bot, it should respond with hello ${name}!

(you may need to restart the bot once or twice after sending a message)

## why?

[@mix](@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519) brought up the idea of developing systems _butt-first_: %3MS64b+lB4Dk5gag8tJKnA+zy8BEQ2cLmyxF06sBKyM=.sha256. with this approach, we use ssb as a database, where a "api call" is publishing a message to your feed and a "database transaction" is the bot publishing a message to their feed.

i want to make it easier for people to create pub invites, as currently the only way is for a pub owner to `ssh` into their server and run `sbot invite.create 1`. ([`easy-ssb-pub`](https://github.com/staltz/easy-ssb-pub) gets around this by allowing anyone to create an invite from a public webpage, but i want something to help the network grow with personal invites.)

so i'm interested in a conversational approach to creating invites. i want to be able to private message a pub and say "hey can i have an invite?" and the pub responds with "sure, here you go: .... !"

## how?

inspired by [Elm](https://guide.elm-lang.org/) or [`inu`](https://github.com/ahdinosaur/inu):

a bot is two functions:

`handleMessage` receives the current state and the next message, returns the next state and any new actions.

```js
var handleMessage = (state, message) => {
  return {
    state: nextState,
    action
  }
}
```

`handleAction` receives the new action and asyncronously returns (via the `callback`) a new message to publish.


```js
var handleAction = (action, sbot, callback) => {
  var newMessage = {
    type: 'post',
    text: 'did i hear something?'
  }
  callback(null, newMessage) // this publishes the newMessage
}
```

## license

The Apache License

Copyright &copy; 2017 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
