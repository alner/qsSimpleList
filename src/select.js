import Renderers from './renderers';

export default class SelectComponent extends React.Component {
    render() {
      var width = this.props.itemWidth;
      var style = {
        width: "100%"
      };

      let className;
      if(this.props.transparentStyle) {
        className = 'qui-select transparent-select'; // qirby-select
      } else {
        className = 'qui-select'; // qirby-select
      }

      let selectedValue = "";
      if(this.props.selectedValues.length > 0)
        selectedValue = this.props.selectedValues[0];

      if(width) style.width = width;
      return (<select onChange={this.props.changeHandler} value={selectedValue} className={className} style={style}>{this.props.children}</select>);
    }
};

class OptionComponent extends React.Component {
    render() {
      var data = this.props.data;
      var text = this.props.text;
      var isSelected = this.props.isSelected;
      // selected={isSelected} see SelectComponent (value property)
      return (<option value={data} data-value={data}>{text}</option>);
    }
};

Renderers.items.register('select', OptionComponent);
Renderers.containers.register('select', SelectComponent);
