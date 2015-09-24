export function lazyLoader(context, load, dependencies, callback) {
    let keys = Object.keys(dependencies).filter((key) => {return !context[key]});
    let deps = keys.map((key) => {
        return dependencies[key];
    });

    return function(...args){
        load(deps, function(...libs) {
          keys.forEach((key, index) => {
            if(!context[key])
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
