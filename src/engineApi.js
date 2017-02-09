function GetDimension(app, dimensionId) {
  return app.global.session.rpc({
    "handle": app.model.handle,
    "method": "GetDimension",
    "params": {
        "qId": dimensionId,
    }})
}

export function GetDimensionProperties(app, dimensionId) {
  return GetDimension(app, dimensionId)
    .then((data) => {
        let res;
        if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
            res = app.global.session.rpc({
            "handle": data.result.qReturn.qHandle,
            "method": "GetProperties",
            "params": {},
            })
        else 
            res = Promise.reject();

        return res;
    })
}

export function dimensionApplyPatch(app, dimensionId, qPatches, qSoftPatch) {
  //   return app.model.engineApp.getDimension(dimensionId).then(
  //       model => model.applyPatches(qPatches)
  //     );
  // qSoftPatch - there is no need for the parameter. It doens't work with it.
  return GetDimension(app, dimensionId)
    .then((data) => {
        let res;
        if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
            res = app.global.session.rpc({
                "handle": data.result.qReturn.qHandle,
                "method": "ApplyPatches",
                "params": {
                    qPatches                    
                }
            })
        else 
            res = Promise.reject();

        return res;
    })
}

function GetMeasure(app, measureId) {
  return app.global.session.rpc({
    "handle": app.model.handle,
    "method": "GetMeasure",
    "params": {
        "qId": measureId,
    }})
}

export function GetMeasureProperties(app, measureId) {
  return GetMeasure(app, measureId)
    .then((data) => {
        let res;
        if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
            res = app.global.session.rpc({
            "handle": data.result.qReturn.qHandle,
            "method": "GetProperties",
            "params": {},
            })
        else 
            res = Promise.reject();

        return res;
    })
}

export function measureApplyPatch(app, measureId, qPatches, qSoftPatch) {
  // qSoftPatch - there is no need for the parameter. It doens't work with it.
  return GetMeasure(app, measureId)
    .then((data) => {
        let res;
        if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
            res = app.global.session.rpc({
                "handle": data.result.qReturn.qHandle,
                "method": "ApplyPatches",
                "params": {
                    qPatches                    
                }
            })
        else 
            res = Promise.reject();

        return res;
    })
}