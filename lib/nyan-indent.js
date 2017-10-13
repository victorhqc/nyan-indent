'use babel';

import { CompositeDisposable } from 'atom';

const removePaint = (textEditor) => {
  removePaintFromIndentation(textEditor, 0);
  removePaintFromIndentation(textEditor, 1);
  removePaintFromIndentation(textEditor, 2);
  removePaintFromIndentation(textEditor, 3);
  removePaintFromIndentation(textEditor, 4);
  removePaintFromIndentation(textEditor, 5);
};

const removePaintFromIndentation = (textEditor, indentation) => {
  const decorations = textEditor.getDecorations({
    type: 'text',
    class: `nyan-indent-${indentation}`,
  });
  decorations.forEach(decoration => decoration.marker.destroy());
};

export default {

  subscriptions: null,
  isPainted: false,

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'nyan-indent:toggle': () => this.toggle(),
    }));

    // Subscribe to changes in text
    this.subscriptions.add(atom.workspace.observeTextEditors(editor =>
      editor.onDidStopChanging(this.textDidChange)
    ));

    // Get current text to paint
    this.paint();
  },

  toggle() {
    this.isPainted ? this.unPaint() : this.paint();
  },

  paint() {
    this.isPainted = true;

    atom.workspace.observeTextEditors(this.paintTextEditor);
  },

  unPaint() {
    this.isPainted = false;

    this.subscriptions.dispose();
    atom.workspace.observeTextEditors(removePaint);
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
          class: `nyan-indent-${currentIndentation}`,
        });
      }
    }
  }
};
