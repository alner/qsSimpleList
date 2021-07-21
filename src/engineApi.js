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

function getLayout(app, data) {
    return app.global.session.rpc({
        "handle": data.result.qReturn.qHandle,
        "method": "GetLayout",
        "params": []
    });
}

export function GetFieldList(app, 
    defaultListDef = {
        "qShowSystem": false,
        "qShowHidden": true,
        "qShowDerivedFields": true,
        "qShowSemantic": true,
        "qShowSrcTables": true,
        "qShowImplicit": true
    }) 
{
  return app.global.session.rpc({
	"name": "FIELDLIST",
	"method": "CreateSessionObject",
    "handle": app.model.handle,
    "params": [
			{
				"qInfo": {
					"qType": "FieldList"
				},
				"qFieldListDef": defaultListDef
			}
	] 
    }).then(data => getLayout(app, data));
}

export function DestroySessionObject(app, qId) {
  return app.global.session.rpc({
	"method": "DestroySessionObject",
    "handle": app.model.handle,
    "params": {
        "qId": qId
    }
  });
}

export function GetField(app, qFieldName, qStateName="") {
    return app.global.session.rpc({
        "handle": app.model.handle,
        "method": "GetField",
        "params": {
            "qFieldName": qFieldName,
            "qStateName": qStateName
        }
    });
}

function FieldAPIMethod(app, data, method, params) {
    let res;
    if(data.result && data.result.qReturn && data.result.qReturn.qHandle)
        res = app.global.session.rpc({
            "handle": data.result.qReturn.qHandle,
            "method": method,
            "params": params
        });
    else
        res = Promise.reject();

    return res;    
}

export function CallFieldAPIMethod(app, fieldname, method, params,  qStateName="") {
    return GetField(app, fieldname, qStateName)
    .then(data => FieldAPIMethod(app, data, method, params))
    .catch(e => console.error(e));
}