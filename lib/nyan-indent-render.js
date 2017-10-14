'use babel';

import map from 'lodash/map';

const observeTextEditors = (callback, atom) =>
  atom.workspace.observeTextEditors(callback);

const removePaintFromIndentation = (textEditor, indentation) => {
  const decorations = textEditor.getDecorations({
    type: 'text',
    class: `nyan-indent-${indentation}`,
  });
  decorations.forEach(decoration => decoration.marker.destroy());
};

const removePaint = (textEditor) => {
  removePaintFromIndentation(textEditor, 0);
  removePaintFromIndentation(textEditor, 1);
  removePaintFromIndentation(textEditor, 2);
  removePaintFromIndentation(textEditor, 3);
  removePaintFromIndentation(textEditor, 4);
  removePaintFromIndentation(textEditor, 5);
};

const paintTextEditorLine = (textEditor, { tabLength, line }) => {
  const lineIndentation = textEditor.indentationForBufferRow(line);
  const indentationLimit = lineIndentation * tabLength;

  // Create a Marker for each indentation
  for (
    let indentation = 0, counter = 0;
    indentation < indentationLimit;
    indentation += tabLength, counter += 1
  ) {
    const initialPoint = [line, indentation];
    const finalPoint = [line, (indentation + tabLength)];
    const range = [initialPoint, finalPoint];

    const marker = textEditor.markBufferRange(range);
    textEditor.decorateMarker(marker, {
      type: 'text',
      class: `nyan-indent-${counter}`,
    });
  }
};

const readTextEditorLines = (textEditor, { tabLength, numberOfLines }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { tabLength, line });
  }
};

const paintTextEditor = (textEditor) => {
  const tabLength = textEditor.getTabLength();
  const numberOfLines = textEditor.getLineCount();

  // Check all the existing lines for text Editor
  readTextEditorLines(textEditor, { tabLength, numberOfLines });
};

const removePaintFromRange = (textEditor, range) => {
  const markers = textEditor.findMarkers({
    containsBufferRange: range,
  });
  markers.forEach(marker => marker.destroy());
};

const paintMultipleLines = (textEditor, { tabLength, fromLine, toLine }) => {
  for (let line = fromLine; line <= toLine; line += 1) {
    paintTextEditorLine(textEditor, { tabLength, line });
  }
};

const updateCurrentLine = (textEditor, { tabLength, line }) =>
  paintTextEditorLine(textEditor, { tabLength, line });


/**
 * Called when user modifies text. Cleans previous markers and repaints
 * on top of changes.
 * @param  {Object} textEditor
 * @param  {Array} changes
 */
export const didStopChanging = (textEditor, changes) => {
  const tabLength = textEditor.getTabLength();
  return map(changes.changes, (change) => {
    // Cleans previous markers before adding new ones.
    removePaintFromRange(textEditor, change.oldRange);

    const fromLine = change.newRange.start.row;
    const toLine = change.newRange.end.row;

    if (fromLine === toLine) {
      return updateCurrentLine(textEditor, { tabLength, line: fromLine });
    }

    // Updates changes in different lines.
    return paintMultipleLines(textEditor, { tabLength, fromLine, toLine });
  });
};

/**
 * Paint all text from textEditor. This runs on activate or `toggle`
 * @param  {Object} atom
 */
export const paint = atom => observeTextEditors(paintTextEditor, atom);

/**
 * Cleans all text from textEditor. This runs on `toggle`
 * @param  {Object} atom
 */
export const clean = atom => observeTextEditors(removePaint, atom);
