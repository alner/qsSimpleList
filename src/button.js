import {h, Component} from 'preact';
import Renderers from './renderers';

export default class ButtonComponent extends Component {
    render() {
      const {
        data,
        text,
        state,
        width } = this.props;

      //var renderAs = this.props.renderAs;
      let itemsLayout = this.props.itemsLayout;
      let classNames = ['lui-button', 'qui-button'];
      //let className;
      if(this.props.transparentStyle)
        //className = (this.props.isSelected ? "lui-button--success qui-button-selected"  : "lui-button qui-button transarent-button");
        //className = "lui-button qui-button transarent-button";
        classNames.push('transarent-button');
      else
        //className = "lui-button lui-button--toolbar qui-button";
        classNames.push('lui-button--toolbar');

      //let cStyle = {};
      // <div className={cStyle}>
      if(itemsLayout === "h") {
        classNames.push('btns--horizontal');
        // Horizontal buttons
        // itemStyle = {
        // //"width": "auto",
        // "float": "left",
        // "borderRadius": "0px",
        // "overflow": "hidden"
        // };
      } else {
        classNames.push('btns--vertical');
        // Vertical buttons
        // itemStyle = {
        //   "clear": "both",
        //   "borderRadius": "0px",
        //   "width": "100%",
        //   "overflow": "hidden"
        // };
      }
      //console.log(state);
      switch(state) {
        case 'X':
        case 'XS':
        case 'XL':
          classNames.push('excluded');
          break;
        case 'A':
          classNames.push('alternative');
          break;
      }

      let itemStyle = {};
      if(this.props.isSelected) {
        //className = "lui-button lui-button--success qui-button"; // qirby-button
        classNames.push('lui-button--success');
        itemStyle.backgroundImage = "none";
        itemStyle.backgroundColor = this.props.selectionColor;
        //itemStyle.borderColor = this.props.selectionColor;
      }

      if(width) {
        itemStyle.width = width;
      }

      return (
            <button
              data-value={data}
              className={classNames.join(' ')}
              style={itemStyle}
              title={text}>
              {text}
            </button>
      );
    }
  };

Renderers.items.register("button", ButtonComponent);   // Vertical buttons
