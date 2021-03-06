import * as _ from 'lodash'
import request from './request'
import { APIError } from '../../errors'

export abstract class APIModule {
  protected namespace: string

  constructor(private token: string) {
    this.namespace = this.constructor.name.toLowerCase()
  }

  protected async request(method: string, form: any = {}) {
    const uri = `https://slack.com/api/${this.namespace}.${method}?token=${this.token}`
    form = _.mapValues(form, v => _.isObject(v) ? JSON.stringify(v) : v)
    try {
      const response = await request(uri, form)
      if (!response.ok) throw new APIError(response.error)
      return response
    } catch (e) {
      throw e
    }
  }
}
