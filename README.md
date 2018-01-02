# ssb-bot :computer: :speech_balloon:

_work in progress_

[%2JaltAdhcWnJwOXJPbHvGE9+SlVrR7Vfq+RhJbMhVUM=.sha256](https://viewer.scuttlebot.io/%252JaltAdhcWnJwOXJPbHvGE9%2BSlVrR7Vfq%2BRhJbMhVUM%3D.sha256)

## what?

`ssb-bot` is [scuttlebot](https://github.com/ssbc/scuttlebot) plugin to help make it easy to develop conversational user interfaces, similar to a Slack bot or a Facebook Messenger bot.

## why?

[@mix](@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519) brought up the idea of developing systems _butt-first_: %3MS64b+lB4Dk5gag8tJKnA+zy8BEQ2cLmyxF06sBKyM=.sha256. with this approach, we use ssb as a database, where a "api call" is publishing a message to your feed and a "database transaction" is the bot publishing a message to their feed.

i want to make it easier for people to create pub invites, as currently the only way is for a pub owner to `ssh` into their server and run `sbot invite.create 1`. ([`easy-ssb-pub`](https://github.com/staltz/easy-ssb-pub) gets around this by allowing anyone to create an invite from a public webpage, but i want something to help the network grow with personal invites.)

so i'm interested in a conversational approach to creating invites. i want to be able to private message a pub and say "hey can i have an invite?" and the pub responds with "sure, here you go: .... !"

## how?

similar to [Elm](https://guide.elm-lang.org/) or [`inu`](https://github.com/ahdinosaur/inu): a bot is a function that receives the current state (from indexes) and the next message and returns the next state and any new messages to publish.

---

# TODO

```shell
npm install --save ssb-bot
```

## usage

### `ssbBot = require('ssb-bot')`


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
