import {h, Component, render, cloneElement} from 'preact';

// Just for state management
export class RootPropertyComponent extends Component {
    render(props, state) {
        const currentSelection = state.currentSelection || props.currentSelection;
        const model = props.properties;
        const path = `${searchPathTo(model, currentSelection)}/${currentSelection}`;
        return (
            <div>
                {props.children.map(child => {
                        const name = child.attributes.name;
                        const isActive = name && path.search(new RegExp(`${name}(?=$|/)`)) != -1; 
                    
                        let props = {...child.attributes, parent: this, currentSelection: path, isActive };
                        return cloneElement(child,  props)
                    }
                )}
            </div>
        )
    }

    setCurrentSelection(currentSelection) {
        this.setState({currentSelection});
    }
}

// Tree property visualization component
export default class PropertyComponent extends Component {

  constructor(props){
    super();
    this.state.isExpanded = props.isActive;
    this.onExpand = this.onExpand.bind(this);
    this.onSelectProperty = this.onSelectProperty.bind(this);
  }

  onExpand() {
    //this.state.isExpanded = !this.state.isExpanded
    let wasExpanded = this.state.isExpanded;
    this.setState({
      isExpanded: !wasExpanded
    });
  }

  getFullPath(obj, pathArray = []) {
    if(typeof obj.props.name == 'string') pathArray.push(obj.props.name);
    if(obj.props.parent)
      obj.getFullPath(obj.props.parent, pathArray);


    const path = [...pathArray].reverse().join('/');

    // // root level
    // if(isChangeState && !obj.props.parent)
    //   obj.setState({currentSelection: path});
    
    return path;
  }

  getRootParent(obj, isExpand) {
      let parent = obj || this;

      if(parent.props.parent) {
        if(!parent.isExpanded) parent.onExpand();

        parent = this.getRootParent(parent.props.parent);
      }

      return parent;
  }

  setCurrentSelection(currentSelection) {
      this.setState({currentSelection})
  }

  onSelectProperty() {
    let path;

    if(this.props.isExcludeFromSelection)
        return;

    let parent = this.getRootParent();
    if(!parent)
        return;

    if(this.props.isGetLastSelectedItem)
        path = this.props.name;
    else
        path = this.getFullPath(this);

    parent.setCurrentSelection(path);

    let onSelectItem = parent.props.onSelectItem || this.props.onSelectItem;  
    if(onSelectItem)
      onSelectItem(path, this.props);
  }

  isExpanded(level = 0){
    // Level 0 is expanded by default
    return this.state.isExpanded || level === 0;
  }

