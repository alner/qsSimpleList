export function lazyLoader(context, load, dependencies, callback) {
    let keys = Object.keys(dependencies);
    let deps = keys.map((key) => dependencies[key]);

    return function(...args){
        load(deps, function(...libs) {
          keys.forEach((key, index) => {
            context[key] = libs[index];
          });
          callback(...args);
        });
    }
}

export function isDependeciesLoaded (context, dependencies)  {
  return Object.keys(dependencies).reduce((prevVal, currVal) => {
    return prevVal && context[currVal];
  }, true)
};
