export type BaseUserMessage<
  User extends BaseUser,
  Value extends any = string,
  Type extends string = 'string'
> = {
  id: string | number
  value: string | Value
  type: 'string' | Type
  chat: string
  user: User
}

export type BaseUser = {
  id: string
}
