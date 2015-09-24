let RemoveButtonComponent = {
  template:
    `
    <div class="pp-component" ng-if="visible">
          <div class="label" ng-if="label" ng-class="{ \'disabled\': readOnly }">
            {{label}}
          </div>
          <div class="value">
            <div ng-if="!loading">
              <button class="qui-outlinebutton pp-remove-property" qva-activate="remove()">
                <div q-translation="Common.Delete"></div>
                <div class="icon-bin remove-icon" q-title-translation="Common.Delete"></div>
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

export default RemoveButtonComponent;
