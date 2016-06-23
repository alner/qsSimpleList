import Renderers from './renderers';

export default class SelectComponent extends React.Component {
    // componentDidMount() {
    //   let element = React.findDOMNode(this.refs.select);
    //   if(element) {
    //     $(element).on('touchstart', () => {
    //       $(element).focus();
    //     });
    //   }
    // }

    render() {
      var width = this.props.itemWidth;
      var style = {
        width: "100%"
      };

      let className;
      if(this.props.transparentStyle) {
        className = 'lui-select qui-select touch transparent-select'; // qirby-select
      } else {
        className = 'lui-select lui-select--toolbar qui-select touch'; // qirby-select
      }

      let selectedValue = "";
      if(this.props.selectedValues.length > 0)
        selectedValue = this.props.selectedValues[0];

      if(width) style.width = width;

      return (<select ref="select"
        onChange={this.props.changeHandler}
        onTouchStart={() => {
          // prevent strange behavior on iOS
          // (without it needs two taps, first tap - focus, second - open select)
          const element = React.findDOMNode(this.refs.select);
          if(element) element.focus();
        }}
        value={selectedValue}
        className={className} style={style}>{this.props.children}</select>);
    }
};

class OptionComponent extends React.Component {
    render() {
      var data = this.props.data;
      var text = this.props.text;
      //var isSelected = this.props.isSelected;
      // selected={isSelected} see SelectComponent (value property)
      return (<option value={data} data-value={data}>{text}</option>);
    }
};

Renderers.items.register('select', OptionComponent);
Renderers.containers.register('select', SelectComponent);
