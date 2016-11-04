export function selectionEvents(props) {
  const self = this;
  let tid = null;

  const clearTimer = () => {
    if(tid) {
      clearTimeout(tid);
      tid = null;
    }
  };

  return {
    onClick: (e) => {
      self.base.onmousemove = null;
      clearTimer();
      //props.finishSelection(e);
      props.changeHandler && props.changeHandler(e);
    },

    onDragStart: (e) => {
      e.preventDefault();
      //clearTimer();
      //self.base.onmousemove = null;

      //tid = setTimeout(() => {
      props.changeSelection(e);
      self.base.onmousemove = (e) => {
        // props.changeHandler && props.changeHandler(e);
        // props.finishSelection(e);
        if(e.buttons > 0) {
          props.changeSelection(e);
        }
      }
      //}, 100);
    },

    // onMouseDown: (e) => {
    //   clearTimer();
    //   //self.base.onmousemove = null;
    //
    //   tid = setTimeout(() => {
    //     isDown = true;
    //     props.changeSelection(e);
    //   }, 100);
    //
    //   // tid = setTimeout(() => {
    //   //     props.changeSelection(e);
    //   //     self.base.onmousemove = (e) => {
    //   //       // props.changeHandler && props.changeHandler(e);
    //   //       // props.finishSelection(e);
    //   //       if(e.buttons > 0) {
    //   //         props.changeSelection(e);
    //   //       }
    //   //     }
    //   // }, 100);
    // },

    // onMouseMove: (e) => {
    //   if(e.buttons > 0) {
    //     console.log('Move', e);
    //     props.changeSelection(e);
    //   }
    // },

    onMouseUp: (e) => {
      self.base.onmousemove = null;
      clearTimer();
      props.finishSelection(e);
    },

    onMouseLeave: (e) => {
      props.finishSelection(e);
    },

    onTouchStart: (e) => {
      clearTimer();
      self.base.onmousemove = null;
      tid = setTimeout(() => {
        props.changeHandler && props.changeHandler(e);
        props.finishSelection(e);
      }, 250);
    },

    onTouchMove: (e) => {
      e.preventDefault();
      clearTimer();

      props.changeSelection(e);
    },

    onTouchEnd: (e) => {
      e.preventDefault();
      props.finishSelection(e);
    }
  }
}
