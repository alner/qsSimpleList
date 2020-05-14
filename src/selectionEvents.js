export function selectionEvents(props) {
  const self = this;
  let tid = null;
  const isAlwaysOneSelected = props.options && props.options.alwaysOneSelected;

  const clearTimer = () => {
    if(tid) {
      clearTimeout(tid);
      tid = null;
    }
  };

  return {
    onClick: (e) => {
      self.base.onmousemove = null;
      props.finishSelection(e);
      props.changeHandler && props.changeHandler(e);
    },

    onDragStart: (e) => {
      e.preventDefault();
      //self.base.onmousemove = null;

      props.changeSelection(e);
      self.base.onmousemove = (e) => {
        if(e.buttons > 0) {
          props.changeSelection(e);
        }
      }
    },

    onDragEnd: (e) => {
      self.base.onmousemove = null;
      //clearTimer();
      props.finishSelection(e);
    },

    onMouseUp: (e) => {
      self.base.onmousemove = null;
      //clearTimer();
      props.finishSelection(e);
    },

    onMouseLeave: (e) => {
      self.base.onmousemove = null;
      props.finishSelection(e);
    },

    onTouchStart: ((e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimer();
      self.base.onmousemove = null;
      tid = setTimeout(() => {
        props.changeHandler && props.changeHandler(e);
        props.finishSelection(e);
      }, 250);
    }),

    onTouchMove: !isAlwaysOneSelected && ((e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimer();
      props.changeSelection(e);
    }),

    onTouchEnd: (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimer();
      if(isAlwaysOneSelected) {
        props.changeHandler && props.changeHandler(e);
      } else {
        props.changeHandler && props.changeHandler(e);        
        props.finishSelection(e);
      }
    }
  }
}

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
