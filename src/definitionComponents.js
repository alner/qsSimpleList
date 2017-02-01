import { getRefValue, setRefValue } from './definitionComponents';

const RemoveButtonComponent = {
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


export const PropertySelectionComponent = {
  template:
  `
<div class="pp-component" ng-if="visible">
  <div class="label" ng-if="label" ng-class="{ \'disabled\': readOnly }">
    {{label}}
  </div>
  <div class="lui-input-group" ng-if="!loading">
      <input class="lui-input-group__item  lui-input-group__input  lui-input"/>
      <button class="lui-input-group__item  lui-input-group__button  lui-button">
          <span class="lui-button__icon  lui-icon  lui-icon--expression"></span>
      </button>
      <button class="lui-input-group__item  lui-input-group__button  lui-button">
          <span class="lui-button__icon  lui-icon  lui-icon--expression"></span>
      </button>
  </div>
  <div class="pp-loading-container" ng-if="loading">
    <div class="pp-loader qv-loader"></div>
  </div>
</div>
  `,
  controller:
    ["$scope", function(c){
      function initOptions() {
        c.loading = true;
        c.errorMessage = "";
        c.label = c.definition.label;
        c.value = getRefValue(c.data, c.definition.ref)
        c.visible = true;
        c.loading = false;
      }
      c.onTextChange = function() {
        setRefValue(c.data, c.definition.ref, c.value);
        "function" == typeof c.definition.change && c.definition.change(c.data, c.args.handler);
        c.$emit("saveProperties");
      };
      c.$on("datachanged", function () {
        initOptions();
      });
      initOptions();
    }]
};


export default RemoveButtonComponent;