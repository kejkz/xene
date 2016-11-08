import Bot from '../bot'
import {RelaxedMessage} from '../types/messages/bot'
import {
  QueryReturn,
  QueryOptions,
  default as Query,
  PartialQueryReturn
} from './query'

export type Parser = (message: string, state: Object) => any
export type Validator = (parsed: any, state: any) => boolean
export type Validators = {
  validator: Validator
  nextStep?: string
  message?: RelaxedMessage
}[]

export interface ParserOptions extends QueryOptions {
  validator?: Validator
  validators?: Validators
  errorMessage?: RelaxedMessage
}

export class Parse extends Query {
  parser: Parser
  errorMessage: RelaxedMessage
  validators: Validators
  _options: ParserOptions

  constructor (parser: Parser, options: ParserOptions) {
    super(options)
    this.validators = options.validators || [{ validator: options.validator }]
    this.errorMessage = options.errorMessage
    this.parser = parser
  }

  handle (state: Object, bot: Bot, message: string): QueryReturn {
    if (this.skipStep(state, bot)) {
      return this.skippingState
    }
    const parsed = this.parser(message, state)
    const validated = this.validate(parsed, state)

    if (validated) {
      validated.value = parsed
      return this.returnValue(validated)
    }

    if (this.errorMessage) {
      return this.returnValue({
        message: this.formatMessage(this.errorMessage, state),
        done: false,
        exit: false
      })
    }
    throw new Error("Parse failed and `errorMessage` isn't defined.")
  }

  validate (parsed, state): PartialQueryReturn {
    const validated = this.validators.find(b => b.validator(parsed, state))
    if (!validated) { return null }
    const {nextStep, message} = validated
    return {
      message: message ? this.formatMessage(message, state) : null,
      nextStep
    }
  }
}

export default (parser: (message: string, state: Object) => any, options: ParserOptions): () => Parse => {
  if (!options.validator && !options.validators) {
    throw new Error('Query builder `parse` called without any `validator`.')
  }
  return () => new Parse(parser, options)
}
