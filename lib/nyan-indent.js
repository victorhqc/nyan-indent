'use babel';

// import NyanIndentView from './nyan-indent-view';
import { CompositeDisposable } from 'atom';

export default {

  // nyanIndentView: null,
  // modalPanel: null,
  subscriptions: null,

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'nyan-indent:toggle': () => {},
    }));

    // Subscribe to changes in text
    this.subscriptions.add(atom.workspace.observeTextEditors(editor =>
      editor.onDidStopChanging(this.textDidChange)
    ));

    // Get current text to paint
    atom.workspace.observeTextEditors(this.paintTextEditor);
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  textDidChange(e) {
    console.log('something is here', e);
  },

  paintTextEditor(textEditor) {
    const tabLength = textEditor.getTabLength();
    const numberOfLines = textEditor.getLineCount();

    // Check all the existing lines for text Editor
    for (let currentLine = 0; currentLine < numberOfLines; currentLine++) {
      const indentationForLine = textEditor.indentationForBufferRow(currentLine);

      // Create a Marker for each indentation
      for (let currentIndentation = 0; currentIndentation < indentationForLine; currentIndentation++) {
        const initialPoint = [currentLine, currentIndentation * tabLength];
        const finalPoint = [currentLine, (currentIndentation + 1) * tabLength];
        const range = [initialPoint, finalPoint];

        const marker = textEditor.markBufferRange(range);
        const decoration = textEditor.decorateMarker(marker, {
          type: 'text',
          class: `nyan-indent-${currentIndentation}`
        });
      }

    }
  }
};
