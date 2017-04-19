import { getSelectedObject } from './definitionUtils';
import { 
    dimensionApplyPatch, 
    measureApplyPatch, 
    bookmarkApplyPatch, 
    variableApplyPatch, 
    CallFieldAPIMethod } from './engineApi';

export default function applyActions(app, layout, isSoftPatch) {
    const actions = layout.actions;
    if(!actions)
        return;

    const data = layout.qListObject.qDataPages[0].qMatrix;

    let values = data
        .filter((row) => isSelectedItem(row))
        .map(row => getFieldValue(row));

    if(values.length == 0)
        return;

    let patches = {};
    // 1. Actions preprocessing (applyPatchesAction)
    actions.map(action => {
        // see definition.js
        if(action.action === 'ApplyPatch') 
            // patches should apply all in once for an object
            preparePatchesAction(action, values, patches);
    });

    // 2. Actions processing
    actions.map(action => {
        if(action.action === 'ApplyPatch') 
            applyPatchesAction(app, action, values, patches, isSoftPatch);
        else 
        if(action.action === 'FieldAPI')
            applyFieldAPIAction(app, action);
    });
}

function preparePatchesAction(action, values, patches) {
    if(!patches[action.object])
        patches[action.object] = [];

    if(action.isCustomValue && action.patchValue)
        values = action.patchValue.split(';'); // values delimited by ; consider as array

    patches[action.object].push({
        "qOp": action.patchOperation,
        "qPath": action.patchPath,
        "qValue": JSON.stringify(values.length == 1 ? values[0] : values )
    });
}

function applyPatchesAction(app, action, values, patches, isSoftPatch) {
    const p = patches[action.object]; 
    if(p) {
        // ApplyPatch action only - post processing
        //console.log(JSON.stringify(p));
        let {object, objectType} = getSelectedObject(action.object);

        switch(objectType) {
            case 'dimension':
                dimensionApplyPatch(app, object, p, isSoftPatch);
                break;

            case 'measure':
                measureApplyPatch(app, object, p, isSoftPatch);
                break;

            case 'bookmark':
                bookmarkApplyPatch(app, object, p, isSoftPatch);
                break;

            case 'variable':
                variableApplyPatch(app, object, p, isSoftPatch);
                break;

            case 'visualization':
            default:
                app.getObjectProperties(object).then(model => {
                        model.applyPatches(p, isSoftPatch);
                });
        }

        delete patches[action.object];
    }
}

function applyFieldAPIAction(app, action) {
    const { object, objectType } = getSelectedObject(action.object);
    if(object) {    
        const method = action.patchOperation;
        let params = {};
        if(action.patchValue && action.patchValue.length && action.patchValue.length > 0)
        try {
            params = JSON.parse(action.patchValue);
        } catch(ex) {
            console.error(ex, action.patchValue);
        }

        CallFieldAPIMethod(app, object, method, params);
    }
}

export function filterExcluded(hideExcluded, row) {
  const field = row[0];
  return (!hideExcluded ||
    (field.qState != 'X' && field.qState != 'XS' && field.qState != 'XL')
  );
}

export function isSelectedItem(row) {
  const fieldState = row[0];
  return fieldState.qState === 'S' || fieldState.qState === 'L';
}

export function isOptionalItem(row) {
    const fieldState = row[0];
    return fieldState.qState === 'O' || fieldState.qState === 'A';
}

export function getFieldValue(row) {
  return typeof row[0].qNum == 'number' ? row[0].qNum : row[0].qText;
}
