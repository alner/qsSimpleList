
export default function paint($element, layout) {
  const React = require('react');
  //const ReactDOM = require('react/lib/ReactDOM');
  let ListComponent = require('./listComponent');
  //let self = this;
  let element = ($element)[0];
  if(layout.qListObject && layout.qListObject.qDataPages.length > 0) {
    const label = layout.qListObject.qDimensionInfo.qFallbackTitle;
    const data = layout.qListObject.qDataPages[0].qMatrix;
    const field = layout.qListObject.qDimensionInfo.qGroupFieldDefs[layout.qListObject.qDimensionInfo.qGroupPos].replace(/^=/, '');
    const alwaysOneSelected = layout.alwaysOneSelected || (layout.renderAs === 'select');
    const selectionColor = 'rgb(70, 198, 70)';
    // const renderAs = layout.renderAs;
    // const itemsLayout = layout.itemsLayout;
    // const lockSelection = layout.lockSelection;
    // const hideLabel = layout.hideLabel;
    // const hideExcluded = layout.hideExcluded;
    // const transparentStyle = layout.transparentStyle;
    // if(Theme)
    // selectionColor = layout.selectionColor < Theme.palette.length ? Theme.palette[layout.selectionColor] : 'rgb(70, 198, 70)';
    let options = {
      ...layout,
      // self,
      label,
      data,
      field,
      selectionColor,
      alwaysOneSelected
      // renderAs,
      // itemsLayout,
      // lockSelection,
      // hideExcluded,
      // transparentStyle
    };

    React.render(<ListComponent options={options}/>, element);
  }
}
