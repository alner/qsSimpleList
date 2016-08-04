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
    const ROOT_URI = module.uri.split('/').slice(0, -1).join('/')
      || '/extensions/qsSimpleList';
    loadCSS(`${ROOT_URI}/styles.css`);

    const {paint, destroy} = setupPaint({ Qlik });

    return {
      initialProperties,
      definition,
      paint,
      destroy,
      snapshot: {
        canTakeSnapshot : false
      }
    }
  }
);
