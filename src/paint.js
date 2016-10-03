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
        // Field API has a bug. It is stop working after reload in another window.
        // field.field.session.rpc
        //const field = app.field(fieldName);
        const lockField = function () {
          return app.global.session.rpc({
            "handle": app.model.handle,
            "method": "GetField",
            "params": {
              "qFieldName": fieldName,
              "qStateName": ""
            }}).then((data) => {
              if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
                app.global.session.rpc({
                  "handle": data.result.qReturn.qHandle,
                  "method": "Lock",
                  "params": {},
                })
              })
        }
        const unlockField = function() {
          return app.global.session.rpc({
            "handle": app.model.handle,
            "method": "GetField",
            "params": {
              "qFieldName": fieldName,
              "qStateName": ""
            }}).then((data) => {
              if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
                app.global.session.rpc({
                  "handle": data.result.qReturn.qHandle,
                  "method": "Unlock",
                  "params": {},
                })
            })
        }
        const selectValues = this.backendApi.selectValues.bind(this.backendApi);
        const variableAPI = app.variable;
        const alwaysOneSelected = layout.alwaysOneSelected || (layout.renderAs === 'select');
        const selectionColor = 'rgb(70, 198, 70)';
        let options = {
          ...layout,
          label,
          data,
          app,
          //field,
          selectValues,
          lockField,
          unlockField,
          variableAPI,
          variableName,
          selectionColor,
          alwaysOneSelected,
        };

        render(<ListComponent options={options}/>, element, element.lastChild);

        // Remove zoom-in button:
        const $parent = $element.parents('.qv-object-qsSimpleList');
        const $zoomIn = $parent && $parent.find('[tid=nav-menu-zoom-in]');
        if($zoomIn) $zoomIn.remove();
      }
    },

    destroy($element, layout){
      const element = ($element)[0];
      if(element)
      render(<span></span>, element, element); // raise will/did unmount methods
    }
  }
}
