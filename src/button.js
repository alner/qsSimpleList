import Renderers from './renderers';

export default class ButtonComponent extends React.Component {
    render() {
      var data = this.props.data;
      var text = this.props.text;
      var width = this.props.width;
      //var renderAs = this.props.renderAs;
      var itemsLayout = this.props.itemsLayout;
      var className;
      if(this.props.transparentStyle)
        //className = (this.props.isSelected ? "lui-button--success qui-button-selected"  : "lui-button qui-button transarent-button");
        className = "lui-button qui-button transarent-button";
      else
        className = "lui-button lui-button--toolbar qui-button";

      var cStyle = {};
      var itemStyle;
      if(itemsLayout === "h") {
        // Horizontal buttons
        itemStyle = {
        //"width": "auto",
        "float": "left",
        "borderRadius": "0px",
        "overflow": "hidden"
        };
      } else {
        // Vertical buttons
        itemStyle = {
          "clear": "both",
          "borderRadius": "0px",
          "width": "100%",
          "overflow": "hidden"
        };
      }

      if(this.props.isSelected) {
        className = "lui-button lui-button--success qui-button"; // qirby-button
        itemStyle.backgroundImage = "none";
        itemStyle.backgroundColor = this.props.selectionColor;
        //itemStyle.borderColor = this.props.selectionColor;
      }

      if(width) {
        itemStyle.width = width;
      }

      return (
        <div style={cStyle}>
            <button
              data-value={data}
              className={className}
              style={itemStyle}
              title={text}>
              {text}
            </button>
        </div>
      );
    }
  };

Renderers.items.register("button", ButtonComponent);   // Vertical buttons
