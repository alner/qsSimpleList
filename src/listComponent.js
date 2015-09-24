import React from 'react';
import Qlik from 'js/qlik';
import Renderers from './renderers';
import ButtonComponent from './button';
import CheckBoxComponent from './checkbox';
import RadioButtonComponent from './radiobutton';
import SelectComponent from './select';
import SenseCheckBoxComponent from './senseCheckbox';
//import SenseRadioButtonComponent from './senseRadiobutton';
//"jsx!./multiselect.js"

// Register default renderer
// Renderers.items.registerDefault(<div />);

class ListComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        qSelected: {},
        qLastSelected: -1,
        qLastField: '',
        containerWidth: ''
      };
    }

    componentDidMount() {
      let container = React.findDOMNode(this.refs.container);
      if(container) $(container).on('tap', this.clickHandler.bind(this));
      this.recalcSize();
    }

    componentDidUpdate(){
      this.recalcSize();
    }

    render() {
        let self = this;
        let selectedCount = 0;
        let Renderer = Renderers.items.get(self.props.options.renderAs);
        let Container = Renderers.containers.get(self.props.options.renderAs);

        let selection = {};
        let itemWidth = self.state.containerWidth || (self.props.options.itemsLayout === 'h' ? (100 / (this.props.options.data.length)) + '%' : '100%');
        let items = this.props.options.data && this.props.options.data.map(function (row) {
          let field = row[0];
          let isSelected =
          field.qState === 'S'
          || field.qState === 'L';
          //|| field.qState === 'O';

          if(isSelected) {
            ++selectedCount;
            selection[field.qElemNumber] = field.qElemNumber;

            if(self.state.qLastSelected !== field.qElemNumber)
              self.state.qLastSelected = field.qElemNumber;
          }

          return (<Renderer key={field.qElemNumber}
            data={field.qElemNumber}
            width={itemWidth}
            text={field.qText}
            isSelected={isSelected}
            renderAs={self.props.options.renderAs}
            selectionColor={self.props.options.selectionColor}
            itemsLayout={self.props.options.itemsLayout}/>);
        });

        if(!_.isEqual(self.state.qSelected, selection))
          self.state.qSelected = selection;

        if(this.props.options.alwaysOneSelected && selectedCount > 1) {
          this.selectValues(this.selectedValuesCount() > 1); // select first if more then one selection
        }

        let titleComponent;
        if(!this.props.options.hideLabel) {
          titleComponent = (
            <div ref="title" className="title qvt-visualization-title">
            {self.props.options.label}
            </div>
          );
        }

        let containerComponent;
        if(Container)
          containerComponent = (
            <Container ref="container" changeHandler={this.clickHandler.bind(this)}
              selectedValues={this.getSelectedValues()}
              itemWidth={itemWidth}
              selectionColor={self.props.options.selectionColor}>
            {items}
            </Container>
          );
        else
          containerComponent = (
            <form ref="container"
              onClick={this.clickHandler.bind(this)}>
            {items}
            </form>
          );

        return (
          <div ref="main" className="qv-object-simple-list main">
            {titleComponent}
            {containerComponent}
          </div>
        );
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
        let itemCount = this.props.options.data.length;

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
        e.preventDefault();
        value = parseInt(e.target.getAttribute("data-value") || e.target.value);
      }

      if(typeof value === "number" && !isNaN(value))
        this.makeSelection(value);
    }

    selectValues(selectFirst){
      var qSelf = this.props.options.self;
      var isLockSelection = this.props.options.lockSelection;
      var fieldName = this.props.options.field;
      var app = Qlik.currApp();
      var field = app.field(fieldName);

      var toSelect = selectFirst ? [0] : _.values(this.state.qSelected);
      if(selectFirst)
        this.state.qLastSelected = 0;

      if(isLockSelection && field)
          field.unlock();

      //qSelf.backendApi.selectValues(0, toSelect, false);
      field.select(toSelect, false, false);

      if(isLockSelection && field)
        field.lock();
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
