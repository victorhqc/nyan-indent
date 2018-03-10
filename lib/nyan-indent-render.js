'use babel';

import map from 'lodash/map';

const calculateDecoration = ({
  chosenColor,
  opacity,
  useCustomColors,
  customColors,
  currentNumber,
}) => {
  // The first thing to do is identify which approach to use according to Atom's API.
  // Style or class name.
  if (useCustomColors) {
    return {
      class: 'nyan-indent',
      style: {
        opacity: opacity / 100,
        backgroundColor: customColors[currentNumber].toHexString(),
      },
    };
  }

  return {
    class: `nyan-indent nyan-indent-${currentNumber} ${chosenColor}`,
    style: {
      opacity: opacity / 100,
    },
  };
};

const isLineUsingTabulations = (textEditor, { text }) => /^\t/.test(text);

const paintTextEditorLine = (textEditor, {
  tabLength,
  line,
  ...preferences
}) => {
  const lineIndentation = textEditor.indentationForBufferRow(line);

  const text = textEditor.lineTextForBufferRow(line);
  const usedTabLength = isLineUsingTabulations(textEditor, { text })
    ? 1
    : tabLength;

  const indentationLimit = Math.floor(lineIndentation) * usedTabLength;

  // Create a Marker for each indentation
  for (
    let indentation = 0, counter = 0;
    indentation < indentationLimit;
    indentation += usedTabLength, counter += 1
  ) {
    const initialPoint = [line, indentation];
    const finalPoint = [line, (indentation + usedTabLength)];
    const range = [initialPoint, finalPoint];

    const NUMBER_OF_COLORS = 5;
    const currentNumber = counter % NUMBER_OF_COLORS;
    const decorations = calculateDecoration({
      currentNumber,
      ...preferences,
    });

    const marker = textEditor.markBufferRange(range);

    marker.setProperties({
      nyanIndent: true,
      line,
      currentNumber,
      range,
    });

    if (marker.isValid() && !marker.isDestroyed()) {
      textEditor.decorateMarker(marker, {
        type: 'text',
        ...decorations,
      });
    }
  }
};

const readTextEditorLines = (textEditor, { tabLength, numberOfLines, ...preferences }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { tabLength, line, ...preferences });
  }
};

const removeMarkersFromRange = (textEditor, range) => {
  const markers = textEditor.findMarkers({
    nyanIndent: true,
    startBufferRow: range.start.row,
    endBufferRow: range.end.row,
  });
  markers.forEach(marker => marker.destroy());
};

const paintMultipleLines = (textEditor, {
  tabLength,
  fromLine,
  toLine,
  ...preferences
}) => {
  for (let line = fromLine; line <= toLine; line += 1) {
    paintTextEditorLine(textEditor, { tabLength, line, ...preferences });
  }
};

/**
 * Called when user modifies text. Cleans previous markers and repaints
 * on top of changes.
 * @param  {Object} textEditor
 * @param  {Array} changes
 */
export const textDidChange = (textEditor, preferences, changes) => {
  const tabLength = textEditor.getTabLength();
  return map(changes.changes, (change) => {
    // Cleans previous markers before adding new ones.
    removeMarkersFromRange(textEditor, change.newRange);

    const fromLine = change.newRange.start.row;
    const toLine = change.newRange.end.row;

    if (fromLine === toLine) {
      return paintTextEditorLine(textEditor, {
        tabLength,
        line: fromLine,
        ...preferences,
      });
    }

    // Updates changes in different lines.
    return paintMultipleLines(textEditor, {
      tabLength,
      fromLine,
      toLine,
      ...preferences,
    });
  });
};

export const paint = (textEditor, preferences) => {
  const tabLength = textEditor.getTabLength();
  const numberOfLines = textEditor.getLineCount();

  // Check all the existing lines for text Editor
  readTextEditorLines(textEditor, { tabLength, numberOfLines, ...preferences });
};

export const clean = (textEditor) => {
  const markers = textEditor.findMarkers({
    nyanIndent: true,
  });
  map(markers, marker => marker.destroy());
};
