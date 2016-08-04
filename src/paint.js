import {h, render} from 'preact';
import ListComponent from './listComponent';

export default function setupPaint({ Qlik }) {
  return {
    paint($element, layout) {
      //let ListComponent = require('./listComponent');
      let element = ($element)[0];
      if(layout.qListObject && layout.qListObject.qDataPages.length > 0) {
        const label = layout.qListObject.qDimensionInfo.qFallbackTitle;
        const data = layout.qListObject.qDataPages[0].qMatrix;
        const fieldName = layout.qListObject.qDimensionInfo.qGroupFieldDefs[layout.qListObject.qDimensionInfo.qGroupPos].replace(/^=/, '');
        const variableName = layout.variable;
        const app = Qlik.currApp();
        const field = app.field(fieldName);
        const variableAPI = app.variable;
        const alwaysOneSelected = layout.alwaysOneSelected || (layout.renderAs === 'select');
        const selectionColor = 'rgb(70, 198, 70)';
        let options = {
          ...layout,
          // self,
          label,
          data,
          field,
          variableAPI,
          variableName,
          selectionColor,
          alwaysOneSelected,
          // renderAs,
          // itemsLayout,
          // lockSelection,
          // hideExcluded,
          // transparentStyle
        };

        render(<ListComponent options={options}/>, element, element.lastChild);
      }
    },

    destroy($element, layout){
      const element = ($element)[0];
      if(element)
      render(<span></span>, element, element); // raise will/did unmount methods
    }
  }
}
