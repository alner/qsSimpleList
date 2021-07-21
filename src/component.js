//import loadCSS from './loadcss';
import initialProperties from './initialProperties';
import setupDefinition from './definition';
import setupPaint from './paint';

const global = window;
const defined = window.requirejs.defined;
const define = global.define || define;

define('resource-not-defined', function(){
  return null;
});

let dependencies = [
  'module',
  'qlik'
].map(function(path){
  // check if dependencies were defined...
  if(defined(path) || path === 'module')
    return path
  else
  if(path === 'qlik' && defined('js/qlik'))
    return 'js/qlik'
  else return 'resource-not-defined'
});

define(dependencies.concat("css!./styles.css"),
  function(module, Qlik){
    // const ROOT_URI = module.uri.split('/').slice(0, -1).join('/')
    //   || '/extensions/qsSimpleList';
    // loadCSS(`${ROOT_URI}/styles.css`);

    // if(module.hot) {
    //   module.hot.accept();
    // }

    const definition = setupDefinition({
      Qlik,
      setAlwaysOneSelectedValue(fieldName, isAlwaysOneSelected) {
        const app = Qlik.currApp();
        return app.global.session.rpc({
          "method": "GetField",
          "handle": app.model.handle,
          "params": [`${fieldName}`]
        }).then(function (response) {
          if(response.result && response.result.qReturn &&
            response.result.qReturn.qType === "Field") {
              let qHandle = response.result.qReturn.qHandle;
              app.global.session.rpc({
                "handle": qHandle,
                "method": "SetNxProperties",
                "params": {
                  "qProperties": {
                    "qOneAndOnlyOne": isAlwaysOneSelected
                  }
                }
              })
          }//if
        })
        .catch(function(e) {
          console.error(e);
        })
      }
    });
    const lifecycleMethods = setupPaint({ Qlik });

    return {
      initialProperties,
      definition,
      // paint,
      // resize,
      // destroy,
      ...lifecycleMethods,
      snapshot: {
        canTakeSnapshot : false
      }
    }
  }
);
