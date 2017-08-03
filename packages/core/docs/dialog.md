---
id:   dialog
type: class

---

<div class="intro">React.Component for conversations.</div>

The dialog is an abstract base class and core concept of xene. It allows you to define conversational flow with ES2017’s async/await and split complex conversational logic to small pieces. You will typically subclass it, and define `talk()` and static `match()` methods, like in the example below.

```ts
import { Dialog } from '@xene/core'

class Greeting extends Dialog {
  static match(msg) { return msg }
  async talk() {
    await this.message('hi ${user.name}')
  }
}
```

## Lifecycle

Each dialog has lifecycle methods that you can override to run code at particular times in the conversations. Each dialog lives as long as `talk()` method is active. Once it resolves, a dialog is complete and garbage collected.

|Phase|Description|
|--|--|
| <span class='title'>Matching</span> | Static `match()` method is called every time user tries to communicate with a bot if there aren't any active dialog with that user:<br/><ul><li>[`static match()`](#match)</li></ul>|
| <span class='title'>Initiating</span> | These methods are called once dialog's static `match()` method resolves to `true`:<br/><ul><li>[`constructor()`](#constructor)</li><li>[`onStart()`](#onstart)</li><li>[`talk()`](#talk)</li></ul>|
| <span class='title'>Talking</span> | During conversation with user for each send message and received message these methods are called:<br/><ul><li>[`onIncomingMessage()`](#onincomingmessage)</li><li>[`onOutgoingMessage()`](#onoutgoingmessage)</li></ul>|
| <span class='title'>Сlosing</span> | These methods are called once dialog ends either naturally or by request from the user:<br/><ul><li>[`onEnd()`](#onend)</li><li>[`onAbort()`](#onabort)</li></ul>|


## Core Methods

To communicate with users each dialog provides these methods using which you can define the conversational flow:

- [`message()`](#message)
- [`parse()`](#parse)
- [`ask()`](#ask)

<!-- api:core:dialog -->
