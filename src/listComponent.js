//import React from 'react';
import {h, Component, render, cloneElement} from 'preact';
//import Qlik from 'js/qlik';
//import isEqual from 'lodash.isEqual';
//import values from 'lodash.values';
import Renderers from './renderers';
import ButtonComponent from './button';
//import CheckBoxComponent from './checkbox';
//import RadioButtonComponent from './radiobutton';
import SelectComponent from './select';
import SenseCheckBoxComponent from './senseCheckbox';
import { BUTTON_RENDER, SELECT_RENDER, CHECKBOX_RENDER,
  SWITCH_RENDER } from './definition';
import { createPopupService } from './popupService.js';
import { selectionEvents } from './selectionEvents';
import applyActions, {filterExcluded, isSelectedItem, getFieldValue} from './actions';
//import SenseRadioButtonComponent from './senseRadiobutton';
//"jsx!./multiselect.js"

// Register default renderer
// Renderers.items.registerDefault(<div />);
const CHANGE_TITLE = 'title';
const CHANGE_RENDER = 'render';
const CHANGE_INIT = 'init';
const CHANGE_COMMIT = 'commit';
const CHANGE_HORIZONTAL_SCROLL = 'horizontalScroll';
const CHANGE_VERTICAL_SCROLL = 'verticalScroll';
const CHANGE_POPUP = 'popup';
const CHANGE_SIZE = 'size';
const CHANGE_SCROLL = 'scroll';

const WIDTH_SWITCH_TO_COMPACT = 80; // switch to compact mode if the width is less then the value
const MIN_BUTTON_WIDTH = 44;
const MAX_ITEMS_IN_TOOLTIP = 64;

class ListComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        //qSelected: {},
        isSelectionStarted: false,
        currentSelections: [],
        qLastSelected: -1,
        //qLastSelectedText: '',
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
      this.eventsInjector = selectionEvents.bind(this, {
        changeHandler: this.selectionHandler.bind(this),
        changeSelection: this.changeSelection.bind(this),
        finishSelection: this.finishSelection.bind(this)
      });
      this.onUpdateData = this.onUpdateData.bind(this);
      const { subscribers, actions } = this.props.options;
      // apply actions on first render
      if(subscribers && actions)
        subscribers.once(this.onUpdateData);
    }

    componentDidMount() {
      this.recalcSize();
    }

    componentDidUpdate(){
      if(this.props.options.isResize
      || this.state.changeType === CHANGE_COMMIT
      || this.state.changeType === CHANGE_SCROLL
      || this.state.changeType === CHANGE_SIZE
      || this.state.changeType === CHANGE_RENDER)
        this.recalcSize();
    }

    componentWillReceiveProps(nextProps) {
      let nextArea = nextProps.options.area;
      let area = this.props.options.area;

      if(nextProps.options.hideLabel != this.props.options.hideLabel         
      || nextArea.qHeight != area.qHeight
      || nextArea.qWidth != area.qWidth
      || nextArea.qLeft != area.qLeft
      || nextArea.qTop != area.qTop) {
        this.setState({ isChanging: true, changeType: CHANGE_SIZE, hideLabel: nextProps.options.hideLabel});
      }
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
        let isSelected = isSelectedItem(row); // field.qState === 'S' || field.qState === 'L';

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

    isExpandButtonShow() {
      const renderAs = this.state.renderAs || this.props.options.renderAs;
      return (this.state.isCompactMode
          || this.props.options.compactMode
          || this.state.isHorizontalScroll
          || this.state.isVerticalScroll
          || this.popupService.isPopupShow())
          && renderAs !== SELECT_RENDER
    }

    isHideTitle() {
      return this.props.options.hideLabel || this.state.hideLabel || this.isExpandButtonShow();
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

        const isExpandButtonShow = this.isExpandButtonShow();
        /* 
        (compactMode || isScroll
          || this.popupService.isPopupShow())
          && renderAs !== SELECT_RENDER;
          */

        const isScrollOrPopup = isScroll
        || this.popupService.isPopupShow();

        let isPopupHiddenInCompactMode = compactMode && !this.popupService.isPopupShow();
        let isPopupShowInCompactMode = compactMode && this.popupService.isPopupShow();

        let selectedCount = 0;
        //let selection = {};
        let selectedText = [];
        let components = this.itemsToDraw(items,
          // selections callback
          (field) => {
            ++selectedCount;
            //selection[field.qElemNumber] = field.qElemNumber;

            if(this.state.qLastSelected !== field.qElemNumber)
              this.state.qLastSelected = field.qElemNumber;

            // if(this.state.qLastSelectedText !== field.qText)
            //   this.state.qLastSelectedText = field.qText;

            if(selectedCount < MAX_ITEMS_IN_TOOLTIP)
              selectedText.push(field.qText);
          }
        );

        if(selectedCount > MAX_ITEMS_IN_TOOLTIP)
          selectedText.push("...");

        // if(!isEqual(this.state.qSelected, selection))
        //   this.state.qSelected = selection;

        if(this.isAlwaysOneSelected() && items.length > 0
        && (selectedCount > 1 || selectedCount == 0)) {
          //let selectVariable = selectedCount == 0 && this.props.options.variable;
          //if(!selectVariable)
          //this.state.qLastSelectedText = items[0][0].qText; // to set variable value
          // select first one if more then one selection exists
          this.selectValues({
            selectFirst: selectedCount == 0 || selectedCount > 1, //this.selectedValuesCount() > 1,
//            selectVariable
          });
        }

        let titleComponent;
        let isHideTitle = this.isHideTitle(); 
        //this.props.options.hideLabel || this.state.hideLabel || isExpandButtonShow;
        if(!this.props.options.hideLabel) {
          // if not enought room...
          if(isHideTitle) {
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
              changeHandler={this.selectionHandler.bind(this)}
              changeSelection={this.changeSelection.bind(this)}
              finishSelection={this.finishSelection.bind(this)}
              //selectedValues={this.getSelectedValues()}
              lastSelectedValue={this.state.qLastSelected}
              itemWidth={itemWidth}
              containerWidth={this.state.containerWidth}
              isTitleHidden={isHideTitle} 
              titleWidth={isHideTitle ? 0 : this.state.titleWidth}
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
                {...this.eventsInjector()}
                //onClick={this.selectionHandler.bind(this)}
                //onTouchStart={this.selectionHandler.bind(this)}
                /*
                onClick={(e) => {
                  if(this._tid)
                    clearTimeout(this._tid);

                  this.selectionHandler(e);
                }}
                onMouseMove={(e) => {
                  this.changeSelection(e);
                }}
                onMouseUp={(e)=>{
                  this.finishSelection(e);
                }}
                onMouseLeave={(e)=>{
                  this.finishSelection(e);
                }}
                onTouchStart={(e) => {
                  this._tid = setTimeout(() => {
                    this.selectionHandler(e);
                    props.finishSelection(e);
                  }, 250);
                }}
                onTouchMove={(e)=>{
                  e.preventDefault();
                  if(this._tid) {
                    clearTimeout(this._tid);
                    this._tid = null;
                  }
                  this.changeSelection(e);
                }}
                onTouchEnd={(e)=>{
                  e.preventDefault();
                  this.finishSelection(e);
                }}
                */
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

    getSelectedValues() {
      const data = this.props.options.data;
      return data.filter(item => { 
        return isSelectedItem(item); 
      }).map(item => { return getFieldValue(item) });
    }

    getItemWidth(itemsCount, itemsLayout) {
      return this.state.containerWidth
        || (itemsLayout === 'h' ? Math.floor(100.0 / itemsCount) + '%' : '100%');
    }

    commitChanges() {
      if(this.state.changeType === CHANGE_INIT)
        this.setState({ isChanging: false, changeType: CHANGE_COMMIT });
      else
      if(this.state.changeType === CHANGE_SIZE)
        this.setState({ isChanging: true, changeType: CHANGE_SCROLL });
      else
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

        const changeType = this.state.changeType || CHANGE_SIZE;
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
          changeType,
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
        if(this.state.isChanging
          && this.state.changeType !== CHANGE_RENDER
            && this.state.changeType !== CHANGE_COMMIT)
              return;

        const renderAs = this.props.options.renderAs;

        let totalHeight = containerHeight;
        if(titlePos && containerPos && titlePos.top < containerPos.top) {
          totalHeight += titleHeight;
        }

        if(!this.props.options.alwaysOneSelected)
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
                      itemWidth: "auto",
                      containerWidth: "auto",
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
      if((this.state.isChanging && 
      (this.state.changeType !== CHANGE_INIT 
      && this.state.changeType != CHANGE_SCROLL))
      || this.props.options.alwaysOneSelected) // if alwaysOneSelected - prefer to use select render
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
       || this.state.changeType == CHANGE_COMMIT
       || this.state.changeType == CHANGE_SCROLL
       || this.state.changeType == CHANGE_POPUP
       || this.state.changeType == CHANGE_SIZE))
        this.commitChanges();
    }

    changeSelection(e) {
      let isSelectionStarted = this.state.isSelectionStarted;
      if(!isSelectionStarted && !this.props.options.alwaysOneSelected) {
        if(e.buttons !== 0 || (e.touches && e.touches.length)) {
          isSelectionStarted = true;
          this.setState({isSelectionStarted, currentSelections:[] });
        }
      }

      if(isSelectionStarted) {
        let target;
        if(e.touches && e.touches.length)
          target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        else
          target = e.target;

        if(target
        && (target.classList.contains('selectable')
        || target.classList.contains('selected')))
          this.selectionHandler({
            target,
            preventDefault: e.preventDefault.bind(e),
            stopPropagation: e.stopPropagation.bind(e)}); // do selection
      }
    }

    finishSelection(e) {
      if(this.state.isSelectionStarted) {
        this.makeSelection({value: this.state.currentSelections});
        this.setState({isSelectionStarted: false, currentSelections:[]});
      }
    }

    // e, dummy, data
    selectionHandler(e, data) {
      var value;
      //var text;
      if(data) {
        value = parseInt(data.value);
        //text = data.text;
      }
      else
      if(e) {
        value = parseInt(e.target.getAttribute("data-value") || e.target.value);
        //text = e.target.getAttribute("data-text") || e.target.text;
      }

      if(this.state.isSelectionStarted
      && this.state.currentSelections.indexOf(value) == -1) {
        //this.state.currentSelections.push(value);
        if(e.target.classList.contains('selectable')) {
          e.target.classList.remove('selectable');
          e.target.classList.add('selected');
        }
        else if(e.target.classList.contains('selected')) {
          e.target.classList.remove('selected');
          e.target.classList.add('selectable');
        }
      }

      if(typeof value === "number" && !isNaN(value)) {
        e.preventDefault();
        e.stopPropagation();
        try {
          if(this.props.options.alwaysOneSelected
          || this.props.options.toggleMode)
            this.popupService.removePopupIfExists();
        } finally {
          this.makeSelection({value, /*text,*/ isKeepSelection: this.state.isSelectionStarted});
        }
      }

      return true;
    }

    selectValues({selectFirst, /*selectVariable,*/ isToggle, values } = {false,  false, null}){
      const isLockSelection = this.props.options.lockSelection;
      const { selectValues, lockField, unlockField, toggleMode, actions, subscribers, app } = this.props.options;
      //const field = this.props.options.field;
      //const variableAPI = this.props.options.variableAPI;
      //const variable = this.props.options.variable;
      let qToggleMode = !toggleMode;
      if(!toggleMode)
        qToggleMode = isToggle || false;

      //if(field) {
      let toSelect = selectFirst ? [0] : values; //values(this.state.qSelected);
      if(selectFirst)// && !selectVariable)
        this.state.qLastSelected = 0;

      let futureResult;
      if(isLockSelection)
        futureResult = unlockField();

      const callToSelect = (values) => futureResult ? futureResult.then(() => selectValues(0, values, qToggleMode)) : selectValues(0, values, qToggleMode);

      //if(!selectVariable) {
        // field.select(toSelect, false, false)
        // Field API had a bug. SelectValues doesn't work after reload in another window

      // Subscribe for actions call
      if(subscribers && actions)
        subscribers.once(this.onUpdateData); // subscribe for update when data will be ready...

      callToSelect(toSelect)
      .then(() => {
        if(isLockSelection)
          lockField();
          //field.lock();
      });
        // store values into specified variable
        // if(variable && variableAPI) {
        //   variableAPI.setStringValue(variable, this.state.qLastSelectedText);
        // }
      // } else
      // if(variable && variableAPI)
      //   variableAPI.getContent(variable, (reply) => {
      //     let variableValue = (reply.qContent && reply.qContent.qString)
      //       || this.state.qLastSelectedText;

      //     //selectValues([variableValue], false, false)
      //     //selectValues(0, [variableValue], false)
      //     callToSelect([variableValue])
      //     .then(() => {
      //       if(isLockSelection)
      //         lockField()
      //         //field.lock();

      //       //applyActions(app, actions, this.getSelectedValues(), true);              
      //     });
      //   });
      //}
    }

    makeSelection({value, /*text,*/ isKeepSelection = false}){
      var self = this;
      //var selected = self.state.qSelected;
      //var lastSelected = self.state.qLastSelected;
      // if(self.props.options.alwaysOneSelected) {
      //   selected = {};
      // }
      // else {
      //   lastSelected = -1;
      // }

      // if(typeof value === "number" && !isNaN(value) && selected[value] !== value)
      //     selected[value] = value;
      // else
      //     delete selected[value];

      //self.state.qSelected = selected;

      if(isKeepSelection && self.state.currentSelections.indexOf(value) == -1) {
        // there is no need to repaint
        self.state.currentSelections.push(value);
      }

      const isAlwaysOneSelected = self.props.options.alwaysOneSelected;
      const alwaysLastSelectedValue = Array.isArray(value) ? value[0] : value;
      if(!isKeepSelection && !(isAlwaysOneSelected && self.state.qLastSelected == alwaysLastSelectedValue))
        self.selectValues({
          values: Array.isArray(value) ? value : [value],
          isToggle: !isAlwaysOneSelected // If true, values in the field are selected in addition to any previously selected items.
        });

      if(!isKeepSelection && isAlwaysOneSelected)
        self.state.qLastSelected = Array.isArray(value) ? value[0] : value;

      // if(text)
      //   self.state.qLastSelectedText = text;


      //qSelf.selectValues(dim, [value], true);
    }

    onUpdateData(layout) {
      // visual.extension lifecycle methods. see. paint.js
      const app = this.props.options.app;
      applyActions(app, layout, true);
    }
};

export default ListComponent;
