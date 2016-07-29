import {h, Component} from 'preact';
import Renderers from './renderers';

export default class SelectComponent extends Component {
    render() {
      const width = this.props.itemWidth;
      const isChanging = this.props.isChanging;
      let style = {
        width: "100%"
      };
      if(isChanging) {
        style.visibility = 'hidden';
      }

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

      return (
        <select ref={(c) => this._select = c}
        onChange={this.props.changeHandler}
        onTouchStart={() => {
          // prevent strange behavior on iOS
          // (without it needs two taps, first tap - focus, second - open select)
          const element = this._select;
          if(element) element.focus();
        }}
        value={selectedValue}
        className={className} style={style}>{this.props.children}</select>);
    }
};

class OptionComponent extends Component {
    render() {
      const data = this.props.data;
      const text = this.props.text;
      const isSelected = this.props.isSelected;
      // selected={isSelected} see SelectComponent (value property)
      return (<option value={data} data-value={data} selected={isSelected}>{text}</option>);
    }
};

Renderers.items.register('select', OptionComponent);
Renderers.containers.register('select', SelectComponent);
