import {
  RemoveButtonComponent, PropertySelectionComponent, ObjectSelectionComponent,
  APPLYPATCH_ACTION_TYPE, FIELDAPI_ACTION_TYPE
} from './definitionComponents';

export const BUTTON_RENDER = 'button';
export const CHECKBOX_RENDER = 'sensecheckbox';
export const SWITCH_RENDER = 'senseswitch';
export const SELECT_RENDER = 'select';
export const RADIOBUTTON_RENDERER = 'senseradiobutton';
//export const POPUP_RENDER = 'popup';

const ApplyPatchMethods = [
  {
    value: "add",
    label: "Add"
  },
  {
    value: "replace",
    label: "Replace"
  },
  {
    value: "remove",
    label: "Remove"
  }
];

const FieldAPIMethods = [{
  value: "Clear",
  label: "Clear",
},
{
  value: "ClearAllButThis",
  label: "ClearAllButThis",
},
{
  value: "Lock",
  label: "Lock",
},
{
  value: "Unlock",
  label: "Unlock",
},
{
  value: "SelectAll",
  label: "SelectAll",
},
{
  value: "SelectAlternative",
  label: "SelectAlternative",
},
{
  value: "SelectPossible",
  label: "SelectPossible",
},
{
  value: "SelectExcluded",
  label: "SelectExcluded",
},
{
  value: "Select",
  label: "Select",
},
{
  value: "SelectValues",
  label: "SelectValues",
},
{
  value: "LowLevelSelect",
  label: "LowLevelSelect",
},
{
  value: "ToggleSelect",
  label: "ToggleSelect",
},
{
  value: "SetAndMode",
  label: "SetAndMode",
},
{
  value: "SetNxProperties",
  label: "SetNxProperties",
},
];

// See Field API methods using engine explorer
const FieldAPIParams = {
  Clear:'', // no parameters
  ClearAllButThis: `{
		"qSoftLock": false
	}`,
  Lock: '',
  Unlock: '',
  SelectAll: `{
    "qSoftLock": false
  }`,
  SelectAlternative: `{
    "qSoftLock": false
  }`,
  SelectPossible: `{
    "qSoftLock": false
  }`,
  SelectExcluded: `{
    "qSoftLock": false
  }`,
  Select: `{
		"qMatch": "",
		"qSoftLock": false,
		"qExcludedValuesMode": 0
	}`,
  SelectValues: `{
		"qFieldValues": [
			{
				"qText": "",
				"qIsNumeric": false,
				"qNumber": 0
			}
		],
		"qToggleMode": false,
		"qSoftLock": false
	}`,
  LowLevelSelect: `{
		"qValues": [
			0
		],
		"qToggleMode": false,
		"qSoftLock": false
	}`,
  ToggleSelect: `{
		"qMatch": "",
		"qSoftLock": false,
		"qExcludedValuesMode": 0
	}`,
  SetAndMode: `{
		"qAndMode": false
	}`,
  SetNxProperties: `{
		"qProperties": {
			"qOneAndOnlyOne": false
		}
	}`
};

