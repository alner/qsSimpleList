import RemoveButtonComponent from './definitionComponents';

export const BUTTON_RENDER = 'button';
export const CHECKBOX_RENDER = 'sensecheckbox';
export const SWITCH_RENDER = 'senseswitch';
export const SELECT_RENDER = 'select';
//export const POPUP_RENDER = 'popup';

export default function setupDefinition({ setAlwaysOneSelectedValue }) {

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
      label : {
        type : "string",
        ref : "qListObjectDef.qDef.qFieldLabels.0",
        label : "Label",
        translation : "Common.Label",
        show : true
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
        change : function (a) {
          var b = a.qListObjectDef.qDef;
          b.qFieldLabels || (b.qFieldLabels = []),
          b.qFieldLabels[0] = b.qFieldDefs[0]
        }
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
        // options : [{
        //     value : null,
        //     translation : "Common.Delete"
        //   }
        // ],
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
            // {
            //   value : "senseradiobutton",
            //   label : "Sense radio buttons"
            // },
            {
              value : SELECT_RENDER,
              label : "Select"
            },
            // {
            //   value : "multiselect",
            //   label : "Multi select"
            // }
            ],
            defaultValue : BUTTON_RENDER
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

  return {
    type: "items",
    component: "accordion",
    items: {
      dimensions,
      sorting,
      addons,
      settings
    }
  }
}
