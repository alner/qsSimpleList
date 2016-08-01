import {h, Component} from 'preact';
import Renderers from './renderers';

export default class CheckBoxComponent extends Component {
    render() {
      var data = this.props.data;
      var text = this.props.text;
      var renderAs = this.props.renderAs;
      var itemsLayout = this.props.itemsLayout;
      var isSelected = this.props.isSelected;
      var className = (isSelected ? "qui-button-selected qirby-button-selected "  : "qui-button qirby-button");

      var itemStyle = {};

      if(itemsLayout === "h") {
        itemStyle.float = "left";
      }

      return (
        <div style={itemStyle}>
          <input type="checkbox" data-value={data} data-text={text} className={className} checked={isSelected}></input>
          {text}
        </div>);
    }
};

Renderers.items.register("checkbox", CheckBoxComponent);
