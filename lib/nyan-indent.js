'use babel';

import { CompositeDisposable } from 'atom';
import partial from 'lodash/partial';
import { paint, clean, textDidChange } from './nyan-indent-render';

export default {

  subscriptions: null,
  isVisible: false,

  config: {
    color: {
      order: 1,
      type: 'string',
      default: 'nyan',
      enum: [
        { value: 'nyan', description: 'Nyan' },
        { value: 'blue', description: 'Blue' },
        { value: 'green', description: 'Green' },
        { value: 'safari', description: 'Safari' },
        { value: 'aquamarine', description: 'Aquamarine' },
        { value: 'midnight', description: 'Midnight' },
        { value: 'pink', description: 'Pink' },
        { value: 'purple', description: 'Purple' },
        { value: 'red', description: 'Red' },
        { value: 'orange', description: 'Orange' },
        { value: 'mustard', description: 'Mustard' },
      ],
    },
    useCustomColors: {
      order: 3,
      type: 'boolean',
      default: false,
    },
    customColors: {
      order: 4,
      type: 'object',
      title: 'Custom Colors',
      properties: {
        0: {
          title: 'First color',
          type: 'color',
          default: '#ff7f7f',
        },
        1: {
          title: 'Second color',
          type: 'color',
          default: '#ffe481',
        },
        2: {
          title: 'Third color',
          type: 'color',
          default: '#d2ff8b',
        },
        3: {
          title: 'Fourth color',
          type: 'color',
          default: '#a5d1ff',
        },
        4: {
          title: 'Fifth color',
          type: 'color',
          default: '#e39cff',
        },
      },
    },
    opacity: {
      order: 2,
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 40,
    },
  },

  initialize() {
    this.startSubscriptions();
    this.subscribeCommands();
  },

  getPreferences() {
    const chosenColor = atom.config.get('nyan-indent.color');
    const opacity = atom.config.get('nyan-indent.opacity');
    const useCustomColors = atom.config.get('nyan-indent.useCustomColors');
    const customColors = atom.config.get('nyan-indent.customColors');

    return {
      chosenColor,
      opacity,
      useCustomColors,
      customColors,
    };
  },

  activate() {
    this.isVisible = true;

    const preferences = this.getPreferences();
    this.paintAllTextEditors(preferences);

    // Subscribe to changes in text
    this.subscribeToTextChange(preferences);

    // Subscribe to configuration changes
    this.subscribeToConfigurationChange();
  },

  deactivate() {
    this.isVisible = false;

    this.subscriptions.dispose();
    this.cleanAlltextEditors();
  },

  startSubscriptions() {
    this.subscriptions = new CompositeDisposable();
  },

  subscribeCommands() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'nyan-indent:toggle': () => this.toggle(),
    }));
  },

  subscribeToTextChange(preferences) {
    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor =>
      this.subscriptions.add(
        textEditor.buffer.onDidChangeText(partial(textDidChange, textEditor, preferences)),
      ),
    ));
  },

  updatePreferences(preferences) {
    this.subscriptions.dispose();

    this.startSubscriptions();

    this.cleanAlltextEditors();
    this.paintAllTextEditors(preferences);

    this.subscribeToTextChange(preferences);
    this.subscribeToConfigurationChange();
  },

  subscribeToConfigurationChange() {
    this.subscriptions.add(atom.config.onDidChange('nyan-indent.color', {}, (event) => {
      const preferences = this.getPreferences();

      this.updatePreferences({
        ...preferences,
        chosenColor: event.newValue,
      });
    }));

    this.subscriptions.add(atom.config.onDidChange('nyan-indent.opacity', {}, (event) => {
      const preferences = this.getPreferences();

      this.updatePreferences({
        ...preferences,
        opacity: event.newValue,
      });
    }));

    this.subscriptions.add(atom.config.onDidChange('nyan-indent.useCustomColors', {}, (event) => {
      const preferences = this.getPreferences();

      this.updatePreferences({
        ...preferences,
        useCustomColors: event.newValue,
      });
    }));

    this.subscriptions.add(atom.config.onDidChange('nyan-indent.customColors', {}, (event) => {
      const preferences = this.getPreferences();

      this.updatePreferences({
        ...preferences,
        customColors: event.newValue,
      });
    }));
  },

  paintAllTextEditors(preferences) {
    this.subscriptions.add(atom.workspace.observeTextEditors(
      textEditor => paint(textEditor, preferences),
    ));
  },

  cleanTextEditor(textEditor) {
    clean(textEditor);
  },

  cleanAlltextEditors() {
    atom.workspace.getTextEditors().forEach(
      textEditor => this.cleanTextEditor(textEditor),
    );
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
