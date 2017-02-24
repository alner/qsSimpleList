import {h, Component, render} from 'preact';
import { getRefValue, setRefValue, getSelectedObject } from './definitionUtils';
import showDialog from './dialogService';
import PropertyComponent, {RootPropertyComponent, getIconName} from './propertyComponent';
import { GetDimensionProperties, GetMeasureProperties, GetBookmarkProperties, GetVariableProperties } from './engineApi';

 export const RemoveButtonComponent = {
  template:
    `
    <div class="pp-component" ng-if="visible">
          <div class="label" ng-if="label" ng-class="{ \'disabled\': readOnly }">
            {{label}}
          </div>
          <div class="value">
            <div ng-if="!loading">
              <button class="qui-outlinebutton lui-button lui-button--full-width" qva-activate="remove()">
                <span class="lui-button__text" q-translation="Common.Delete"></span>
                <span class="lui-button__icon lui-icon lui-icon--bin remove-icon" q-title-translation="Common.Delete">&nbsp;</span>
            	</button>
            </div>
            <div class="pp-loading-container" ng-if="loading">
              <div class="pp-loader qv-loader"></div>
            </div>
            <div ng-if="errorMessage" class="pp-invalid error">{{errorMessage}}</div>
          </div>
    </div>
    `
  ,
  controller:
    ["$scope", "$element", function(c, e){
      function initOptions() {
        c.loading = true;
        c.errorMessage = "";
        c.visible = true;
        c.loading = false;
      }

      initOptions();

      c.remove = function() {
        "function" == typeof c.definition.remove && c.definition.remove(c.data, c.args.handler);
        c.$emit("saveProperties");
      };

      c.$on("datachanged", function () {
        initOptions();
      });
    }]
};


// Utility function to create "property selection dialog component".
function MakePropertySelectComponent({ luiIcon, showSelectionDialog}) {
  return {
      template:
      `
    <div class="pp-component" ng-if="visible">
      <div class="label" ng-if="label" ng-class="{ \'disabled\': readOnly }">
        {{label}}
      </div>
      <div class="lui-input-group" ng-if="!loading">
          <input class="lui-input-group__item  lui-input-group__input  lui-input" ng-model="t.value" ng-change="onDataChange()"/>
          <button class="lui-input-group__item  lui-input-group__button  lui-button" qva-activate="showSelectionDialog()">
              <span class="lui-button__icon  lui-icon ${luiIcon}"></span>
          </button>
      </div>
      <div class="pp-loading-container" ng-if="loading">
        <div class="pp-loader qv-loader"></div>
      </div>
      <div ng-if="errorMessage" class="pp-invalid error">{{errorMessage}}</div>
    </div>
      `,
      controller:
        ["$scope", function(c){
          function initOptions() {
            c.loading = true;
            c.errorMessage = "";
            c.label = c.definition.label;
            c.t = {
              value: getRefValue(c.data, c.definition.ref)
            }
            c.visible = true;
            c.loading = false;
          }

          c.showSelectionDialog = showSelectionDialog && showSelectionDialog.bind(c);

          c.onDataChange = function(additionalData) {
            setRefValue(c.data, c.definition.ref, c.t.value);
            "function" == typeof c.definition.change && c.definition.change(c.data, c.args.handler, additionalData);
            c.$emit("saveProperties");
          };

          // c.$on("datachanged", function () {
          //   initOptions();
          // });

          initOptions();
        }]
  };
}


//
// PropertySelectionComponent
//

// Utility function
function getObjectProperties(app, objectIdentifier) {
  let {object, objectType} = getSelectedObject(objectIdentifier);
  let resultPromise;
  switch(objectType) {
    case 'dimension':
      // Master object: dimension
      resultPromise = GetDimensionProperties(app, object).then(
        model => Promise.resolve((model && model.result && model.result.qProp) || model)
      );
      break;

    case 'measure':
      // Master objects: measure
      resultPromise = GetMeasureProperties(app, object).then(
        model => Promise.resolve((model && model.result && model.result.qProp) || model)
      );
      break;

    case 'bookmark':
      resultPromise = GetBookmarkProperties(app, object).then(
        model => Promise.resolve((model && model.result && model.result.qProp) || model)
      );
      break;

    case 'variable':
      resultPromise = GetVariableProperties(app, object).then(
        model => Promise.resolve((model && model.result && model.result.qProp) || model)
      );    
      break;
    
    case 'visualization':
    default:
      resultPromise = app.getObjectProperties(object).then(model => Promise.resolve(model.properties));
  }

  return resultPromise;
}

