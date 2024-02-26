/**
 * // TODO: better note type
 * @typedef {string} Note
 * 
 * @typedef {'sequential' | 'chord'} ChallengeMode
 * 
 * @typedef {object} GameRules
 * @property {Note} tonic the root note of the interval
 * @property {Note[]} targets the "hidden" notes that the player is trying to guess
 * @property {ChallengeMode} [challengeMode] whether the notes should play in sequence or at the same time when presenting the challenge
 * 
 * 
 * @typedef {object} GameProgress
 * @property {Note[]} guesses
 */


/** @type {ChallengeMode} */
const DEFAULT_CHALLENGE_MODE = 'sequential'


export class GameRoundState extends EventTarget {
  /** @type {GameRules | undefined} */
  rules

  /** @type {GameProgress} */
  progress = { guesses: [ ] }

  #reset() {
    this.rules = undefined
    this.progress = { guesses: [ ] }
  }

  /**
   * Starts a new game with the given rules, resetting the current progress (if any).
   * 
   * @param {GameRules} rules 
   */
  start(rules) {
    this.#reset()
    this.rules = {
      challengeMode: DEFAULT_CHALLENGE_MODE,
      ...rules
    }
    this.dispatchEvent(new GameStartedEvent(this))
  }

  giveUp() {
    this.#reset()
    this.dispatchEvent(new GameAbandonedEvent(this))
  }

  /**
   * @param {Note} guess
   * @returns {Error|null}
   */
  guess(guess) {
    if (!this.isStarted || this.isComplete) {
      return new Error('game not in progress, ignoring guess')
    }

    this.progress.guesses.push(guess)
    if (this.#isCorrect(guess)) {
      this.dispatchEvent(new GuessCorrectEvent({ guess, game: this }))
    } else {
      this.dispatchEvent(new GuessIncorrectEvent({ guess, game: this }))
    }
    if (this.isComplete) {
      this.dispatchEvent(new GameCompletedEvent(this))
    }
    return null
  }

  /**
   * @param {Note} guess 
   */
  #isCorrect(guess) {
    return this.rules.targets.includes(guess)
  }

  get isStarted() {
    return this.rules != null
  }

  get isComplete() {
    return this.rules?.targets
      .every(note => this.progress.guesses.includes(note))
      ?? false
  }
}

export const currentRound = new GameRoundState()

export const EventNames = {
  started: 'game:started',
  completed: 'game:completed',
  abandoned: 'game:abandoned',
  correctGuess: 'game:correct-guess',
  incorrectGuess: 'game:incorrect-guess',
}


/**
 * @extends {CustomEvent<{ game: GameRoundState }>}
 */
class GameEvent extends CustomEvent {
  /**
   * @param {string} eventName 
   * @param {GameRoundState} game 
   */
  constructor(eventName, game) {
    super(eventName, { detail: { game } })
  }
  /** @returns {GameRoundState} */
  get game() {
    return this.detail.game
  }
}

export class GameStartedEvent extends GameEvent {
  /** @param {GameRoundState} game */
  constructor(game) {
    super(EventNames.started, game)
  }
}

export class GameCompletedEvent extends GameEvent {
  /** @param {GameRoundState} game */
  constructor(game) {
    super(EventNames.completed, game)
  }
}

export class GameAbandonedEvent extends GameEvent {
   /** @param {GameRoundState} game */
  constructor(game) {
    super(EventNames.abandoned, game)
  }
}

/**
 * @typedef {{ guess: Note, game: GameRoundState }} GuessEventDetail
 * @extends {CustomEvent<GuessEventDetail>}
 */
export class GuessEvent extends CustomEvent {
  /** 
   * @param {string} eventName
   * @param {GuessEventDetail} detail 
   */
  constructor(eventName, detail) {
    super(eventName, { detail })
  }

  get guess() {
    return this.detail.guess
  }

  get game() {
    return this.detail.game
  }
}

export class GuessCorrectEvent extends GuessEvent {
  /** @param {GuessEventDetail} detail */
  constructor(detail) {
    super(EventNames.correctGuess, detail)
  }
}

export class GuessIncorrectEvent extends GuessEvent {
  /** @param {GuessEventDetail} detail */
  constructor(detail) {
    super(EventNames.incorrectGuess, detail)
  }
}