function GetProperties(app, data) {
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
}

function ApplyPatch(app, data, qPatches, qSoftPatch) {
    let res;
    console.log('ApplyPatches', qPatches);

    let params = {
        qPatches
    };

    if(typeof qSoftPatch != undefined) 
        params.qSoftPatch = qSoftPatch;

    if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
        res = app.global.session.rpc({
            "handle": data.result.qReturn.qHandle,
            "method": "ApplyPatches",
            "params": params
        })
    else 
        res = Promise.reject();

    return res;
}

function GetDimension(app, dimensionId) {
  return app.global.session.rpc({
    "handle": app.model.handle,
    "method": "GetDimension",
    "params": {
        "qId": dimensionId,
    }})
}

export function GetDimensionProperties(app, dimensionId) {
  return GetDimension(app, dimensionId).then(data => GetProperties(app, data));
}

export function dimensionApplyPatch(app, dimensionId, qPatches, qSoftPatch) {
  //   return app.model.engineApp.getDimension(dimensionId).then(
  //       model => model.applyPatches(qPatches)
  //     );
  // qSoftPatch - there is no need for the parameter. It doens't work with it.
  return GetDimension(app, dimensionId).then(data => ApplyPatch(app, data, qPatches));
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
  return GetMeasure(app, measureId).then(data => GetProperties(app, data));
}

export function measureApplyPatch(app, measureId, qPatches, qSoftPatch) {
  // qSoftPatch - there is no need for the parameter. It doens't work with it.
  return GetMeasure(app, measureId).then(data => ApplyPatch(app, data, qPatches));
}

function GetBookmark(app, bookmarkId) {
  return app.global.session.rpc({
    "handle": app.model.handle,
    "method": "GetBookmark",
    "params": {
        "qId": bookmarkId,
    }})
}

export function GetBookmarkProperties(app, bookmarkId) {
  return GetBookmark(app, bookmarkId).then(data => GetProperties(app, data));
}

export function bookmarkApplyPatch(app, bookmarkId, qPatches, qSoftPatch) {
  // qSoftPatch - there is no need for the parameter. It doens't work with it.
  return GetBookmark(app, bookmarkId).then(data => ApplyPatch(app, data, qPatches));
}

function GetVariable(app, varId) {
  return app.global.session.rpc({
    "handle": app.model.handle,
    "method": "GetVariableById",
    "params": {
        "qId": varId,
    }})
}

export function GetVariableProperties(app, varId) {
  return GetVariable(app, varId).then(data => GetProperties(app, data));
}

export function variableApplyPatch(app, varId, qPatches, qSoftPatch) {
  // qSoftPatch - there is no need for the parameter. It doens't work with it.
  return GetVariable(app, varId).then(data => ApplyPatch(app, data, qPatches));
}