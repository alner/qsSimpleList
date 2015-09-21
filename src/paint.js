export default function paint($element, layout) {
  let ListComponent = require('./listComponent');
  console.log('*** simple list paint ***');
  console.log($element, layout);
  //React.render(<ListComponent />, ($element)[0]);

  let self = this;
  let element = ($element)[0];
  if(layout.qListObject && layout.qListObject.qDataPages.length > 0) {
    let qData = layout.qListObject.qDataPages[0].qMatrix;
    let qField = layout.qListObject.qDimensionInfo.qGroupFieldDefs[layout.qListObject.qDimensionInfo.qGroupPos].replace(/^=/, '');
    let alwaysOneSelected = layout.alwaysOneSelected || (layout.renderAs === 'select');
    let selectionColor = 'rgb(70, 198, 70)';
    // if(Theme)
    // selectionColor = layout.selectionColor < Theme.palette.length ? Theme.palette[layout.selectionColor] : 'rgb(70, 198, 70)';

    React.render(<ListComponent
      self={self}
      data={qData}
      field={qField}
      renderAs={layout.renderAs}
      selectionColor={selectionColor}
      itemsLayout={layout.itemsLayout}
      lockSelection={layout.lockSelection}
      alwaysOneSelected={alwaysOneSelected}/>, element);
  }
}

/*
define(["js/qlik",
  "general.services/media-tool/theme",
  "react", //"./lib/react/build/react",
  "underscore",
  "jqmevents",
  "jsx!./renderers.js",
  "jsx!./button.js",
  "jsx!./checkbox.js",
  "jsx!./radiobutton.js",
  "jsx!./select.js",
  "jsx!./multiselect.js",
  "jsx!./senseCheckbox.js",
  "jsx!./senseRadiobutton.js"],

  function (Qlik, Theme, React, _, jqmevents, Renderers) {
  //React.initializeTouchEvents(true);

  // Register default renderer
  Renderers.items.registerDefault(<div />);

	var QSList = React.createClass({
      getInitialState: function(){
        return {
          qSelected: {},
          qLastSelected: -1,
          qLastField: ''
        };
      },

      clickHandler: function(e, dummy, data) {
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
      },

      selectValues: function(selectFirst){
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
      },

      selectedValuesCount: function(){
        return _.values(this.state.qSelected).length;
      },

      getSelectedValues: function(){
        return _.values(this.state.qSelected);
      },

      makeSelection: function(value){
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
      },

      componentDidMount: function(){
        var container = React.findDOMNode(this.refs.container);
        if(container) $(container).on('tap', this.clickHandler);
        //new Hammer(container).on("tap", this.clickHandler);
      },

      render : function() {
          var self = this;
          var selectedCount = 0;
          var Renderer = Renderers.items.get(self.props.renderAs);
          var Container = Renderers.containers.get(self.props.renderAs);

          var selection = {};
          var itemWidth = (self.props.itemsLayout === 'h' ? (100 / this.props.data.length) + '%' : '100%');
          var items = this.props.data.map(function (row) {
            var field = row[0];
            var isSelected = field.qState === 'S'
            || field.qState === 'L'
            || field.qState === 'O';
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

          // this.getSelectedValues()changeHandler
          if(Container)
            // childs={items}
            return (<Container changeHandler={this.clickHandler} selectedValues={this.getSelectedValues()} selectionColor={self.props.selectionColor}>{items}</Container>);
          else
            return (<form ref="container" onClick={this.clickHandler} style={{width: "100%", height: "100%", overflowX: "auto", overflowY: "auto"}}>{items}</form>);
      }
	});

  return {
    paint: function($element, layout) {
      var self = this;
      var element = ($element)[0];
      if(layout.qListObject.qDataPages.length > 0) {
        var qData = layout.qListObject.qDataPages[0].qMatrix;
        var qField = layout.qListObject.qDimensionInfo.qGroupFieldDefs[layout.qListObject.qDimensionInfo.qGroupPos].replace(/^=/, '');
        var alwaysOneSelected = layout.alwaysOneSelected || (layout.renderAs === 'select');
        var selectionColor = layout.selectionColor < Theme.palette.length ? Theme.palette[layout.selectionColor] : 'rgb(70, 198, 70)';
        React.render(<QSList self={self} data={qData} field={qField} renderAs={layout.renderAs} selectionColor={selectionColor} itemsLayout={layout.itemsLayout} lockSelection={layout.lockSelection} alwaysOneSelected={alwaysOneSelected}/>, element);
      }
    }
  };
});
*/
