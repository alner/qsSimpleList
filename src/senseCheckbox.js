import Renderers from './renderers';

var refCounter = 0;

export default class SenseCheckBoxComponent extends React.Component {
    static getScopeId() {
        return 'sc' + refCounter;
      }

    static incrementScopeId() {
      ++refCounter;
    }

    static css(backgroundColor) {
      return {__html: '#' + SenseCheckBoxComponent.getScopeId() + ' .onoffswitch-inner:before {content: ""; background: '+ backgroundColor +' !important; color: #ffffff; }'};
    }

    componentWillMount() {
      SenseCheckBoxComponent.incrementScopeId();
    }

    render() {
      var data = this.props.data;
      var text = this.props.text;
      var renderAs = this.props.renderAs;
      var itemsLayout = this.props.itemsLayout;
      var isSelected = this.props.isSelected;

      var itemStyle = {margin: "2px", padding: "2px"};
      var floatLeftStyle = {"float":"left"};
      var labelStyle = {"float":"left", "margin": "2px"};
      if(isSelected)
        labelStyle.fontWeight = "bold";

      if(itemsLayout === "h") {
        itemStyle.float = "left";
      }
      else {
        itemStyle.clear = "both";
      }

      var checkStyle = {};
      var inlineStyle = "";
      if(isSelected) {
        checkStyle.backgroundColor = this.props.selectionColor;
        inlineStyle = <style scoped="true" dangerouslySetInnerHTML={SenseCheckBoxComponent.css(this.props.selectionColor)} />;
      }

      if(renderAs === "senseswitch") {
        // Switch
        return (<div style={itemStyle}>
              <div className={"qui-onoffswitch"} style={floatLeftStyle}>
              <label className="onoffswitch-label">
                <input type="checkbox" checked={isSelected} className="onoffswitch-checkbox" />
                <span className="onoffswitch-span">
                  <div id={SenseCheckBoxComponent.getScopeId()}>
                    {inlineStyle}
                    <div className="onoffswitch-inner" data-value={data}></div>
                    <div className="onoffswitch-switch" data-value={data}></div>
                  </div>
                </span>
              </label>
              </div>
              <div className="title" style={labelStyle}>{text}</div>
            </div>);
      } else { // sensecheckbox
        // Checkbox
        return (<div className={"qui-checkboxicon"} style={itemStyle}>
              <input type="checkbox" checked={isSelected} />
              <div className={"check-wrap"}>
                <span data-value={data} className={"check"} style={checkStyle}/>
                <span data-value={data} className={"check-text label"}>{text}</span>
              </div>
            </div>);
      }
    }
};

Renderers.items.register("sensecheckbox", SenseCheckBoxComponent);
Renderers.items.register("senseswitch", SenseCheckBoxComponent);
