import loadCSS from './loadcss';
import initialProperties from './initialProperties';
import definition from './definition';
import setupPaint from './paint';

const global = window;
const defined = window.requirejs.defined;
const define = global.define || define;

define('resource-not-defined', function(){
  return null;
});

let dependencies = [
  'module',
  'qlik',
].map(function(path){
  // check if dependencies were defined...
  if(defined(path) || path === 'module')
    return path
  else
  if(path === 'qlik' && defined('js/qlik'))
    return 'js/qlik'
  else return 'resource-not-defined'
});

define(dependencies,
  function(module, Qlik){
    const ROOT_URI = module.uri.split('/').slice(0, -1).join('/');
    loadCSS(`${ROOT_URI}/styles.css`);

    //if(!global.Qlik)
    //  global.Qlik = Qlik;

    // const DEPENDENCIES_TO_LOAD = {
    //   //React: `${ROOT_URI}/vendors/react.min`,
    //   _: `${ROOT_URI}/vendors/underscore-min`,
    //   Qlik: 'js/qlik'
    // };

    //let initialProperties = require('./initialProperties');
    //let definition = require('./definition');
    //let paint = require('./paint');
    // let paint = ($element, layout) => {
    //   console.log($element, layout);
    // };
    //let {lazyLoader, isDependeciesLoaded} = require('./lazyLoad');
    // let paintMethod = require('./paint');
    //
    // const injectAndCallPaintMethod = function(context, method, ...args) {
    //   context.paint = method;
    //   context.paint(...args);
    // };
    // // load into the global context required libraries using provided "map" object
    // const lazyLoad = lazyLoader(global,
    //   global.require,
    //   DEPENDENCIES_TO_LOAD,
    //   injectAndCallPaintMethod);
    //
    // let paint = function ($element, layout) {
    //   let self = this;
    //   if(!isDependeciesLoaded(global, DEPENDENCIES_TO_LOAD))
    //     lazyLoad(self, paintMethod, $element, layout);
    //   else
    //     injectAndCallPaintMethod(self, paintMethod, $element, layout);
    // };

    const paint = setupPaint({ Qlik });

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
