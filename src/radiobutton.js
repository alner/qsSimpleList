import Renderers from './renderers.js';

export default class RadioButtonComponent extends React.Component {
		render() {
			var data = this.props.data;
			var text = this.props.text;
			var renderAs = this.props.renderAs;
			var itemsLayout = this.props.itemsLayout;
			var isSelectedItem = this.props.isSelected;
			var className = (isSelectedItem ? "qui-button-selected qirby-button-selected "  : "qui-button qirby-button");

			var itemStyle;
			if(itemsLayout === "h") {
			  itemStyle = {
			    "float": "left"
			  };
			}
			else {
				itemStyle = {};
			}

			return <div style={itemStyle}><input type="radio" data-value={data} className={className} checked={isSelectedItem}></input>{text}</div>;
		}
};

Renderers.items.register("radiobutton", RadioButtonComponent);
