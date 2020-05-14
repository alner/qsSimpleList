import {h, Component} from 'preact';
import Renderers from './renderers';

var refCounter = 0;

export default class SenseCheckBoxComponent extends Component {
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

      var itemStyle = {margin: "2px", display: 'block'}; // margin: "2px",
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
        /*
        <div style={itemStyle}>
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
        </div>
        */
        return (
          <div style={itemStyle}>
            <div className="lui-switch" style={floatLeftStyle}>
              <label className="lui-switch__label">
                <input type="checkbox" className="lui-switch__checkbox" checked={isSelected} />
                <span className="lui-switch__wrap">
                  <div className="lui-switch__inner" data-value={data} data-text={text}></div>
                  <div className="lui-switch__switch" data-value={data} data-text={text}></div>
                </span>
              </label>
            </div>
            <div className="switch-title" style={labelStyle}>{text}</div>
          </div>
          );
      } else { // sensecheckbox
        // Checkbox
        let selectableClasses = ['lui-checkbox__check', 'check'];
        if(isSelected)
          selectableClasses.push('selected');
        else
          selectableClasses.push('selectable')

        return (
          <label className="lui-checkbox qui-checkbox" style={itemStyle}>
            <input className="lui-checkbox__input" type="checkbox" checked={isSelected} />
            <div className="lui-checkbox__check-wrap check-wrap">
              <span data-value={data} data-text={text} draggable="true" className={selectableClasses.join(' ')} style={checkStyle}></span>
              <span data-value={data} data-text={text} className="lui-checkbox__check-text check-text">{text}</span>
            </div>
          </label>);
      }
    }
};

Renderers.items.register("sensecheckbox", SenseCheckBoxComponent);
Renderers.items.register("senseswitch", SenseCheckBoxComponent);
