'use babel';

import { CompositeDisposable } from 'atom';
import partial from 'lodash/partial';
import { paint, clean, didStopChanging } from './nyan-indent-render';

export default {

  subscriptions: null,
  isPainted: false,

  config: {
    colors: {
      type: 'array',
      default: [
        '#ff7f7f40',
        '#ffe48140',
        '#d2ff8b40',
        '#a5d1ff40',
        '#e39cff40',
      ],
      items: {
        type: 'string',
      },
    },
  },

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

  deactivate() {
    this.clean();
  },

  toggle() {
    if (this.isPainted) {
      return this.clean();
    }

    return this.paint();
  },

  paint() {
    this.isPainted = true;
    const colors = atom.config.get('nyan-indent.colors');

    // Subscribe to changes in text
    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor =>
      this.subscriptions.add(
        textEditor.buffer.onDidChangeText(partial(didStopChanging, textEditor, colors)),
      ),
    ));

    // Subscribe to configuration changes
    this.subscriptions.add(atom.config.onDidChange('nyan-indent.colors', {}, (event) => {
      clean(atom);
      paint(atom, event.newValue);
    }));

    paint(atom, colors);
  },

  clean() {
    this.isPainted = false;

    this.subscriptions.dispose();
    clean(atom);
  },
};