export const PropertySelectionComponent = MakePropertySelectComponent({
  luiIcon: 'lui-icon--effects',
  showSelectionDialog() {
        let c = this; // scope
        const { app } = (c.definition.onInit && c.definition.onInit());
        if(app) {
            getObjectProperties(app, c.data.object).then(model => {
                let currentSelection = c.t.value;
                showDialog(
                  <PropertyComponent
                    name=""
                    properties={model}
                    currentSelection={currentSelection}
                    onSelectItem={newValue => {
                      currentSelection = newValue
                    }} />
                  ,
                  {
                    DialogTitle: `${model.qInfo.qId} (${model.qInfo.qType}) : ${model.title || (model.qMetaDef && model.qMetaDef.title)}`,
                    LabelOK: 'OK',
                    LabelCancel: 'Cancel',
                    onApply(){
                      c.t.value = currentSelection;
                      c.onDataChange();
                  }
                });
            });
        }
  }
});


//
// ObjectSelectionComponent
//

function getAppSheets(app) {
  return app.getList('sheet').then(data => (
    data.layout.qAppObjectList.qItems.reduce((obj, item) => {
      obj[item.qInfo.qId] = {
        title: item.qMeta.title,
        subitems: item.qData.cells 
      };
      return obj;
    }, {})
  ));
}

function getMasterObjects(app) {
  return app.getList('masterobject').then(data => (
                  data.layout.qAppObjectList.qItems.reduce((obj, item) => {
                    obj[item.qInfo.qId] = `${item.qData.visualization} "${item.qMeta.title}"`;
                    return obj;
                  }, {})
                  //(data.layout.qMeasureList.qItems)
  ));
}

function getMasterDimensions(app) {
  return app.getList('DimensionList').then(data => (
                data.layout.qDimensionList.qItems.reduce((obj, item) => {
                  obj[item.qInfo.qId] = item.qMeta.title;
                  return obj;
                }, {})
  ));
}

function getMasterMeasures(app) {
  return app.getList('MeasureList').then(data => (
                data.layout.qMeasureList.qItems.reduce((obj, item) => {
                  obj[item.qInfo.qId] = item.qMeta.title;
                  return obj;
                }, {})
                //(data.layout.qMeasureList.qItems)
  ));  
}

function getBookmarks(app) {
  return app.getList('BookmarkList').then(data => (
      data.layout.qBookmarkList.qItems.reduce((obj, item) => {
        obj[item.qInfo.qId] = item.qMeta.title;
        return obj;
      }, {})
  ));
}

function getVariables(app) {
  return app.getList('VariableList').then(data => (
      data.layout.qVariableList.qItems.reduce((obj, item) => {
        obj[item.qInfo.qId] = item.qName;
        return obj;
      }, {})
  ));
}

function enhanceSheetObjectsProps(data, app) {
  let [Sheets, ...rest] = data;

  // Enhance sheets objects with "Title"
  let objectsEnhancements = [];
  for(var sheetid in Sheets) {
    let sheet = Sheets[sheetid];
    objectsEnhancements = objectsEnhancements.concat(
      sheet.subitems.map(obj => {
        return app.getObjectProperties(obj.name).then(
          // Add title
          model => {
            obj.title = (model.properties.title && model.properties.title.qStringExpression && model.properties.title.qStringExpression.qExpr)
              || model.properties.title;
            obj.type = model.properties.visualization || model.properties.qInfo.qType;
          }
        ).catch(
          // ignore any error
          e => console.error(e)
        );
      })
    );
  }

  // Return input "data" only after all objects properties have been set: 
  return Promise.all(objectsEnhancements).then(v => [Sheets, ...rest]);  
}

