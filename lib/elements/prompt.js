'use strict';

const readline = require('readline');
const { action, clear} = require('../util');
const EventEmitter = require('events');
const { beep, cursor, erase } = require('sisteransi');

/**
 * Base prompt skeleton
 */
class Prompt extends EventEmitter {
  constructor() {
    super();

    this.in = process.stdin;
    this.out = process.stdout;

    const rl = readline.createInterface(this.in);
    readline.emitKeypressEvents(this.in, rl);

    if (this.in.isTTY) {
      this.in.setRawMode(true);
    }

    const keypress = (str, key) => {
      let a = action(key);
      if (a === false) {
        this._ && this._(str, key);
      } else if (typeof this[a] === 'function') {
        this[a](key);
      } else {
        this.bell();
      }
    };

    const close = () => {
      this.out.write(cursor.show);
      this.in.removeListener('keypress', keypress);
      if (this.in.isTTY) {
        this.in.setRawMode(false);
      } else {
        this.clear = clear(this.prompt)
        this.out.write(this.clear);
      }
      rl.close();
      this.emit(this.aborted ? 'abort' : 'submit', this.value);
    };
    this.close = close;

    this.in.on('keypress', keypress);
  }

  fire() {
    this.emit('state', {
      value: this.value,
      aborted: !!this.aborted
    });
  }

  bell() {
    this.out.write(beep);
  }
}

module.exports = Prompt;
