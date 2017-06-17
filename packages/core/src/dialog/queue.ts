import { BaseUserMessage, BaseUser } from '../types'

export interface IAddSignature {
  parser: {
    parse: (msg: string) => any
    check: (parsed: any) => boolean
  }
  done: (msg: string) => void
  error?: (reply: string, parsed: any) => void // TODO better to return Promise<>
}

export default class Queue<Message extends BaseUserMessage<BaseUser> = BaseUserMessage<BaseUser>> {
  private queue: IAddSignature[] = []
  private message: Message

  push(obj: IAddSignature) {
    this.queue.push(obj)
    return this.processMessage()
  }

  resetMessage() {
    this.message = null
  }

  async processMessage(msg = this.message) {
    this.message = msg
    if (!this.queue[0] || !msg) return
    const { done, parser, error } = this.queue[0]
    const parsed = await parser.parse(msg.value)
    const isValid = parser.check(parsed)
    if (isValid || !error) {
      done(parsed)
      this.queue.shift()
      this.processMessage(msg)
    } else {
      error(msg.value, parsed)
    }
  }
}
