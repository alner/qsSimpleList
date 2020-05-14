import {h, render} from 'preact';
import ListComponent from './listComponent';
import Subscribers from './updateData';
import applyActions from './actions';

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
      const selectionColor = (layout.color && layout.color.color) || '#009845';
      //const backendApi = self.backendApi;
      const subscribers = self.subscribers;
      let options = {
        ...layout,
        layout,
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

      if(layout.hideCondition == -1)
        render(<div />, element, element.lastChild);
      else
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

/*
    onPaint() {
      var dimensions,
      measures,
      $scope = this.$scope,
      layout = $scope.layout,
      minDimensions = $scope.ext.dimensionDefinition ? $scope.ext.dimensionDefinition.min : 0,
      maxDimensions = $scope.ext.dimensionDefinition ? $scope.ext.dimensionDefinition.max : 0,
      minMeasures = $scope.ext.measureDefinition ? $scope.ext.measureDefinition.min : 0,
      maxMeasures = $scope.ext.measureDefinition ? $scope.ext.measureDefinition.max : 0;
      $scope.showAdd = State.isInEditMode() && !$scope.object.isReadonly;
      $scope.iconClass = $scope.object.ext.libraryInfo.templateIconClassName,
      $scope.minDimensions = minDimensions,
      $scope.minMeasures = minMeasures,
      $scope.maxDimensions = maxDimensions,
      $scope.maxMeasures = maxMeasures,
      minDimensions !== maxDimensions || minMeasures !== maxMeasures ? $scope.headerStr = "Visualization.Requirements.AddAtLeast" : $scope.headerStr = "Visualization.Requirements.Add",
      dimensions = getDimensionInfo(layout).map(function (dimension) {
          var title,
          errorCode = dimension.qError && dimension.qError.qErrorCode;
          return title = errorCode ? errorTranslation.getDimensionError(errorCode) : dimension.title || dimension.qFallbackTitle, {
            invalid : !!errorCode,
            title : title
          }
        }),
      measures = getMeasureInfo(layout).map(function (measure) {
          var title,
          errorCode = measure.qError && measure.qError.qErrorCode;
          return title = errorCode ? errorTranslation.getMeasureError(errorCode) : measure.qFallbackTitle, {
            invalid : !!errorCode,
            title : title
          }
        }),
      $scope.finishedDimensions = dimensions,
      $scope.finishedMeasures = measures,
      $scope.unfinishedDimensions = getArray(Math.max(0, $scope.minDimensions - $scope.finishedDimensions.length)),
      $scope.unfinishedMeasures = getArray(Math.max(0, $scope.minMeasures - $scope.finishedMeasures.length)),
      $scope.show = !0
    },
*/    

    resize($element, layout) {
      doPaint(this, $element, layout, true);
    },

    updateData(layout) {
      if(!this.subscribers) {
        this.subscribers = new Subscribers();
        this.subscribers.once(() => applyActions(Qlik.currApp(), layout, true));
      }

      this.subscribers.onUpdateData(layout);
      return Qlik.Promise.resolve();
    },

    getDropFieldOptions(builder, propertyHandler, model, showMenu, object){
			let item = builder.item;
			let itemType = item.type;
      if(itemType === 'field') {
        let newItem = propertyHandler.createFieldDimension(item.name, item.name);
        propertyHandler.replaceDimension(0, newItem).then(function (dimension) {
          if(model.save)
            model.save();
          else
          if(model.setProperties)
            model.setProperties(propertyHandler.properties);
          //qvangular.$rootScope.$broadcast("pp-open-path", "data." + dimension.qDef.cId)
        });
      }
      // or build up and show menu
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
          if(model.save)
            model.save();
          else
          if(model.setProperties)
            model.setProperties(propertyHandler.properties);
          //qvangular.$rootScope.$broadcast("pp-open-path", "data." + dimension.qDef.cId)
        });
      }
      // or build up and show menu
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
