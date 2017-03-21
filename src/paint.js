import {h, render} from 'preact';
import ListComponent from './listComponent';
import Subscribers from './updateData';

export default function setupPaint({ Qlik }) {

  function doPaint(self, $element, layout, isResize = false) {
    //let ListComponent = require('./listComponent');
    let element = ($element)[0];
    if(layout.qListObject && layout.qListObject.qDataPages.length > 0) {
      const label = layout.qListObject.qDimensionInfo.qFallbackTitle;
      const data = layout.qListObject.qDataPages[0].qMatrix;
      const area = layout.qListObject.qDataPages[0].qArea;
      const fieldName = layout.qListObject.qDimensionInfo.qGroupFieldDefs[layout.qListObject.qDimensionInfo.qGroupPos].replace(/^=/, '');
      //const variableName = layout.variable;
      const expValuesInsteadOfField = layout.qListObject.qExpressions.length > 0
        && layout.qListObject.qExpressions[0].qExpr;
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
      const selectValues = self.backendApi.selectValues.bind(self.backendApi);
//      const variableAPI = app.variable;
      const alwaysOneSelected = layout.alwaysOneSelected || (layout.renderAs === 'select');
      const selectionColor = 'rgb(70, 198, 70)';
      const backendApi = self.backendApi;
      const subscribers = self.subscribers;
      let options = {
        ...layout,
        label,
        data,
        area,
        app,
        //field,
        selectValues,
        lockField,
        unlockField,
//        variableAPI,
//        variableName,
        selectionColor,
        alwaysOneSelected,
        isResize,
        expValuesInsteadOfField,
        subscribers,
      };

      render(<ListComponent options={options}/>, element, element.lastChild);

      // Remove zoom-in button:
      // const $parent = $element.parents('.qv-object-qsSimpleList');
      // const $zoomIn = $parent && $parent.find('[tid=nav-menu-zoom-in]');
      // if($zoomIn) $zoomIn.remove();
    }
  }

  return {    

    paint($element, layout) {
      doPaint(this, $element, layout);
    },

    resize($element, layout) {
      doPaint(this, $element, layout, true);
    },

    updateData(layout) {
      if(!this.subscribers)
        this.subscribers = new Subscribers();

      this.subscribers.onUpdateData(layout);
      return Qlik.Promise.resolve();
    },

    getDropFieldOptions(builder, propertyHandler, model, showMenu, object){
			let item = builder.item;
			let itemType = item.type;
      if(itemType === 'field') {
        let newItem = propertyHandler.createFieldDimension(item.name, item.name);
        propertyHandler.replaceDimension(0, newItem).then(function (dimension) {
          model.save();
          //qvangular.$rootScope.$broadcast("pp-open-path", "data." + dimension.qDef.cId)
        });
      }
      // or build and show menu
      // builder.Add(model, propertyHandler);
      // builder.ReplaceDimensions(model, propertyHandler);
      // showMenu();
    },

    getDropDimensionOptions(builder, propertyHandler, model, showMenu) {
			let item = builder.item;
			let itemType = item.type;
      if(itemType === 'dimension') {      
        let newItem = propertyHandler.createLibraryDimension(item.id);
        propertyHandler.replaceDimension(0, newItem).then(function (dimension) {
          model.save();
          //qvangular.$rootScope.$broadcast("pp-open-path", "data." + dimension.qDef.cId)
        });
      }
      // or build and show menu
      // builder.Add(model, propertyHandler);
      // builder.ReplaceDimensions(model, propertyHandler);
      // showMenu();
    },

    destroy($element, layout){
      const element = ($element)[0];
      if(element)
      render(<span></span>, element, element); // raise will/did unmount methods
    }
  };
}
