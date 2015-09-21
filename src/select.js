import Renderers from './renderers';

export default class SelectComponent extends React.Component {
    render() {
      // todo multiple support
      // value={this.props.selectedValues}
      var style = {
        width: "100%"
      };
      return (<select onChange={this.props.changeHandler} className={'qui-select qirby-select'} style={style}>{this.props.children}</select>);
    }
};

class OptionComponent extends React.Component {
    render() {
      var data = this.props.data;
      var text = this.props.text;
      var isSelected = this.props.isSelected;
      // selected={isSelected}
      // data-value={data}
      return (<option value={data} data-value={data} selected={isSelected}>{text}</option>);
    }
};

Renderers.items.register('select', OptionComponent);
Renderers.containers.register('select', SelectComponent);
