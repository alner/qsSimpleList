import {h, Component} from 'preact';
import Renderers from './renderers';

export default class SenseRadioButtonComponent extends Component {
    render() {
      var data = this.props.data;
      var text = this.props.text;
      var renderAs = this.props.renderAs;
      var itemsLayout = this.props.itemsLayout;
      var isSelected = this.props.isSelected;
      var centerHorizontal = this.props.centerHorizontal;

      var itemStyle = {margin: "2px"};
      if(centerHorizontal && itemsLayout === "h") {
        itemStyle.display = 'inline-block';
      } else
      if(itemsLayout === "h") {
        itemStyle.float = "left";
      } else
      if(centerHorizontal && itemsLayout === 'v') {
        itemStyle.display = 'block';
      }

      var checkStyle = {};
      if(isSelected) {
        checkStyle.background = this.props.selectionColor;
      }

      return (
        <div className="lui-radiobutton" style={itemStyle}>
              <input className="lui-radiobutton__input" type="radio" data-value={data} checked={isSelected} />
              <div className="lui-radiobutton__radio-wrap">
                <span data-value={data} data-text={text} className="lui-radiobutton__radio" style={checkStyle} />
                <span data-value={data} data-text={text} className="lui-radiobutton__radio-text">{text}</span>
              </div>
        </div>
      );
    }
};

Renderers.items.register("senseradiobutton", SenseRadioButtonComponent);
