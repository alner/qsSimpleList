//import React from 'react';
import {h, Component} from 'preact';
//import Qlik from 'js/qlik';
//import _ from 'underscore';
import isEqual from 'lodash.isEqual';
import values from 'lodash.values';
import Renderers from './renderers';
import ButtonComponent from './button';
//import CheckBoxComponent from './checkbox';
//import RadioButtonComponent from './radiobutton';
import SelectComponent from './select';
import SenseCheckBoxComponent from './senseCheckbox';
import { BUTTON_RENDER, SELECT_RENDER } from './definition';
//import SenseRadioButtonComponent from './senseRadiobutton';
//"jsx!./multiselect.js"

// Register default renderer
// Renderers.items.registerDefault(<div />);
const CHANGE_TITLE = 'title';
const CHANGE_RENDER = 'render';
const CHANGE_INIT = 'init';

function filterExcluded(hideExcluded, row) {
  const field = row[0];
  return (!hideExcluded ||
    (field.qState != 'X' && field.qState != 'XS' && field.qState != 'XL')
  );
}

class ListComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        qSelected: {},
        qLastSelected: -1,
        //qLastField: '',
        containerWidth: '',
        hideLabel: props.options.hideLabel,
        isChanging: true, //true,
        changeType: CHANGE_INIT,//CHANGE_SIZE,
        renderAs: undefined
      };
      this._title = undefined;
      this._main = undefined;
      this._container = undefined;
    }

    componentDidMount() {
      this.recalcSize();
    }

    componentDidUpdate(){
      this.recalcSize();
    }

    itemsToDraw(items, onItemSelectedCallback) {
      const {
        selectionColor,
        transparentStyle,
        itemsLayout,
        showState
      } = this.props.options;
      const renderAs = this.state.renderAs || this.props.options.renderAs;

      const itemWidth = this.getItemWidth(items.length, itemsLayout);
      const Renderer = Renderers.items.get(renderAs);

      return items.map(function (row) {
        let field = row[0];
        let isSelected = field.qState === 'S' || field.qState === 'L';

        if(isSelected && onItemSelectedCallback)
          onItemSelectedCallback(field);

        return (
        <Renderer
          key={field.qElemNumber}
          data={field.qElemNumber}
          width={itemWidth}
          text={field.qText}
          state={field.qState}
          isSelected={isSelected}
          renderAs={renderAs}
          selectionColor={selectionColor}
          transparentStyle={transparentStyle}
          itemsLayout={itemsLayout}
          showState={showState}
          />);
      });
    }

    render() {
        const {
          itemsLayout,
        } = this.props.options;
        const renderAs = this.state.renderAs || this.props.options.renderAs;

        const Container = Renderers.containers.get(renderAs);
        const items = this.getItems();
        const itemWidth = this.getItemWidth(items.length, itemsLayout);

        let selectedCount = 0;
        let selection = {};
        let components = this.itemsToDraw(items, (field) => {
          ++selectedCount;
          selection[field.qElemNumber] = field.qElemNumber;

          if(this.state.qLastSelected !== field.qElemNumber)
            this.state.qLastSelected = field.qElemNumber;
        });

        if(!isEqual(this.state.qSelected, selection))
          this.state.qSelected = selection;

        if((this.props.options.alwaysOneSelected || renderAs === 'select')
          && items.length > 0 && (selectedCount > 1 || selectedCount == 0)) {
          // select first one if more then one selection exists
          this.selectValues(selectedCount == 0 || this.selectedValuesCount() > 1);
        }

        let titleComponent;
        if(!this.props.options.hideLabel) {
          // if not enought room...
          if(this.state.hideLabel)
            this._title = undefined;
          //   titleComponent = (<span ref={(c) => this._title = c}></span>);
          else
            titleComponent = (
              <div ref={(c) => this._title = c}
                className="title qvt-visualization-title">
                {this.props.options.label}
              </div>
            );
        }

        let containerComponent;
        if(Container)
          containerComponent = (
            <Container ref={(c) => this._container = c }
              //{...self.props.options}
              changeHandler={this.clickHandler.bind(this)}
              selectedValues={this.getSelectedValues()}
              itemWidth={itemWidth}
              containerWidth={this.state.containerWidth}
              titleWidth={this.state.titleWidth}
              selectionColor={this.props.options.selectionColor}
              transparentStyle={this.props.options.transparentStyle}
              isChanging={this.state.isChanging}>
            {components}
            </Container>
          );
        else
          containerComponent = (
            <form ref={(c) => this._container = c }
              onClick={this.clickHandler.bind(this)}
              onTouchStart={this.clickHandler.bind(this)}
              style={{visibility: this.state.isChanging ? 'hidden' : 'visible'}}
            >
            {components}
            </form>
          );

        return (
          <div ref={(c) => this._main = c} className="qv-object-simple-list main"
            style={{height: "100%"}}>
            {titleComponent}
            {containerComponent}
          </div>
        );
    }

    getItems(){
      const {
        data,
        hideExcluded,
        showFirstN,
        firstN
      } = this.props.options;

      let items = data.filter(filterExcluded.bind(null, hideExcluded));

      if(showFirstN)
        items = items.filter((value, index) => {
          return index < firstN;
        });

      return items;
    }

    getItemWidth(itemsCount, itemsLayout) {
      return this.state.containerWidth
        || (itemsLayout === 'h' ? Math.floor(100.0 / itemsCount) + '%' : '100%');
    }

    hideOrShowTitle({ hideLabel, itemWidthValue, itemWidth}) {
      if(this.state.isChanging && this.state.changeType != CHANGE_TITLE)
        return;

      if(hideLabel !== undefined && this.state.hideLabel != hideLabel) {
        if(!this.state.isChanging && this.state.hideLabel != hideLabel)
            this.setState({
              isChanging: true,
              changeType: CHANGE_TITLE
            });
        else
          if(itemWidthValue === this.state.itemWidthValue)
            this.setState({
              hideLabel,
              //isChanging: false
            });
      } else
      if(!this.state.isChanging && hideLabel === undefined &&
        itemWidthValue > this.state.itemWidthValue) {
        this.setState({
          containerWidth: itemWidth,
          itemWidthValue,
          hideLabel: false,
          isChanging: true,
          changeType: CHANGE_TITLE
        });
      } else
      if(this.state.isChanging)
        this.setState({ isChanging: false, changeType: undefined });
    }

    changeSize({ itemWidth, titleWidth, itemWidthValue }) {
      if(this.state.containerWidth !== itemWidth) {
        let oldItemWidthValue = this.state.itemWidthValue;
        this.setState({
          containerWidth: itemWidth,
          titleWidth,
          itemWidthValue,
          isItemWidthGrow: itemWidthValue > oldItemWidthValue ? true : false
          //isChanging: true
          //hideLabel: (!titlePos || (titlePos.top < containerPos.top && ) ? true : false)
        });
      }
    }

    changeRenderType(
      {
      mainWidth, mainHeight,
      containerWidth, containerHeight, containerPos,
      titleWidth, titleHeight, titlePos}
    ) {
        if(this.state.isChanging && this.state.changeType != CHANGE_RENDER)
          return;

        const renderAs = this.props.options.renderAs;
        let totalHeight = containerHeight;
        if(titlePos && containerPos && titlePos.top < containerPos.top) {
          totalHeight += titleHeight;
        }

        if(renderAs == BUTTON_RENDER && this.props.options.alwaysOneSelected) {
            if(totalHeight > mainHeight && !this.state.renderAs) {
              if(!this.state.isChanging) {
                this.setState({ isChanging: true, changeType: CHANGE_RENDER });
              } else
              if(this.state.renderAs != SELECT_RENDER)
                this.setState({ renderAs: SELECT_RENDER, hideLabel: false, itemWidthValue: undefined, isItemWidthGrow: false });
              else
                this.setState({ isChanging: false, changeType: undefined });
            } else
            if(this.state.renderAs && !this.state.isChanging) {
              if(totalHeight <= mainHeight && this.state.isItemWidthGrow) {
                // try to restore original...
                this.setState({ renderAs: undefined, isItemWidthGrow: false, isChanging: true, changeType: CHANGE_RENDER })
              }
            } else if(this.state.isChanging) {
              this.setState({ isChanging: false, changeType: undefined });
            }
        }
    }

    recalcSize(){
      let renderAs = this.state.renderAs || this.props.options.renderAs;
      const main = this._main;
      const main$ = $(main);
      var mainWidth = main$.innerWidth();
      var mainHeight = main$.innerHeight();

      const container =this._container &&
        (this._container.tagName || this._container.base);

      const container$ = $(container);
      var containerPos = container$.offset();
      var containerWidth = container$.width();
      var containerHeight = container$.height();

      const title = this._title;
      const title$ = $(title);
      var titleWidth = title$.width();
      var titleHeight = title$.height();
      var titlePos = title$.offset();

      const itemCount = this.getItems().length;

      if(renderAs === 'select') {
        // select - special case
        if(this.props.options.hideLabel) {
          if(this.state.containerWidth !== '100%')
            this.setState({
              containerWidth: '100%'
            });
        } else {
          var itemWidthValue = mainWidth - titleWidth - 6;
          var itemWidth = `${itemWidthValue}px`; // - 6
          if(titlePos && containerPos
          && mainWidth - titleWidth <= 44
          && titlePos.top + titleHeight < containerPos.top) {
            itemWidth = '100%';
          }

          var hideLabel = undefined;
          if(titlePos && containerPos)
              hideLabel = titlePos.top < containerPos.top ? true : false;

          this.hideOrShowTitle({ hideLabel, itemWidthValue, itemWidth});
          this.changeSize({ itemWidth, itemWidthValue, titleWidth});
        }
      }
      else // buttons, etc
      if(this.props.options.itemsLayout === 'h') {

        if(this.props.options.hideLabel) {
            var itemWidth = `${(100.0 / itemCount)}%`; // Math.floor
            if(this.state.containerWidth !== itemWidth)
              this.setState({
                containerWidth: itemWidth
              });
        } else {
            if(itemCount > 0) {
              var hideLabel = undefined;
              if(titlePos && containerPos)
                  hideLabel = titlePos.top < containerPos.top ? true : false;

              var itemWidthValue = Math.floor((mainWidth - titleWidth) / itemCount - 6); //
              var itemWidth = `${Math.floor(itemWidthValue)}px`; // - 6

              this.hideOrShowTitle({ hideLabel, itemWidthValue, itemWidth});
              this.changeSize({ itemWidth, itemWidthValue, titleWidth});
            }
        }
      } else {
        // vertical
        if(this.state.containerWidth !== '')
          this.setState({
            containerWidth: ''
          });
      }

      this.changeRenderType({
        mainWidth, mainHeight,
        containerWidth, containerHeight, containerPos,
        titleWidth, titleHeight, titlePos });

      if(this.state.isChanging && this.state.changeType == CHANGE_INIT)
        this.setState({ isChanging : false, changeType: undefined });
    }

    // e, dummy, data
    clickHandler(e, data) {
      var value;
      if(data) {
        value = parseInt(data);
      }
      else
      if(e) {
        e.preventDefault();
        e.stopPropagation();
        value = parseInt(e.target.getAttribute("data-value") || e.target.value);
      }

      if(typeof value === "number" && !isNaN(value))
        this.makeSelection(value);

      return true;
    }

    selectValues(selectFirst){
      //const qSelf = this.props.options.self;
      const isLockSelection = this.props.options.lockSelection;
      const field = this.props.options.field;
      // const app = Qlik.currApp();
      // const field = app.field(fieldName);
      if(field) {
        let toSelect = selectFirst ? [0] : values(this.state.qSelected);
        if(selectFirst)
          this.state.qLastSelected = 0;

        if(isLockSelection)
            field.unlock();

        //qSelf.backendApi.selectValues(0, toSelect, false);
        field.select(toSelect, false, false);

        if(isLockSelection)
          field.lock();
      }
    }

    selectedValuesCount(){
      return values(this.state.qSelected).length;
    }

    getSelectedValues(){
      return values(this.state.qSelected);
    }

    makeSelection(value){
      var self = this;
      var selected = self.state.qSelected;
      var lastSelected = self.state.qLastSelected;

      if(self.props.options.alwaysOneSelected) {
        selected = {};
      }
      else {
        lastSelected = -1;
      }

      if(typeof value === "number" && !isNaN(value) && selected[value] !== value)
          selected[value] = value;
      else
          delete selected[value];

      self.state.qSelected = selected;

      if(self.props.options.alwaysOneSelected)
        self.state.qLastSelected = value;

      if(!(self.props.options.alwaysOneSelected && lastSelected == value))
        self.selectValues();

      //qSelf.selectValues(dim, [value], true);
    }
};

export default ListComponent;
