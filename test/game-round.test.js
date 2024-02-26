// @ts-expect-error typescript doesn't know we're using an esm-bundled version of chai
import { expect } from 'chai'
import { GameRoundState, EventNames } from '../src/js/state/game-round.js'

/**
 * 
 * @param {GameRoundState} target 
 * @param {string} eventName 
 * @returns 
 */
const firstEvent = (target, eventName) => 
  new Promise(resolve => 
    target.addEventListener(eventName, resolve))

it('is not started or completed when first created', () => {
  const state = new GameRoundState()
  expect(state.isStarted).to.eq(false)
  expect(state.isComplete).to.eq(false)
})

it('dispatches an event when started', async () => {
  const state = new GameRoundState()
  const started = firstEvent(state, EventNames.started)
  state.start({ tonic: 'C', targets: ['E'] })
  const evt = await started
  expect(state.isStarted).to.eq(true)
  expect(evt.game).to.eq(state)
})

it('dispatches an event when abandoned', async () => {
  const state = new GameRoundState()
  const started = firstEvent(state, EventNames.started)
  const abandoned = firstEvent(state, EventNames.abandoned)
  state.start({ tonic: 'C', targets: ['E'] })
  await started
  expect(state.isStarted).to.eq(true)

  state.giveUp()
  await abandoned
  expect(state.isStarted).to.eq(false)
})

it('dispatches an event when the player guesses correctly', async () => {
  const state = new GameRoundState()
  state.start({ tonic: 'C', targets: ['E']})

  const guessed = firstEvent(state, EventNames.correctGuess)
  state.guess('E')
  const guess = await guessed
  expect(guess.guess).to.eq('E')
})

it('dispatches an event when the player guesses incorrectly', async () => {
  const state = new GameRoundState()
  state.start({ tonic: 'C', targets: ['E']})

  const guessed = firstEvent(state, EventNames.incorrectGuess)
  state.guess('D')
  const guess = await guessed
  expect(guess.guess).to.eq('D')
  expect(state.isComplete).to.eq(false)
})

it('dispatches an event when the player wins the game', async () => {
  const state = new GameRoundState()
  state.start({ tonic: 'C', targets: ['E']})

  const completed = firstEvent(state, EventNames.completed)
  state.guess('E')
  await completed
  expect(state.isComplete).to.eq(true)
})
