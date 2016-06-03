import loadCSS from './loadcss';

const global = window;
const define = global.define || define;
const dependencies = ['module']; // 'css!./styles.css' Using the RequireJS CSS plugin is supported as of Qlik Sense 2.0
define(dependencies,
  function(module){
    const ROOT_URI = module.uri.split('/').slice(0, -1).join('/');
    const DEPENDENCIES_TO_LOAD = {
      React: `${ROOT_URI}/vendors/react.min`,
      _: `${ROOT_URI}/vendors/underscore-min`,
      Qlik: 'js/qlik'
    };

    loadCSS(`${ROOT_URI}/styles.css`);

    let initialProperties = require('./initialProperties');
    let definition = require('./definition');
    let {lazyLoader, isDependeciesLoaded} = require('./lazyLoad');
    let paintMethod = require('./paint');

    const injectAndCallPaintMethod = function(context, method, ...args) {
      context.paint = method;
      context.paint(...args);
    };
    // load into the global context required libraries using provided "map" object
    const lazyLoad = lazyLoader(global,
      global.require,
      DEPENDENCIES_TO_LOAD,
      injectAndCallPaintMethod);

    let paint = function ($element, layout) {
      let self = this;
      if(!isDependeciesLoaded(global, DEPENDENCIES_TO_LOAD))
        lazyLoad(self, paintMethod, $element, layout);
      else
        injectAndCallPaintMethod(self, paintMethod, $element, layout);
    };

    return {
      initialProperties,
      definition,
      paint,
      snapshot: {
        canTakeSnapshot : false
      }
    }
  }
);
