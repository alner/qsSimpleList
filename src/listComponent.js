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
//import SenseRadioButtonComponent from './senseRadiobutton';
//"jsx!./multiselect.js"

// Register default renderer
// Renderers.items.registerDefault(<div />);

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
        containerWidth: ''
      };
    }

    componentDidMount() {
      //let container = React.findDOMNode(this.refs.container);
      //if(container) {
        //$(container).on('tap', this.clickHandler.bind(this));
        //$(container).on('click', this.clickHandler.bind(this));
        //$(container).on('touchstart', this.clickHandler.bind(this));
      //}
      this.recalcSize();
    }

    componentDidUpdate(){
      this.recalcSize();
    }

    itemsToDraw(items, onItemSelectedCallback) {
      const {
        renderAs,
        selectionColor,
        transparentStyle,
        itemsLayout
      } = this.props.options;

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
          />);
      });
    }

    render() {
        const {
          renderAs,
          itemsLayout,
        } = this.props.options;

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

        if(this.props.options.alwaysOneSelected
        && items.length > 0
        && (selectedCount > 1 || selectedCount == 0)) {
          // select first if more then one selection
          this.selectValues(selectedCount == 0 || this.selectedValuesCount() > 1);
        }

        let titleComponent;
        if(!this.props.options.hideLabel) {
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
              selectionColor={this.props.options.selectionColor}
              transparentStyle={this.props.options.transparentStyle}>
            {components}
            </Container>
          );
        else
          containerComponent = (
            <form ref={(c) => this._container = c }
              onClick={this.clickHandler.bind(this)}
              onTouchStart={this.clickHandler.bind(this)}
              >
            {components}
            </form>
          );

        return (
          <div ref={(c) => this._main = c} className="qv-object-simple-list main">
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
        || (itemsLayout === 'h' ? 100.0 / itemsCount + '%' : '100%');
    }

    recalcSize(){
      if(this.props.options.renderAs === 'select') {
        // select - special case
        if(this.props.options.hideLabel) {
          if(this.state.containerWidth !== '100%')
            this.setState({
              containerWidth: '100%'
            });
        } else {
          let main = this._main;
          let main$ = $(main);
          let mainWidth = main$.innerWidth();
          let container = this._container;
          let container$ = $(container);
          let containerPos = container$.offset();
          let title = this._title;
          let title$ = $(title);
          let titleWidth = title$.width();
          let titleHeight = title$.height();
          let titlePos = title$.offset();
          let itemWidth = `${mainWidth - titleWidth - 6}px`;
          if(mainWidth - titleWidth <= 44
          && titlePos.top + titleHeight < containerPos.top) {
            itemWidth = '100%';
          }
          if(this.state.containerWidth !== itemWidth)
            this.setState({
              containerWidth: itemWidth
            });
        }
      }
      else
      if(this.props.options.itemsLayout === 'h') {
        let main = this._main;
        let mainWidth = $(main).innerWidth();
        let itemCount = this.getItems().length;
        // let itemCount = this.props.options.data
        // .filter(filterExcluded.bind(null, this.props.options.hideExcluded))
        // .length;
        // this.props.options.data.length;

        if(this.props.options.hideLabel) {
          let itemWidth = `${(100.0 / itemCount)}%`; // Math.floor
          if(this.state.containerWidth !== itemWidth)
            this.setState({
              containerWidth: itemWidth
            });
        } else {
            let title = this._title;
            let titleWidth = $(title).width();
            if(itemCount > 0) {
              let itemWidth = `${Math.floor((mainWidth - titleWidth) / itemCount - 2)}px`;
              if(this.state.containerWidth !== itemWidth)
                this.setState({
                  containerWidth: itemWidth
                });
            }
        }
      } else {
        // vertical
        if(this.state.containerWidth !== '')
          this.setState({
            containerWidth: ''
          });
      }
    }

    clickHandler(e, dummy, data) {
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
