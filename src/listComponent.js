//import React from 'react';
import Qlik from 'js/qlik';
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

class ListComponent extends React.Component {
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

        // let items = this.getItems();
        // let itemWidth = self.state.containerWidth
        //   || (itemsLayout === 'h' ? (100 / (items.length)) + '%' : '100%');

        // items = items.map(function (row) {
        //   let field = row[0];
        //   let isSelected =
        //   field.qState === 'S'
        //   || field.qState === 'L';
        //   //|| field.qState === 'O';
        //
        //   if(isSelected) {
        //     ++selectedCount;
        //     selection[field.qElemNumber] = field.qElemNumber;
        //
        //     if(self.state.qLastSelected !== field.qElemNumber)
        //       self.state.qLastSelected = field.qElemNumber;
        //   }
        //
        //   return (
        //   <Renderer key={field.qElemNumber}
        //     data={field.qElemNumber}
        //     width={itemWidth}
        //     text={field.qText}
        //     isSelected={isSelected}
        //     //{...self.props.options}
        //     renderAs={self.props.options.renderAs}
        //     selectionColor={self.props.options.selectionColor}
        //     transparentStyle={self.props.options.transparentStyle}
        //     itemsLayout={self.props.options.itemsLayout}
        //     />);
        // });

        if(!_.isEqual(this.state.qSelected, selection))
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
            <div ref="title" className="title qvt-visualization-title">
            {this.props.options.label}
            </div>
          );
        }

        let containerComponent;
        if(Container)
          containerComponent = (
            <Container ref="container"
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
            <form ref="container"
              onClick={this.clickHandler.bind(this)}
              onTouchEnd={this.clickHandler.bind(this)}>
            {components}
            </form>
          );

        return (
          <div ref="main" className="qv-object-simple-list main">
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
        || (itemsLayout === 'h' ? (100 / itemsCount) + '%' : '100%');
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
          let main = React.findDOMNode(this.refs.main);
          let main$ = $(main);
          let mainWidth = main$.innerWidth();
          let container = React.findDOMNode(this.refs.container);
          let container$ = $(container);
          let containerPos = container$.offset();
          let title = React.findDOMNode(this.refs.title);
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
        let main = React.findDOMNode(this.refs.main);
        let mainWidth = $(main).innerWidth();
        let itemCount = this.getItems().length;
        // let itemCount = this.props.options.data
        // .filter(filterExcluded.bind(null, this.props.options.hideExcluded))
        // .length;
        // this.props.options.data.length;

        if(this.props.options.hideLabel) {
          let itemWidth = `${Math.floor(100 / itemCount)}%`;
          if(this.state.containerWidth !== itemWidth)
            this.setState({
              containerWidth: itemWidth
            });
        } else {
            let title = React.findDOMNode(this.refs.title);
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
        e.stopPropagation();
        e.preventDefault();
        value = parseInt(e.target.getAttribute("data-value") || e.target.value);
      }

      if(typeof value === "number" && !isNaN(value))
        this.makeSelection(value);
    }

    selectValues(selectFirst){
      //const qSelf = this.props.options.self;
      const isLockSelection = this.props.options.lockSelection;
      const fieldName = this.props.options.field;
      const app = Qlik.currApp();
      const field = app.field(fieldName);
      if(field) {
        let toSelect = selectFirst ? [0] : _.values(this.state.qSelected);
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
      return _.values(this.state.qSelected).length;
    }

    getSelectedValues(){
      return _.values(this.state.qSelected);
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
