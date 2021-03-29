import {h, Component} from 'preact';
import Renderers from './renderers';
import {alignmentStyles} from './stylesFuncs';

export default class SelectComponent extends Component {
    render() {
      const width = this.props.itemWidth;
      const isChanging = this.props.isChanging;
      const cStyles = {
        width: '100%'
      };
      alignmentStyles(cStyles, this.props.options);

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
      //if(this.props.selectedValues.length > 0)
      if(!isNaN(this.props.lastSelectedValue))
        selectedValue = this.props.lastSelectedValue; //this.props.selectedValues[0];

      if(width) style.width = width;

      return (
        <div style={cStyles}>
          <select 
            //ref={(c) => this._select = c}
            onChange={(e)=> {
              this.props.changeHandler(e, {
                  value: e.target.value,
                  text: e.target.options[e.target.selectedIndex].text
              });
            }}
            // onTouchStart={() => {
            //   // prevent strange behavior on iOS
            //   // (without it needs two taps, first tap - focus, second - open select)
            //   const element = this._select;
            //   if(element) element.focus();
            // }}
            value={selectedValue}
            className={className} style={style}>
              {this.props.children}
          </select>
        </div>
      );
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
