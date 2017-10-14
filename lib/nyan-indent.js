'use babel';

import { CompositeDisposable } from 'atom';
import partial from 'lodash/partial';
import { paint, clean, didStopChanging } from './nyan-indent-render';

export default {

  subscriptions: null,
  isPainted: false,

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    // this.subscriptions.add();
    atom.commands.add('atom-workspace', {
      'nyan-indent:toggle': () => this.toggle(),
    });

    // Get current text to paint
    this.paint();
  },

  toggle() {
    if (this.isPainted) {
      return this.clean();
    }

    return this.paint();
  },

  paint() {
    this.isPainted = true;

    // Subscribe to changes in text
    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor =>
      this.subscriptions.add(
        textEditor.buffer.onDidChangeText(partial(didStopChanging, textEditor)),
      ),
    ));

    paint(atom);
  },

  clean() {
    this.isPainted = false;

    this.subscriptions.dispose();
    clean(atom);
  },
};
