import {h, Component} from 'preact';
import Renderers from './renderers';
import {selectionEvents} from './selectionEvents';
import {alignmentStyles} from './stylesFuncs';

export default class ButtonComponent extends Component {
    render() {
      const {
        data,
        text,
        state,
        width,
        showState } = this.props;

      //var renderAs = this.props.renderAs;
      let itemsLayout = this.props.itemsLayout;
      let classNames = ['lui-button', 'qui-button', 'selectable'];
      //let className;
      if(this.props.transparentStyle)
        //className = (this.props.isSelected ? "lui-button--success qui-button-selected"  : "lui-button qui-button transarent-button");
        //className = "lui-button qui-button transarent-button";
        classNames.push('transparent-button');
      else
        //className = "lui-button lui-button--toolbar qui-button";
        classNames.push('lui-button--toolbar');

      if(itemsLayout === "h") {
        classNames.push('btns--horizontal');
      } else {
        classNames.push('btns--vertical');
      }

      if(showState)
      switch(state) {
        case 'X':
        case 'XS':
        case 'XL':
          classNames.push('excluded');
          break;
        case 'A':
          classNames.push('alternative');
          break;
        //default:
          //break;
      }

      let itemStyle = {};
      if(this.props.isSelected) {
        //className = "lui-button lui-button--success qui-button"; // qirby-button
        //classNames.push('lui-button--success');
        classNames.push('selected');
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
          data-text={text}
          draggable="true" // selecion events support
          className={classNames.join(' ')}
          style={itemStyle}
          title={text}>
          {text}
        </button>
      );
    }
  };

export class ButtonGroupComponent extends Component {
  constructor(props) {
    super(props);
    this.eventsInjector = selectionEvents.bind(this, this.props);
  }
  render(props) {
    // const width = this.props.containerWidth;
    const { titleWidth, /*isChanging,*/ isScroll, isPopup, isHidden } = this.props;
    const paddingLeft = isPopup || isScroll ? 47 : 0;
    let shift = paddingLeft;
    if(titleWidth)
        shift += titleWidth;

    let style = {
      width: `calc(100% - ${shift}px)`,
      position: 'relative',
      //position: isPopup ? 'fixed' : 'relative',
    };
    if(isHidden) { // isChanging ||
      style.visibility = 'hidden';
    }
    if(isPopup || isScroll) {
      style.paddingLeft = `${paddingLeft}px`;
    }

    alignmentStyles(style, this.props.options);

    // if(width) {
    //   style.width = width;
    // }
    return (
      <div
        class="lui-buttongroup qui-buttongroup"
        style={style}
        {...this.eventsInjector()}
      >
        {props.children}
      </div>
    );
  }
}


Renderers.containers.register('button', ButtonGroupComponent);
Renderers.items.register('button', ButtonComponent);
