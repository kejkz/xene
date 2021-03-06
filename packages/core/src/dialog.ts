import { Bot as B } from './bot'
import { Parser } from './parser'
import { Manager } from './manager'
import { Question } from './question'
import { UserMessage, ParseType, ParseFun, ParseObj } from './types'

const isMessage = <T>(arg): arg is object =>
  arg != null && typeof arg !== 'function'

const errorHandler = (say, arg): ((reply: string) => any) =>
  isMessage(arg) ? () => say(arg) : arg

export class Dialog<
  Bot extends B,
  BotMessage extends Bot['_']['BotMessage']= Bot['_']['BotMessage']> {

  bot: Bot
  chat: string
  users: string[]
  /** @internal */
  _manager: Manager
  get user() { return this.users[0] }

  constructor(bot: Bot, chat: string, users: string[]) {
    this.bot = bot, this.chat = chat, this.users = users
    this._manager = new Manager(bot, chat, users)
    this.parse = this.parse.bind(this)
    this.ask = this.ask.bind(this)
  }

  on(event: 'end', callback: () => any)
  on(event: 'abort', callback: () => any)
  on(event: 'incomingMessage', callback: (message: UserMessage) => any)
  on(event: 'outgoingMessage', callback: (chat: string, message: BotMessage) => any)
  on(event: string, callback: (...args: any[]) => any) {
    this._manager.on(event, callback)
  }

  end = () => {
    this._manager.emit('end')
    this._manager.unbind()
  }

  say = (message: BotMessage) => {
    this._manager.emit('outgoingMessage', this.chat, message)
    return this.bot.say(this.chat, message)
  }

  parse<T>(parserFunc: ParseFun<T>): Promise<T>
  parse<T>(parserFunc: ParseFun<T>, errorMessage: BotMessage): Promise<T>
  parse<T>(parserFunc: ParseFun<T>, errorCallback: (reply: string) => any): Promise<T>
  parse<T>(parserObject: ParseObj<T>, errorMessage: BotMessage): Promise<T>
  parse<T>(parserObject: ParseObj<T>, errorCallback: (reply: string) => any): Promise<T>
  parse<T>(parser: ParseType<T>, onError?: BotMessage | ((reply: string) => any)): Promise<T> {
    const parserObj = new Parser(parser, errorHandler(this.say, onError))
    this._manager.add(parserObj)
    return parserObj.promise
  }

  ask<T>(message: BotMessage, parserFunc: ParseFun<T>): Promise<T>
  ask<T>(message: BotMessage, parserFunc: ParseFun<T>, errorMessage: BotMessage): Promise<T>
  ask<T>(message: BotMessage, parserFunc: ParseFun<T>, errorCallback: (reply: string) => any): Promise<T>
  ask<T>(message: BotMessage, parserObject: ParseObj<T>): Promise<T>
  ask<T>(message: BotMessage, parserObject: ParseObj<T>, errorMessage: BotMessage): Promise<T>
  ask<T>(message: BotMessage, parserObject: ParseObj<T>, errorCallback: (reply: string) => any): Promise<T>
  ask<T>(message: BotMessage, parser: ParseType<T>, onError?: BotMessage | ((reply: string) => any)) {
    const sayMessage = () => this.say(message)
    const question = new Question(sayMessage, parser, errorHandler(this.say, onError))
    this._manager.add(question)
    return question.promise
  }
}
