import {h, Component} from 'preact';
import Renderers from './renderers';

export default class SenseRadioButtonComponent extends Component {
    render() {
      var data = this.props.data;
      var text = this.props.text;
      var renderAs = this.props.renderAs;
      var itemsLayout = this.props.itemsLayout;
      var isSelected = this.props.isSelected;

      var itemStyle = {margin: "2px"};
      if(itemsLayout === "h") {
        itemStyle.float = "left";
      }

      var checkStyle = {};
      if(isSelected) {
        checkStyle.background = this.props.selectionColor;
      }

      return (<div className={"qui-radiobutton"} style={itemStyle}>
              <input type="radio" data-value={data} checked={isSelected} />
              <div className={"radio-wrap"}>
                <span data-value={data} className={"radio"} style={checkStyle} />
                <span data-value={data} className={"radio-text"}>{text}</span>
              </div>
          </div>);
    }
};

Renderers.items.register("senseradiobutton", SenseRadioButtonComponent);