export const ObjectSelectionComponent = MakePropertySelectComponent({
  luiIcon: 'lui-icon--shapes',
  showSelectionDialog() {
        let c = this; // scope
        const { app } = (c.definition.onInit && c.definition.onInit());
        if(app) {
            Promise.all([
              // Sheets (and Visualizations on each sheet)
              getAppSheets(app),
              // Master visualizations
              getMasterObjects(app),
              // Master dimensions
              getMasterDimensions(app),
              // Master measures
              getMasterMeasures(app),
              // Bookmarks
              getBookmarks(app),
              // Variables
              getVariables(app)
            ]).then(
              // add title to each visualization making async request.
              data => enhanceSheetObjectsProps(data, app)
             ).then(data => {
                let [Sheets, MasterObjects, Dimensions, Measures, Bookmarks, Variables] = data;

                // Model matches visual representation (almost)
                let model = {
                  Sheets,
                  ["Master visualizations"]: MasterObjects,
                  ["Master dimensions"]: Dimensions,
                  ["Master measures"]: Measures,
                  Bookmarks,
                  Variables
                };
                // value formated as: "objectid : objectype"
                let {object, objectType} = getSelectedObject(c.t.value);
                showDialog(
                  <RootPropertyComponent
                      currentSelection={object}
                      properties={model}
                      onSelectItem={(newValue, props) => {
                          object = newValue;
                          objectType = props.objectType;
                      }}>
                      <PropertyComponent
                        name="Sheets"
                        onGetName={function(props){
                          if(props.name)
                            return props.name;
                          else
                            return props;
                        }}
                        onGetValue={function(props){
                          // for Sheets
                          if(props.properties && props.properties.title) 
                            return props.properties && props.properties.title;
                          // for Objects
                          else if(props.type) {
                            return `${props.type} "${props.title}"`;
                          }
                        }}
                        icon="lui-icon--sheet"
                        onGetIcon={function(props){
                          // override icon for visualuzations only... 
                          // if undefined/null returned "icon" property is used. 
                          if(props.level === 3) {
                            // props.value - see onGetValue above.
                            let parts = props.value && props.value.split('"', 1);
                            return (parts && parts.length && getIconName(parts[0].trim())) || null;                            
                          }
                        }}
                        level={1}
                        properties={model.Sheets}
                        onGetSubItems={function(props){
                          //console.log(this, props, props.properties);
                          // subitems - see app.getList('sheet') at the top ...
                          if(props.properties && props.properties.subitems) {
                            return props.properties.subitems;
                          }
                          else if(props.properties)
                            return Object.keys(props.properties);
                          else
                            return [];
                        }}
                        onGetMetaData={function(props){
                            let type;

                            if (props.level == 2)
                              type = 'sheet';
                            else
                            if(props.level == 3) 
                              type = 'visualization'; 

                            // objectType property used in onSelectItem on RootPropertyComponent to distinguish between different item types.
                            props.objectType = type;
                        }}
                        isExcludeFromSelection = {true}                        
                        isGetLastSelectedItem={true}
                        isHideType={true}                        
                        />
                      <PropertyComponent
                        name="Master dimensions"
                        icon="lui-icon--box"
                        level={1}
                        properties={model["Master dimensions"]}
                        isExcludeFromSelection = {true}
                        isGetLastSelectedItem={true}
                        isHideType={true}
                        onGetMetaData={function(props){
                            // objectType property used in onSelectItem on RootPropertyComponent to distinguish between different item types.
                            if (props.level == 2)
                              props.objectType = 'dimension';
                        }}
                        />
                      <PropertyComponent
                        name="Master measures"
                        icon="lui-icon--expression"
                        level={1}
                        properties={model["Master measures"]}
                        isExcludeFromSelection = {true}
                        isGetLastSelectedItem={true}
                        isHideType={true}
                        onGetMetaData={function(props){
                            // objectType property used in onSelectItem on RootPropertyComponent to distinguish between different item types.
                            if (props.level == 2)
                              props.objectType = 'measure';
                        }}
                        />
                      <PropertyComponent
                        name="Master visualizations"
                        icon="lui-icon--object"
                        onGetIcon={function(props){
                          // override icon for visualuzations only... 
                          // if undefined/null returned "icon" property is used. 
                          // see app.getList('masterobject'). at the top.
                          if(props.level === 2) {
                            // value has template: 'type "title"' 
                            let parts = props.value.split('"', 1);
                            return (parts.length && getIconName(parts[0].trim())) || null;
                          }
                        }}
                        level={1}
                        properties={model["Master visualizations"]}
                        isExcludeFromSelection = {true}
                        isGetLastSelectedItem={true}
                        isHideType={true}
                        onGetMetaData={function(props){
                            // objectType property used in onSelectItem on RootPropertyComponent to distinguish between different item types.
                            if (props.level == 2)
                              props.objectType = 'visualization';
                        }}
                        />
                      <PropertyComponent
                        name="Bookmarks"
                        icon="lui-icon--bookmark"
                        level={1}
                        properties={model["Bookmarks"]}
                        isExcludeFromSelection = {true}
                        isGetLastSelectedItem={true}
                        isHideType={true}
                        onGetMetaData={function(props){
                            // objectType property used in onSelectItem on RootPropertyComponent to distinguish between different item types.
                            if (props.level == 2)
                              props.objectType = 'bookmark';
                        }}
                        />
                      <PropertyComponent
                        name="Variables"
                        icon="data-icon=variables"
                        level={1}
                        properties={model["Variables"]}
                        isExcludeFromSelection = {true}
                        isGetLastSelectedItem={true}
                        isHideType={true}
                        onGetMetaData={function(props){
                            // objectType property used in onSelectItem on RootPropertyComponent to distinguish between different item types.
                            if (props.level == 2)
                              props.objectType = 'variable';
                        }}
                        />                        
                  </RootPropertyComponent>
                  ,
                  {
                    DialogTitle: `${object}`,
                    LabelOK: 'OK',
                    LabelCancel: 'Cancel',
                    onApply(){
                      // object, objectType. see onSelectItem.
                      c.t.value = `${object} : ${objectType}`;
                      c.onDataChange();
                  }
                });
            });
        }
  }
});
