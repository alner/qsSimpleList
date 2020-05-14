import {h, Component, render} from 'preact';

export function createPopupService() {

  let isPopup = false;
  let popupNode;
  let popupOffset, popupWidth, popupHeight;

  function showAsPopup(component) {
    //popupNode = document.body.getElementsByClassName('sl-popup')[0];
    if(!popupNode) {
      popupNode = document.createElement("div");
      popupNode.className = "sl-popup sl-popup-tooltip"; // qv-tooltip qvt-generic-tooltip
      popupNode.style.left = `${popupOffset.left}px`;
      popupNode.style.top = `${popupOffset.top}px`;
      if(popupWidth)
        popupNode.style.width = `${popupWidth}px`;
      if(popupHeight)
        popupNode.style.height = `${popupHeight}px`;

      document.body.appendChild(popupNode);
    }
    //let cloned = cloneElement(simpleListComponent, {});
    render(component, popupNode, popupNode.lastChild);
    //componentToShow = component;
    isPopup = true;
  }

  function removePopupIfExists() {
    // popupNode = document.getElementsByClassName('sl-popup')[0];
    if(popupNode) {
        popupNode.removeChild(popupNode.lastChild);
        isPopup = false;
        document.body.removeChild(popupNode);
        popupNode = undefined;
        return true;
    }

    return false;
  }

  function isPopupShow() {
    return isPopup;
  }

  function setPopupShow(value, {
    offset, width, height
  } = {}) {
    const w = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

    const h = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

    const WIDTH_PAD = 10;
    const HEIGHT_PAD = 10;

    if(offset)
      popupOffset = offset
    else if(!popupOffset)
      popupOffset = {top: 0, left: 0};

    if(width || !popupWidth)
      popupWidth = WIDTH_PAD + Math.max(width, 120);

    if(height || !popupHeight)
      popupHeight = HEIGHT_PAD + Math.min(height, 254);


    if(popupOffset.left + popupWidth > w)
      popupOffset.left = Math.max(0, w - popupWidth - WIDTH_PAD - 1);

    if(popupOffset.top + popupHeight > h)
      popupOffset.top = Math.max(0, h - popupHeight - HEIGHT_PAD - 1);

    isPopup = value;
  }

  return {
    showAsPopup,
    removePopupIfExists,
    isPopupShow,
    setPopupShow
  }
}