export default function setupDefinition({ Qlik, setAlwaysOneSelectedValue }) {

  let currentEditedAction;

  const actions = {
      type: "items",
      label: "Actions",
      translation: "Storytelling.play.actions",
      items: {
          actions: {
              type: "array",
              ref: "actions",
              label: "Actions",
              itemTitleRef: "object", 
              // function(data, index, handler){
              //   var objectItem = _.find(configScope.masterObjectList, function(item) {
              //       return item.qInfo.qId === data.object;
              //   });

              //   return (objectItem && objectItem.qMeta.title) || data.object;
              // },
              allowAdd: true,
              allowRemove: true,
              addTranslation: "Common.Create",
              items: {
                actions: {
                  ref: "action",
                  label: "Action",
                  translation: "Storytelling.play.actions",
                  type: "string",
                  component: "dropdown",
                  options: [{
                    value: APPLYPATCH_ACTION_TYPE,
                    label: "Apply patch"
                  },
                  {
                    value: FIELDAPI_ACTION_TYPE,
                    label: "Field API"
                  }
                  ],
                  change: function(data) {
                    currentEditedAction = data.action;
                  }
                },                
                object: {
                  ref: "object",
                  label: "Object",
                  translation: "Common.CustomObjects",
                  type: "string",
                  component: ObjectSelectionComponent,
                  onInit: (data) => ({
                      app: Qlik.currApp()
                  }),
                  // change: function(propertyData, classObject, objectType) {
                  //   // objectType from ObjectSelectionComponent is a selected object type.
                  //   // See ObjectSelectionComponent component.
                  //   console.log('change', propertyData, arguments);
                  //   propertyData.objectType = objectType;
                  // }
                },
                patchOperation: {
                  ref: "patchOperation",
                  label: "Operation",
                  translation: "DataManager.ExpressionEditor.Operations",
                  component: "dropdown",
                  options: function (data) {
                    if(data.action && (typeof currentEditedAction == "undefined" || currentEditedAction != data.action))
                      currentEditedAction = data.action;

                    let action = currentEditedAction;

                    switch (action) {
                      case APPLYPATCH_ACTION_TYPE:
                          return ApplyPatchMethods;
                      
                      case FIELDAPI_ACTION_TYPE:
                        return FieldAPIMethods;

                      default: 
                        return [];
                    }
                  },
                  defaultValue: "",
                  change: function(data) {
                    if(data.action === FIELDAPI_ACTION_TYPE) {
                      let params = FieldAPIParams[data.patchOperation];
                      if(typeof params != undefined)  
                        data.patchValue = params;
                    }
                  }
                },
                patchPath: {
                  ref: "patchPath",
                  label: "Patch path",
                  translation: "Common.Custom",
                  component: PropertySelectionComponent,
                  onInit: function(){
                    return {
                      app: Qlik.currApp()
                    };
                  },
                  type: "string",
                  show: function(data) {
                    return data.action == APPLYPATCH_ACTION_TYPE;
                  }
                },
                customValue: {
                  ref: "isCustomValue",
                  type: "boolean",
                  label: "Supply value",
                  translation: "properties.value",
                  defaultValue: false,
                  show: function(data) {
                    return data.action == APPLYPATCH_ACTION_TYPE;
                  }
                },
                patchValue: {
                  ref: "patchValue",
                  label: "Value",
                  translation: "properties.value",
                  type: "string",
                  expression: "optional",
                  show: function(data) {
                    return data.isCustomValue || data.action == FIELDAPI_ACTION_TYPE;
                  }
                }
            }
        }
      }
  };

  let dimensions = {
    type : "items",
    translation : "Common.Dimension",
    ref : "qListObjectDef",
    min: 1,
    max: 1,
    allowAdd : true,
    allowRemove : true,
    items: {
      cId : {
        ref : "qListObjectDef.qDef.cId",
        type : "dimension",
        show : false
      },
      libraryId : {
        type : "string",
        component : "library-item",
        libraryItemType : "dimension",
        ref : "qListObjectDef.qLibraryId",
        label : "Dimension",
        translation : "Common.Dimension",
        show : function(data) {
          return data.qListObjectDef && data.qListObjectDef.qLibraryId;
        }
      },
      labelTxt : {
        type : "string",
        ref : "qListObjectDef.qDef.qFieldLabels.0",
        label : "Label",
        translation : "Common.Label",
        show : function(data) {
          return data.qListObjectDef.qDef.qFieldLabels.length > 0 && data.qListObjectDef.qDef.qFieldLabels[0];
        }
      },      
      label : {
        type : "string",
        ref : "qListObjectDef.qDef.qLabelExpression",
        label : "Label",
        component : "expression",
        expression: "optional",
        translation : "Common.Label",
        show : function(data) {
          return data.qListObjectDef.qDef.qFieldLabels.length == 0 || !data.qListObjectDef.qDef.qFieldLabels[0];
        }
      },      
      field : {
        type : "string",
        component : "expression",
        expression : "always",
        expressionType : "dimension",
        ref : "qListObjectDef.qDef.qFieldDefs.0",
        //label : "Field",
        translation : "Common.Field",
        show : function (a) {
          return !a.qListObjectDef.qLibraryId
        },
        // change : function (a) {
        //   var b = a.qListObjectDef.qDef;
        //   b.qFieldLabels || (b.qFieldLabels = []),
        //   b.qFieldLabels[0] = b.qFieldDefs[0]
        // }
      },
      expression : {
        type : "string",
        //expression : "always",
        component : "expression",
        expressionType : "measure",
        //expressionType : "dimension",
        ref : "qListObjectDef.qExpressions.0.qExpr", 
        translation : "Common.Measure",
      },
      clearDimension : {
        type : "boolean",
        component : RemoveButtonComponent,
        ref: "clearDimension",
        show : function (a) {
          return a.qListObjectDef.qLibraryId || a.qListObjectDef.qDef.qFieldDefs[0];
        },
        remove: function(a){
          delete a.qListObjectDef.qLibraryId;
          a.qListObjectDef.qDef.qFieldDefs[0] = "";
          a.qListObjectDef.qDef.qFieldLabels[0] = "";
          a.clearDimension = false;
        }
      },
      showFirstN: {
        type: "boolean",
        translation : "properties.dimensionLimits.limitation",
        ref: "showFirstN",
        defaultValue: false,
      },
      firstN: {
        type: "number",
        translation : "properties.dimensionLimits.fixedNumber",
        ref: "firstN",
        defaultValue: 0,
        show: function(data) {
          return data.showFirstN;
        }
      }
    }
  };

  let sorting = {
    translation : "properties.sorting",
    type : "items",
    ref : "qListObjectDef",
    items: {
      qSortByLoadOrder:{
        type: "numeric",
        component : "dropdown",
        label : "Sort by Load Order",
        ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByLoadOrder",
        options : [{
          value : 1,
          label : "Ascending"
        }, {
          value : 0,
          label : "No"
        }, {
          value : -1,
          label : "Descending"
        }],
        defaultValue : 0,

      },
      qSortByState:{
        type: "numeric",
        component : "dropdown",
        label : "Sort by State",
        ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByState",
        options : [{
          value : 1,
          label : "Ascending"
        }, {
          value : 0,
          label : "No"
        }, {
          value : -1,
          label : "Descending"
        }],
        defaultValue : 0,

      },
      qSortByFrequency:{
        type: "numeric",
        component : "dropdown",
        //label : "Sort by Frequence",
        translation : "properties.sorting.sortByFrequency",
        ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByFrequency",
        options : [{
          value : -1,
          label : "Ascending"
        }, {
          value : 0,
          label : "No"
        }, {
          value : 1,
          label : "Descending"
        }],
        defaultValue : 0,

      },
      qSortByNumeric:{
        type: "numeric",
        component : "dropdown",
        //label : "Sort by Numeric",
        translation : "properties.sorting.sortByNumeric",
        ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByNumeric",
        options : [{
          value : 1,
          label : "Ascending"
        }, {
          value : 0,
          label : "No"
        }, {
          value : -1,
          label : "Descending"
        }],
        defaultValue : 0,

      },
      qSortByAscii:{
        type: "numeric",
        component : "dropdown",
        //label : "Sort by Alphabetical",
        translation : "properties.sorting.sortByAlphabetic",
        ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByAscii",
        options : [{
          value : 1,
          label : "Ascending"
        }, {
          value : 0,
          label : "No"
        }, {
          value : -1,
          label : "Descending"
        }],
        defaultValue : 0,
      },
      qSortByExpression:{
        type: "numeric",
        component : "dropdown",
        //label : "Sort by Expression",
        translation : "properties.sorting.sortByExpression",
        ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByExpression",
        options : [{
          value : 1,
          label : "Ascending"
        }, {
          value : 0,
          label : "No"
        }, {
          value : -1,
          label : "Descending"
        }],
        defaultValue : 0,
      },
      qExpression: {
        type : "string",
        expression : "always",
        expressionType : "expression",
        ref : "qListObjectDef.qDef.qSortCriterias.0.qExpression.qv",
        //label : "Sort Expression",
        translation : "Common.Expression",
        show : function(data) {
          return data.qListObjectDef
          && data.qListObjectDef.qDef
          && data.qListObjectDef.qDef.qSortCriterias.length > 0
          && data.qListObjectDef.qDef.qSortCriterias[0].qSortByExpression
          && data.qListObjectDef.qDef.qSortCriterias[0].qSortByExpression !== 0;
        }
      }
    }
  };

  let settings = {
    type: "items",
    uses: "settings",
    items: {
      additionalOptions: {
        type: "items",
        label: "Options",
        translation: "properties.presentation",
        items: {
          render : {
            type : "string",
            component : "dropdown",
            label : "Render as",
            ref : "renderAs",
            options : [{
              value : BUTTON_RENDER,
              label : "Buttons"
            },
            /*
            {
              value : "radiobutton",
              label : "Radio buttons"
            },
            {
              value : "checkbox",
              label : "Checkboxes"
            },
            */
            {
              value : CHECKBOX_RENDER,
              label : "Check boxes"
            },
            {
              value : SWITCH_RENDER,
              label : "Switch"
            },
            {
              value : SELECT_RENDER,
              label : "Select"
            },
            {
              value : RADIOBUTTON_RENDERER,
              label : "Radio buttons"
            },
            // {
            //   value : "multiselect",
            //   label : "Multi select"
            // }
            ],
            defaultValue : BUTTON_RENDER,
            change: function(data, classobject) {
              if(data.renderAs == RADIOBUTTON_RENDERER) {
                classobject.properties.alwaysOneSelected = true;
              }
            },
          },
          showState: {
            type: "boolean",
            label: "Show state",
            ref: "showState",
            show: function(data){
              return (data.renderAs === 'button');
            },
            defaultValue: false
          },
          alwaysOneSelectedValue:{
            type: "boolean",
            label: "Always one selected value",
            ref: "alwaysOneSelected",
            defaultValue: false,
            // show: function(data){
            //   return data.renderAs !== 'select';
            // },
            change: function(data) {
              if(data.qListObjectDef.qDef.qFieldDefs.length > 0)
                setAlwaysOneSelectedValue(data.qListObjectDef.qDef.qFieldDefs[0], data.alwaysOneSelected);
            }
          },
          lockSelection: {
            type: "boolean",
            label: "Lock selection",
            ref: "lockSelection",
            defaultValue: false
          },
          itemsLayout : {
            ref : "itemsLayout",
            type : "string",
            translation : "properties.orientation",
            component : "buttongroup",
            defaultValue : "v",
            horizontal : true,
            options : [
              {
                label: "vertical",
                translation : "properties.orientation.vertical",
                value : "v"
              },
              {
                label: "horizontal",
                translation : "Common.Horizontal",
                value : "h"
              }
            ],
            show: function(data){
              return !(data.renderAs === 'select' || data.renderAs === 'multiselect');
            }
          },
          hideLabel:{
            type: "boolean",
            label: "Hide label",
            ref: "hideLabel",
            defaultValue: false,
          },
          hideExcluded:{
            type: "boolean",
            label: "Hide excluded",
            ref: "hideExcluded",
            defaultValue: false,
          },
          transparent: {
            type: "boolean",
            label: "Transparent style",
            ref: "transparentStyle",
            defaultValue: false,
          },
          compactMode: {
            type: "boolean",
            label: "Compact mode",
            ref: "compactMode",
            defaultValue: false,
            show: function(data){
              return !(data.renderAs === 'select');
            }
          },
          toggleMode: {
            type: "boolean",
            label: "Toggle mode",
            ref: "toggleMode",
            defaultValue: false,
            show: function(data){
              return !(data.renderAs === 'select');
            }
          },
          responsiveMode: {
            type: "boolean",
            label: "Responsive mode",
            ref: "responsiveMode",
            defaultValue: false,
            show: function(data){
              return (data.renderAs === 'button');
            }
          },
          hideCondition: {
            ref: "hideCondition",
            type: "integer",
            label: "Hide condition",
            defaultValue: '',
            expression: "always",
          },
          /*
          itemsLayout: {
            type: "string",
            label: "Layout",
            ref: "itemsLayout",
            component: "radiobuttons",
            defaultValue: "v",
            options: [{
              value: "v",
              label: "Vertical"
            }, {
              value: "h",
              label: "Horizontal"
            }],
            show: function(data){
              return !(data.renderAs === 'select' || data.renderAs === 'multiselect');
            }
          },
          */
          /*
          selectionColor : {
            ref : "selectionColor",
            translation : "Selection color",
            type : "integer",
            component : "color-picker",
            defaultValue : 6
          }
          */
        }
      }
    }
  };

/*
  let addons = {
    type: "items",
    component: "expandable-items",
    translation: "properties.addons",
    items: {
      variable: {
        type: "string",
        label: "Variable",
        translation: "Common.Variable",
        ref: "variable",
        show: function(data) {
          return data.renderAs == 'select' || data.alwaysOneSelected;
        }
      }
    }
  };
*/

  return {
    type: "items",
    component: "accordion",
    items: {
      dimensions,
      sorting,
      actions,
//      addons,
      settings
    }
  }
}
