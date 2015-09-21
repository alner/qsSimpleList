import React from 'react';
import Qlik from 'js/qlik';
import Renderers from './renderers';
import ButtonComponent from './button';
import CheckBoxComponent from './checkbox';
import RadioButtonComponent from './radiobutton';
import SelectComponent from './select';
import SenseCheckBoxComponent from './senseCheckbox';
import SenseRadioButtonComponent from './senseRadiobutton';
//"jsx!./multiselect.js"

// Register default renderer
// Renderers.items.registerDefault(<div />);

class ListComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        qSelected: {},
        qLastSelected: -1,
        qLastField: ''
      };
    }

    componentDidMount() {
      var container = React.findDOMNode(this.refs.container);
      if(container) $(container).on('tap', this.clickHandler);
      //new Hammer(container).on("tap", this.clickHandler);
    }

    render() {
        var self = this;
        var selectedCount = 0;
        var Renderer = Renderers.items.get(self.props.renderAs);
        var Container = Renderers.containers.get(self.props.renderAs);

        var selection = {};
        var itemWidth = (self.props.itemsLayout === 'h' ? (100 / this.props.data.length) + '%' : '100%');
        var items = this.props.data && this.props.data.map(function (row) {
          var field = row[0];
          var isSelected = field.qState === 'S'
          || field.qState === 'L';
          //|| field.qState === 'O';
          //console.log(field.qState);

          if(isSelected) {
            ++selectedCount;
            selection[field.qElemNumber] = field.qElemNumber;

            if(self.state.qLastSelected !== field.qElemNumber)
              self.state.qLastSelected = field.qElemNumber;
          }

          return (<Renderer key={field.qElemNumber} data={field.qElemNumber} width={itemWidth} text={field.qText} isSelected={isSelected} renderAs={self.props.renderAs} selectionColor={self.props.selectionColor} itemsLayout={self.props.itemsLayout}/>);
        });

        if(!_.isEqual(self.state.qSelected, selection))
          self.state.qSelected = selection;

        if(this.props.alwaysOneSelected && selectedCount > 1) {
          this.selectValues(this.selectedValuesCount() > 1); // select first if more then one selection
        }

        if(Container)
          return (<Container changeHandler={this.clickHandler.bind(this)} selectedValues={this.getSelectedValues()} selectionColor={self.props.selectionColor}>{items}</Container>);
        else
          return (<form ref="container" onClick={this.clickHandler.bind(this)} style={{width: "100%", height: "100%", overflowX: "auto", overflowY: "auto"}}>{items}</form>);
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
      var qSelf = this.props.self;
      var isLockSelection = this.props.lockSelection;
      var fieldName = this.props.field;
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

      if(self.props.alwaysOneSelected) {
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

      if(self.props.alwaysOneSelected)
        self.state.qLastSelected = value;

      if(!(self.props.alwaysOneSelected && lastSelected == value))
        self.selectValues();

      //qSelf.selectValues(dim, [value], true);
    }
};

export default ListComponent;
