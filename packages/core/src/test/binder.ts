import test, { TestContext } from 'ava'
import { TestBot } from './helpers/test-bot'
import { Binder } from '../binder'

interface IContext extends TestContext { context: { bot: TestBot } }
test.beforeEach(t => { t.context.bot = new TestBot() })

const msg = (message) => ({ chat: '#', message })

test('Can bind with any matcher', (t: IContext) => {
  t.plan(3)
  t.context.bot
    .when('string').do(() => t.pass())
    .when(/regex/gi).do(() => t.pass())
    .when(m => m.text === 'func').do(() => t.pass())

  t.context.bot.incoming('', '', 'string')
  t.context.bot.incoming('', '', 'regex')
  t.context.bot.incoming('', '', 'func')
})

test('Throws on unknown matcher', (t: IContext) => {
  t.throws(() => t.context.bot.when(45 as any).do(() => { /* noop */ }))
})

test('Can bind to any handler', (t: IContext) => {
  t.context.bot
    .when('do').do(({ chat }, b) => b.say(chat, 'done'))
    .when('talk').talk(d => d.say('talked'))
    .when('say').say('said')

  t.context.bot.incoming('#', '@', 'do')
  t.context.bot.incoming('#', '@', 'talk')
  t.context.bot.incoming('#', '@', 'say')
  t.deepEqual(t.context.bot.messages, [msg('done'), msg('talked'), msg('said')])
})
