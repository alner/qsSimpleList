//import React from 'react';
import {h, Component, render, cloneElement} from 'preact';
//import Qlik from 'js/qlik';
import isEqual from 'lodash.isEqual';
import values from 'lodash.values';
import Renderers from './renderers';
import ButtonComponent from './button';
//import CheckBoxComponent from './checkbox';
//import RadioButtonComponent from './radiobutton';
import SelectComponent from './select';
import SenseCheckBoxComponent from './senseCheckbox';
import { BUTTON_RENDER, SELECT_RENDER, CHECKBOX_RENDER,
  SWITCH_RENDER } from './definition';
import { createPopupService } from './popupService.js';
//import SenseRadioButtonComponent from './senseRadiobutton';
//"jsx!./multiselect.js"

// Register default renderer
// Renderers.items.registerDefault(<div />);
const CHANGE_TITLE = 'title';
const CHANGE_RENDER = 'render';
const CHANGE_INIT = 'init';
const CHANGE_HORIZONTAL_SCROLL = 'horizontalScroll';
const CHANGE_VERTICAL_SCROLL = 'verticalScroll';
const CHANGE_POPUP = 'popup';
const CHANGE_SIZE = 'size';

const WIDTH_SWITCH_TO_COMPACT = 80; // switch to compact mode if the width is less then the value
const MIN_BUTTON_WIDTH = 44;

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
        qLastSelectedText: '',
        //qLastField: '',
        containerWidth: '',
        containerWidthValue: undefined,
        containerHeightValue: undefined,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        wasGrow: false,
        hideLabel: props.options.hideLabel,
        isChanging: true, //true,
        changeType: CHANGE_INIT,//CHANGE_SIZE,
        renderAs: undefined,
        isCompactMode: false,
        isHorizontalScroll: false,
        isVerticalScroll: false
      };
      this._title = undefined;
      this._main = undefined;
      this._container = undefined;
      this.popupService = createPopupService();
    }

    componentDidMount() {
      setTimeout(() => {
        this.recalcSize();
      }, 500);
    }

    componentDidUpdate(){
      if(this.props.options.isResize)
        this.recalcSize();
    }

    componentWillUnmount(){
      this.popupService.removePopupIfExists();
    }

    itemsToDraw(items, onItemSelectedCallback /*, onNoSelectionsCallback*/) {
      const {
        selectionColor,
        transparentStyle,
        itemsLayout,
        showState,
        expValuesInsteadOfField,
      } = this.props.options;
      const renderAs = this.state.renderAs || this.props.options.renderAs;

      const itemWidth = this.getItemWidth(items.length, itemsLayout);
      const Renderer = Renderers.items.get(renderAs);
      //let selectedCount = 0;
      let components = items.map(function (row) {
        let field = row[0];
        let expression = row[1];
        let isSelected = field.qState === 'S' || field.qState === 'L';

        if(isSelected && onItemSelectedCallback) {
          onItemSelectedCallback(field);
          //++selectedCount;
        }

        return (
        <Renderer
          key={field.qElemNumber}
          data={field.qElemNumber}
          width={itemWidth}
          text={expValuesInsteadOfField ? expression.qText : field.qText}
          state={field.qState}
          isSelected={isSelected}
          renderAs={renderAs}
          selectionColor={selectionColor}
          transparentStyle={transparentStyle}
          itemsLayout={itemsLayout}
          showState={showState}
          />);
      });

      // if(selectedCount == 0 && onNoSelectionsCallback)
      //   onNoSelectionsCallback();

      return components;
    }

    isAlwaysOneSelected(){
      return this.props.options.alwaysOneSelected || this.props.options.renderAs === 'select';
    }

    render() {
        const self = this;
        const {
          itemsLayout,
        } = this.props.options;
        const renderAs = this.state.renderAs || this.props.options.renderAs;
        const compactMode = (this.state.isCompactMode
          || this.props.options.compactMode);

        const Container = Renderers.containers.get(renderAs);
        const items = this.getItems();
        const itemWidth = this.getItemWidth(items.length, itemsLayout);

        const isScroll = this.state.isHorizontalScroll
        || this.state.isVerticalScroll;

        const isExpandButtonShow = (compactMode || isScroll
          || this.popupService.isPopupShow())
          && renderAs !== SELECT_RENDER;

        const isScrollOrPopup = isScroll
        || this.popupService.isPopupShow();

        let isPopupHiddenInCompactMode = compactMode && !this.popupService.isPopupShow();
        let isPopupShowInCompactMode = compactMode && this.popupService.isPopupShow();

        let selectedCount = 0;
        let selection = {};
        let selectedText = [];
        let components = this.itemsToDraw(items,
          // selections callback
          (field) => {
            ++selectedCount;
            selection[field.qElemNumber] = field.qElemNumber;

            if(this.state.qLastSelected !== field.qElemNumber)
              this.state.qLastSelected = field.qElemNumber;

            if(this.state.qLastSelectedText !== field.qText)
              this.state.qLastSelectedText = field.qText;

            selectedText.push(field.qText);
          }
        );

        if(!isEqual(this.state.qSelected, selection))
          this.state.qSelected = selection;

        if(this.isAlwaysOneSelected() && items.length > 0
        && (selectedCount > 1 || selectedCount == 0)) {
          let selectVariable = selectedCount == 0 && this.props.options.variable;
          if(!selectVariable)
            this.state.qLastSelectedText = items[0][0].qText; // to set variable value
          // select first one if more then one selection exists
          this.selectValues({
            selectFirst: selectedCount == 0 || this.selectedValuesCount() > 1,
            selectVariable
          });
        }

        let titleComponent;
        if(!this.props.options.hideLabel) {
          // if not enought room...
          if(this.state.hideLabel || isExpandButtonShow) {
            this._title = null;
          //   titleComponent = (<span ref={(c) => this._title = c}></span>);
          } else
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
              isChanging={this.state.isChanging}
              isScroll={this.state.isHorizontalScroll || this.state.isVerticalScroll}
              isPopup={this.popupService.isPopupShow()}
              isHidden={isPopupHiddenInCompactMode}>
            {components}
            </Container>
          );
        else
        // const paddingLeft = isPopup || isScroll ? "47px" : "0"
          containerComponent = (
            <form ref={(c) => this._container = c }
                //onClick={this.clickHandler.bind(this)}
                //onTouchStart={this.clickHandler.bind(this)}
                onClick={(e) => {
                  if(this._tid)
                    clearTimeout(this._tid);

                  this.clickHandler(e);
                }}
                onTouchStart={(e) => {
                  this._tid = setTimeout(() => {
                    this.clickHandler(e);
                  }, 250);
                }}
                onTouchMove={()=>{
                  if(this._tid) {
                    clearTimeout(this._tid);
                    this._tid = null;
                  }
                }}
                style={{
                  paddingLeft: isScrollOrPopup ? "47px" : "0px",
                  visibility: isPopupHiddenInCompactMode || this.state.isChanging ? 'hidden' : 'visible'
                }}
              >
              <div style={{display: "inline-block", width: "100%", position: "relative", height: "100%", }}>
              {components}
              </div>
            </form>
          );

        let expandComponent;
        if(isExpandButtonShow) {
          let expandClickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let posElement$ = $(e.currentTarget && e.currentTarget.parentElement);
            let offset = posElement$.offset();
            let width = posElement$.width();

            const container =this._container &&
              (this._container.tagName || this._container.base);
            let container$ =  $(container);
            let height = (container$ && container$.height()) ||  posElement$.height();

            this.popupService.setPopupShow(!this.popupService.isPopupShow(), {
              offset, width, height
            });
            this.setState({ isChanging: true, changeType: CHANGE_POPUP});
          };

          expandComponent = (
            <button
              className={`lui-fade-button qui-button btn-expand ${isPopupHiddenInCompactMode ? 'lui-button--compactmode' : ''} ${selectedCount > 0 ? 'lui-button--hasselections' : ''}`}
              title={`${this.props.options.label}: ${selectedText.join(', ')}`}
              onClick={ expandClickHandler }
              onTouchStart={ expandClickHandler }
              >
            {!this.popupService.isPopupShow() ?
              <span className="lui-icon lui-button__icon lui-icon--menu"></span>
              :
              <span className="lui-icon lui-button__icon lui-icon--close"></span>
            }
            {isPopupHiddenInCompactMode && selectedText.length == 0 ?
              <span className="lui-button__text expand-text">{this.props.options.label}</span>
              :
              (isPopupHiddenInCompactMode && selectedText.length > 0 ?
                <span className="lui-button__text expand-text">{this.props.options.label}: {selectedText.join(', ')}</span>
              :
              undefined)
            }
            </button>
          );
        }

        let styles = {
          height: "100%",
        };
        if(isPopupHiddenInCompactMode) {
          styles.overflow = 'hidden';
        } else
        if(isPopupShowInCompactMode) {
          styles.overflow = 'auto';
        } else {
          styles.overflowX = (this.state.isHorizontalScroll) ? 'scroll' : 'hidden';
          styles.overflowY = (this.state.isVerticalScroll) ? 'scroll' : 'hidden';
          //styles.webkitOverflowScrolling = 'touch';
        };

        const simpleListComponent = (
          <div ref={(c) => this._main = c} className="qv-object-simple-list qv-object-sl-touch"
            style={styles}>
            {titleComponent}
            {expandComponent}
            {containerComponent}
          </div>
        );

        // if(this.popupService.isPopupShow())
        //   this.popupService.showAsPopup(simpleListComponent);

        if(this.popupService.isPopupShow()) {
          //let cloned = cloneElement(simpleListComponent, {});
          this.popupService.showAsPopup(simpleListComponent); // simpleListComponent
        } else {
          this.popupService.removePopupIfExists();
        }

        return simpleListComponent;
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

    commitChanges() {
      this.setState({ isChanging: false, changeType: null });
      //this.state.isChanging = false;
      //this.state.changeType = null;
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
      if(this.state.isChanging) {
        this.commitChanges();
        //this.setState({ isChanging: false, changeType: null });
      }
    }

    changeSize({ itemWidth, titleWidth, itemWidthValue,
      containerWidth, containerHeight }) {
      // if size was changed ...
      let containerRealSizeChanged = this.state.containerWidthValue !== containerWidth
        || this.state.containerHeightValue !== containerHeight;

      if(this.state.containerWidth !== itemWidth || containerRealSizeChanged) {
        let oldItemWidthValue = this.state.itemWidthValue;

        // let newState = { itemWidth };
        // if(titleWidth != undefined)
        //   newState.titleWidth = titleWidth;
        //
        // if(itemWidthValue != undefined) {
        //   newState.itemWidthValue = itemWidthValue;
        //   newState.isItemWidthGrow = itemWidthValue > oldItemWidthValue ? true : false;
        // }
        //this.setState(newState);
        const wasGrow = this.state.windowHeight < window.innerHeight
          || this.state.windowWidth < window.innerWidth;

        this.setState({
          containerWidth: itemWidth,
          titleWidth,
          itemWidthValue,
          isItemWidthGrow: itemWidthValue > oldItemWidthValue ? true : false,
          containerWidthValue: containerWidth,
          containerHeightValue: containerHeight,
          wasGrow,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          isChanging: true,
          changeType: CHANGE_SIZE,
          //hideLabel: (!titlePos || (titlePos.top < containerPos.top && ) ? true : false)
        });

        if(containerRealSizeChanged
          && this.state.changeType !== CHANGE_POPUP
          && !this.state.isCompactMode)
          this.popupService.removePopupIfExists();
      }
    }

    changeRenderType({
      mainWidth, mainHeight,
      containerWidth, containerHeight, containerPos,
      titleWidth, titleHeight, titlePos}
    ) {
        if(this.state.isChanging && this.state.changeType !== CHANGE_RENDER)
          return;

        const renderAs = this.props.options.renderAs;

        let totalHeight = containerHeight;
        if(titlePos && containerPos && titlePos.top < containerPos.top) {
          totalHeight += titleHeight;
        }

        if(containerWidth <= WIDTH_SWITCH_TO_COMPACT
          && !this.state.wasGrow
          && !this.state.isCompactMode
          && renderAs != SELECT_RENDER) {
          this.setState({
            //isChanging: true,
            isCompactMode: true
          });
        } else
        if(this.state.isCompactMode) {
          if(containerWidth > WIDTH_SWITCH_TO_COMPACT) { //? && this.state.wasGrow) {
              this.setState({
                //isChanging: true,
                isCompactMode: false,
                //isVerticalScroll: false,
                //isHorizontalScroll: false
              });
          }
        }

        if(renderAs == BUTTON_RENDER
          && !this.props.options.compactMode
          && this.props.options.itemsLayout === 'h'
          && this.props.options.alwaysOneSelected) {
            if(!this.state.renderAs &&
              (totalHeight > mainHeight || this.state.itemWidthValue <= MIN_BUTTON_WIDTH)) {
                  if(!this.state.isChanging) {
                    this.setState({ isChanging: true, changeType: CHANGE_RENDER });
                  } else
                  if(this.state.renderAs != SELECT_RENDER)
                    this.setState({
                      renderAs: SELECT_RENDER,
                      switchBackWidthValue: mainWidth,
                      hideLabel: false,
                      itemWidthValue: undefined,
                      isItemWidthGrow: false });
                  else
                    this.commitChanges();
                    //this.setState({ isChanging: false, changeType: undefined });
            } else
            if(this.state.renderAs && !this.state.isChanging) {
              if(mainWidth > this.state.switchBackWidthValue
                || (totalHeight <= mainHeight && this.state.isItemWidthGrow)) {
                  // try to restore original...
                  this.setState({
                    renderAs: null,
                    switchBackWidthValue: null,
                    isItemWidthGrow: false,
                    isChanging: true,
                    changeType: CHANGE_RENDER })
              }
            } else if(this.state.isChanging) {
              this.commitChanges();
              //this.setState({ isChanging: false, changeType: null });
            }
        } else
        if(this.state.isChanging){
          this.commitChanges();
          // this.setState({
          //   isChanging: false,
          //   changeType: null
          // });
        }
    }

    changeScroll({
      mainWidth, mainHeight,
      containerWidth, containerHeight, containerPos,
      titleWidth, titleHeight, titlePos})
    {
      if(this.state.isChanging
      && this.state.changeType !== CHANGE_INIT)
          // && (this.state.changeType !== CHANGE_HORIZONTAL_SCROLL
          // && this.state.changeType !== CHANGE_VERTICAL_SCROLL))
        return;

      const renderAs = this.props.options.renderAs;

      let totalHeight = containerHeight;
      if(titlePos && containerPos && titlePos.top < containerPos.top) {
        totalHeight += titleHeight;
      }

      // vertical buttons CHECKBOX_RENDER, SWITCH_RENDER
      if((renderAs == BUTTON_RENDER
        || renderAs == CHECKBOX_RENDER
        || renderAs == SWITCH_RENDER
      )
      && this.props.options.itemsLayout === 'v') {
        if(totalHeight > mainHeight
          && !this.state.isVerticalScroll) {
          //&& !this.state.changeType) {
          //this.setState({ isChanging: true, isVerticalScroll: true, changeType: CHANGE_VERTICAL_SCROLL });
          this.setState({ isVerticalScroll: true });
        }
        // else
        // if(this.state.changeType === CHANGE_VERTICAL_SCROLL) {
        //   this.setState({ isChanging: false, isVerticalScroll: true, changeType: undefined });
        // }
        else if(totalHeight < mainHeight && this.state.isVerticalScroll) {
          this.setState({ isVerticalScroll: false });
        }
      }
      else
      // horizontal buttons
      if((renderAs == BUTTON_RENDER
        || renderAs == CHECKBOX_RENDER
        || renderAs == SWITCH_RENDER
      )
      && this.props.options.itemsLayout === 'h') {
        if(totalHeight > mainHeight
          && !this.state.isVerticalScroll) {
          //&& !this.state.isHorizontalScroll) {
          //&& !this.state.changeType) {
          //this.setState({ isChanging: true, isHorizontalScroll: true, changeType: CHANGE_HORIZONTAL_SCROLL });
          //this.setState({ isHorizontalScroll: true });
          this.setState({ isVerticalScroll: true });
        }
        // else
        // if(this.state.changeType === CHANGE_HORIZONTAL_SCROLL) {
        //   this.setState({ isChanging: false, isHorizontalScroll: true, changeType: undefined });
        // }
        else if(totalHeight < mainHeight && this.state.isVerticalScroll) {
          //&& this.state.isHorizontalScroll) {
          //this.setState({ isHorizontalScroll: false });
          this.setState({ isVerticalScroll: false });
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
      var titleWidth; // = title$.width() + 6;
      var titleHeight; // = title$.height();
      var titlePos; // = title$.offset();
      if(title && !this.props.options.hideLabel) {
        titleWidth = title$.width() + 6;
        titleHeight = title$.height();
        titlePos = title$.offset();
      }

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

          // var hideLabel = undefined;
          // if(titlePos && containerPos)
          //     hideLabel = titlePos.top < containerPos.top ? true : false;
          //
          // this.hideOrShowTitle({ hideLabel, itemWidthValue, itemWidth});
          this.changeSize({ itemWidth, itemWidthValue, titleWidth,
            containerWidth, containerHeight });
        }
      }
      else // buttons, etc
      if(this.props.options.itemsLayout === 'h') {

        if(this.props.options.hideLabel) {
            var itemWidth = `${(100.0 / itemCount)}%`; // Math.floor
            this.changeSize({ itemWidth,
              containerWidth, containerHeight });
            // if(this.state.containerWidth !== itemWidth)
            //   this.setState({
            //     containerWidth: itemWidth
            //   });
        } else {
            if(itemCount > 0) {
              //var hideLabel = undefined;
              //if(titlePos && containerPos)
              //    hideLabel = titlePos.top < containerPos.top ? true : false;

              var itemWidthValue = Math.floor((mainWidth - titleWidth) / itemCount - 6); //
              var itemWidth = `${Math.floor(itemWidthValue)}px`; // - 6

              //this.hideOrShowTitle({ hideLabel, itemWidthValue, itemWidth});
              this.changeSize({ itemWidth, itemWidthValue, titleWidth, containerWidth, containerHeight });
            }
        }
      } else {
        // vertical
        // if(this.state.containerWidth !== '')
        //   this.setState({
        //     containerWidth: ''
        //   });
        this.changeSize({ itemWidth: '', containerWidth, containerHeight });
      }

      this.changeRenderType({
        mainWidth, mainHeight,
        containerWidth, containerHeight, containerPos,
        titleWidth, titleHeight, titlePos });

      this.changeScroll({
        mainWidth, mainHeight,
        containerWidth, containerHeight, containerPos,
        titleWidth, titleHeight, titlePos });

      if(this.state.isChanging
      && (this.state.changeType == CHANGE_INIT
       || this.state.changeType == CHANGE_POPUP
       || this.state.changeType == CHANGE_SIZE))
        this.commitChanges();
    }

    // e, dummy, data
    clickHandler(e, data) {
      var value;
      var text;
      if(data) {
        value = parseInt(data.value);
        text = data.text;
      }
      else
      if(e) {
        value = parseInt(e.target.getAttribute("data-value") || e.target.value);
        text = e.target.getAttribute("data-text") || e.target.text;
      }

      if(typeof value === "number" && !isNaN(value)) {
        e.preventDefault();
        e.stopPropagation();
        try {
          if(this.props.options.alwaysOneSelected)
            this.popupService.removePopupIfExists();
        } finally {
          this.makeSelection(value, text);
        }
      }

      return true;
    }

    selectValues({ selectFirst, selectVariable } = {false, false}){
      //const qSelf = this.props.options.self;
      const isLockSelection = this.props.options.lockSelection;
      // const field = this.props.options.field;
      const { selectValues, lockField, unlockField } = this.props.options;
      const variableAPI = this.props.options.variableAPI;
      const variable = this.props.options.variable;

      //if(field) {
        let toSelect = selectFirst ? [0] : values(this.state.qSelected);
        if(selectFirst && !selectVariable)
          this.state.qLastSelected = 0;

        let result;
        if(isLockSelection)
          result = unlockField();
            //field.unlock();

        const callToSelect = (values) => result ? result.then(() => selectValues(0, values, false)) : selectValues(0, values, false);

        //qSelf.backendApi.selectValues(0, toSelect, false);
        if(!selectVariable) {
          // field.select(toSelect, false, false)
          // Field API had a bug. SelectValues doesn't work after reload in another window
          //let callToSelect = result ? result.then(() => selectValues(0, toSelect, false)) : selectValues(0, toSelect, false);
          //selectValues(0, toSelect, false)
          callToSelect(toSelect)
          .then(() => {
            if(isLockSelection)
              lockField();
              //field.lock();
          });
          // store values into specified variable
          if(variable && variableAPI) {
            variableAPI.setStringValue(variable, this.state.qLastSelectedText);
          }
        } else
        if(variable && variableAPI)
          variableAPI.getContent(variable, (reply) => {
            let variableValue = (reply.qContent && reply.qContent.qString)
              || this.state.qLastSelectedText;

            //selectValues([variableValue], false, false)
            //selectValues(0, [variableValue], false)
            callToSelect([variableValue])
            .then(() => {
              if(isLockSelection)
                lockField()
                //field.lock();
            });
          });
      //}
    }

    selectedValuesCount(){
      return values(this.state.qSelected).length;
    }

    getSelectedValues(){
      return values(this.state.qSelected);
    }

    makeSelection(value, text){
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
      self.state.qLastSelectedText = text;

      if(self.props.options.alwaysOneSelected)
        self.state.qLastSelected = value;

      if(!(self.props.options.alwaysOneSelected && lastSelected == value))
        self.selectValues();

      //qSelf.selectValues(dim, [value], true);
    }
};

export default ListComponent;
