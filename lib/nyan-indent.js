'use babel';

import { CompositeDisposable } from 'atom';
import partial from 'lodash/partial';
import { paint, clean, textDidChange } from './nyan-indent-render';

export default {

  subscriptions: null,
  isVisible: false,

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

  initialize() {
    this.startSubscriptions();
    this.subscribeCommands();
  },

  activate() {
    this.isVisible = true;

    const colors = atom.config.get('nyan-indent.colors');
    paint(atom, colors);

    // Subscribe to changes in text
    this.subscribeToTextChange(colors);

    // Subscribe to configuration changes
    this.subscribeToConfigurationChange();
  },

  deactivate() {
    this.isVisible = false;

    this.subscriptions.dispose();
    clean(atom);
  },

  startSubscriptions() {
    this.subscriptions = new CompositeDisposable();
  },

  subscribeCommands() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'nyan-indent:toggle': () => this.toggle(),
    }));
  },

  subscribeToTextChange(colors) {
    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor =>
      this.subscriptions.add(
        textEditor.buffer.onDidChangeText(partial(textDidChange, textEditor, colors)),
      ),
    ));
  },

  subscribeToConfigurationChange() {
    this.subscriptions.add(atom.config.onDidChange('nyan-indent.colors', {}, (event) => {
      const newColors = event.newValue;

      this.subscriptions.dispose();

      this.startSubscriptions();

      clean(atom);
      paint(atom, newColors);

      this.subscribeToTextChange(newColors);
      this.subscribeToConfigurationChange();
    }));
  },

  toggle() {
    if (!this.isVisible) {
      this.activate();
      return;
    }

    this.deactivate();
    // Resets the subscriptions and rebinds the toggle command
    this.initialize();
  },
};
