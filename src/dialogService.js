import {h, Component, render} from 'preact';

let popupNode;

export default function show(component,
    { DialogTitle = '', 
      LabelOK = 'OK', 
      LabelCancel, 
      width = '85%', 
      height = '85%',
      onApply }
  ) {
    if(!popupNode) {
      popupNode = document.createElement('div');
      popupNode.id = 'qsSimpleList-popupNode';
      popupNode.className = 'lui-modal-background sl-modal-background';
      //popupNode.style = 'background:rgba(0, 0, 0, 0.3);opacity:1;'; // redefine some lui-modal-background options
      setTimeout(() => {
        popupNode.onclick = function(e) {
          if(e.target == popupNode) {
            e.preventDefault();
            e.stopPropagation();
            close();
          }
        };
        popupNode.ontouchstart = popupNode.onclick;
      }, 500);
      document.body.appendChild(popupNode);      
    }

    const ApplyHandler = () => {
      close();
      if(onApply)
        onApply();
    };

    // dialog__body - just for selection
    const renderFunc = () =>
        render(
          <div className="lui-dialog" style={{
            width, height,
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}>
            <div class="lui-dialog__header">
              <div class="lui-dialog__title">{DialogTitle}</div>
            </div>
            <div className="lui-dialog__body dialog__body">
              {component}
            </div>
            <div className="lui-dialog__footer">
              { LabelCancel && 
              <button className="lui-button lui-dialog__button"
                onClick={close}
                onTouchStart={close}>
                  {LabelCancel}
              </button>
              }
              <button className="lui-button lui-dialog__button close-button"
                autofocus="true"
                onClick={ApplyHandler}
                onTouchStart={ApplyHandler}>
                  {LabelOK}
              </button>
            </div>
          </div>
        ,
        popupNode, popupNode.lastChild);

    renderFunc();

    return renderFunc;
}

function close() {
  if(popupNode) {
      popupNode.removeChild(popupNode.lastChild);
      document.body.removeChild(popupNode);
      popupNode = undefined;
      return true;
  }

  return false;
}

// export function isVisible() {
//   return popupNode != undefined
// }
