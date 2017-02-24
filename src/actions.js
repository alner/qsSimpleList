import { getSelectedObject } from './definitionUtils';
import { dimensionApplyPatch, measureApplyPatch, bookmarkApplyPatch, variableApplyPatch } from './engineApi';

export default function applyActions(app, layout, isSoftPatch) {
    const actions = layout.actions;
    if(!actions)
        return;

    const data = layout.qListObject.qDataPages[0].qMatrix;

    let values = data
        .filter((row) => isSelectedItem(row))
        .map(row => getFieldValue(row));

    let patches = {};
    actions.map(action => {
        if(action.action === 'ApplyPatch') // see definition.js
            applyPatchesAction(action, values, patches);
    });

    // ApplyPatch action only - post processing
    for (var id in patches) {
        let p = patches[id];
        let {object, objectType} = getSelectedObject(id);

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
    }
}

function applyPatchesAction(action, values, patches) {
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

export function getFieldValue(row) {
  return typeof row[0].qNum == 'number' ? row[0].qNum : row[0].qText;
}
