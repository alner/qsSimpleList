export default function paint($element, layout) {
  let ListComponent = require('./listComponent');
  let self = this;
  let element = ($element)[0];
  if(layout.qListObject && layout.qListObject.qDataPages.length > 0) {
    let label = layout.qListObject.qDimensionInfo.qFallbackTitle;
    let data = layout.qListObject.qDataPages[0].qMatrix;
    let field = layout.qListObject.qDimensionInfo.qGroupFieldDefs[layout.qListObject.qDimensionInfo.qGroupPos].replace(/^=/, '');
    let alwaysOneSelected = layout.alwaysOneSelected || (layout.renderAs === 'select');
    let selectionColor = 'rgb(70, 198, 70)';
    let renderAs = layout.renderAs;
    let itemsLayout = layout.itemsLayout;
    let lockSelection = layout.lockSelection;
    let hideLabel = layout.hideLabel;
    // if(Theme)
    // selectionColor = layout.selectionColor < Theme.palette.length ? Theme.palette[layout.selectionColor] : 'rgb(70, 198, 70)';
    let options = {
      self,
      label,
      hideLabel,
      data,
      field,
      renderAs,
      selectionColor,
      itemsLayout,
      lockSelection,
      alwaysOneSelected
    };

    React.render(<ListComponent options={options}/>, element);
  }
}