  render(props, state) {
    const properties = props.properties; // childs properties
    const getNameFunc = getFunctionOrNull(props.onGetName);
    const getValueFunc = getFunctionOrNull(props.onGetValue); 
    const getIconFunc = getFunctionOrNull(props.onGetIcon);
    const getMetaDataFunc = getFunctionOrNull(props.onGetMetaData);

    const name = (getNameFunc && getNameFunc(props)) || props.name; 
    // (typeof props.name === 'function'&& props.name.call(this, props))
    //     || props.name;
    const value = (getValueFunc && getValueFunc(props)) || props.value; // getValueFunc(properties[prop]))
    //callFuncOrReturnValue(props.value); 
        //(typeof props.value === 'function' && props.value.call(this, props));


    const isGetLastSelectedItem = props.isGetLastSelectedItem;       
    const icon = (getIconFunc && getIconFunc(props)) || props.icon;
    const isShowType = !(typeof props.isHideType !== 'undefined' && props.isHideType); 
    const currentSelection = state.currentSelection || props.currentSelection;
    const isActive = isGetLastSelectedItem ? currentSelection.search(new RegExp(`/${name}$`)) != -1 : props.isActive; // name === currentSelection
    const typeDescription = props.typeDescription;
    const level = props.level || 0;
    const onSelectItem = props.onSelectItem;
    const onGetSubItems = props.onGetSubItems; 
    const subItems = (onGetSubItems && onGetSubItems.call(this, props)) || (typeof properties == 'object' && Object.keys(properties)) || [];

    if(getMetaDataFunc)
        getMetaDataFunc(props);
    
    let iconComponent;
    if(properties && subItems.length > 0) {
      // has child properties...
      iconComponent = this.isExpanded(level) ?
          (<span class={`lui-list__aside lui-icon lui-icon--minus ${isActive?'lui-text-success':''}`}></span>)
          :
          (<span class={`lui-list__aside lui-icon lui-icon--plus ${isActive?'lui-text-success':''}`}></span>);    
    }
    // else if(icon) {
    //     iconComponent = (<span class={`lui-list__aside lui-icon ${icon}`}></span>)
    // } 
    else if(properties && subItems.length == 0) {
      iconComponent = (<span class={`lui-list__aside lui-icon lui-icon--close ${isActive?'lui-text-success':''}`} style={{opacity: 0.5}}></span>);        
    }
    else if(!icon)
      // default icon for a value
      iconComponent = (<span class={`lui-list__aside lui-icon lui-icon--tag ${isActive?'lui-text-success':''}`} style={{opacity: 0.7}}></span>);

    // custom icon
    let elementIconComponent;
    if(icon) {
        if(icon.indexOf('data-icon=') == 0)
            elementIconComponent = (<span className="dicon" data-icon={`${icon.replace('data-icon=', '')}`}></span>);
        else
            elementIconComponent = (<span className={`lui-icon ${icon}`}></span>);
    }

    // whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    return (
        <div tabindex={0} style={{clear: 'both', paddingLeft: 10*level, cursor: 'pointer'}}>
              {level > 0 &&
                  <div className="lui-list__item" style={{minHeight:'28px', height: '28px'}} onClick={this.onExpand}>
                    {iconComponent}
                    <span className="lui-list__text" style={{whiteSpace: 'nowrap'}}>
                      <span 
                        className={`lui-tag ${isActive?'lui-bg-success':''}`}
                        style={{textAlign:'center'}}
                        onClick={this.onSelectProperty.bind(this)}>
                        {elementIconComponent}&nbsp;
                        {name}
                        &nbsp;
                      </span>
                      {isShowType &&
                      <span 
                        className="lui-text-default" 
                        style={{fontSize: '1.1em'}}>
                        &nbsp;{typeDescription}
                        {value != null && 
                            <span className="lui-text-default">&nbsp;&#61;&nbsp;</span>
                        }
                      </span>
                      }
                      {value != null &&
                        <span className="lui-text-success">
                          {value}
                        </span>
                      }
                    </span>
                  </div>
              }
              {this.isExpanded(level) && subItems.map((prop, index) => {
                    const name = (getNameFunc && getNameFunc(prop)) || prop; 
                    const value = (getValueFunc && getValueFunc(prop)) || getValue(properties[prop]);
                    const typeDesc = getTypeDescriptor(properties[prop]);
                    const pathTill = currentSelection && this.getFullPath(this);
                    const path = isGetLastSelectedItem ? name : RegexpEscape(`${pathTill}/${name}`);
                    const isInSelectedPath = currentSelection && currentSelection.search(new RegExp(`${path}(?=$|/)`)) != -1;

                    const childProperties = (getValueFunc && properties[prop]) || (!value && properties[prop]);

                    return (
                      <PropertyComponent 
                        name={name} 
                        index={index}
                        onGetName={getNameFunc}
                        value={value}
                        onGetValue={getValueFunc}
                        icon={icon}
                        onGetIcon={getIconFunc}
                        isHideType={props.isHideType}
                        typeDescription={typeDesc}                       
                        properties={childProperties}
                        parent={this} 
                        level={level+1} 
                        isActive={isInSelectedPath}
                        currentSelection={isInSelectedPath || isGetLastSelectedItem ? currentSelection : null}
                        isGetLastSelectedItem={isGetLastSelectedItem}
                        onSelectItem={onSelectItem}
                        onGetSubItems={onGetSubItems}
                        onGetMetaData={getMetaDataFunc}
                        />
                    )
                  }
              )}
        </div>
    )
  }

  componentDidMount() {
      // Scroll into active element
      if(this.props.isActive) {
        let dialog_body = getParent(this.base, (element) => elementHasClass(element, 'dialog__body'));
        if(dialog_body) {
            dialog_body.scrollTop = dialog_body.scrollTop + this.base.getBoundingClientRect().top;
        }
      }
  }
}

// Utils functions
export function getIconName(a) {
		switch (a.toLowerCase()) {
		case "barchart":
			return "icon-bar-chart-vertical";
		case "linechart":
			return "icon-line-chart";
		case "table":
			return "icon-table";
		case "pivot-table":
			return "icon-pivot-table";
		case "components":
			return "icon-components";
		case "piechart":
			return "icon-pie-chart";
		case "filterpane":
			return "icon-filterpane";
		case "listbox":
			return "icon-list";
		case "gauge":
			return "icon-gauge-chart";
		case "kpi":
			return "icon-kpi";
		case "scatterplot":
			return "icon-scatter-chart";
		case "text-image":
			return "icon-text-image";
		case "treemap":
			return "icon-treemap";
		case "map":
			return "icon-map";
		case "combochart":
			return "icon-combo-chart";
		default:
			return "icon-extension"
		}
}

// "Analog" of parents 
function getParent(el, predicate) {
  return predicate(el) ? el : (
     el && getParent(el.parentNode, predicate)
  );
}

function elementHasClass(el, className) {
    var classes = el.className.split(" ");
    return classes.indexOf(className) >= 0;
}

// Utils function
function getValue(val) {
  if(typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean')
    return val;

  return null;
}

function getTypeDescriptor(val) {
  if(Array.isArray(val)) return '[ ]';
  if(typeof val === 'object') return '{ }'
  return typeof val;
}

function RegexpEscape (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// function callFuncOrReturnValue(valueOrFunc, props) {
//     return (typeof valueOrFunc === 'function' && valueOrFunc.call(null, props))
//         || valueOrFunc;
// }

function getFunctionOrNull(valueOrFunc) {
    return (typeof valueOrFunc === 'function' && valueOrFunc) || null;
}

function searchPathTo(obj, value, currentPath='') {
    if(obj == value) 
        return currentPath;

    if(typeof obj !== 'object')
        return;

    if(!obj) return;

    const keys = Object.keys(obj);
    const idx = keys.indexOf(value);
    if(idx != -1) {
        return `${currentPath}/${keys[idx]}`;
    } else {
        for(let key in obj) {
            let path = searchPathTo(obj[key], value, `${currentPath}/${key}`);
            if(path)
                return path;
        }
    }
}
