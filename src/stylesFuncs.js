export function alignmentStyles(styles, options) {
  const centerHorizontal = options.centerHorizontal;
  const centerVertical = options.centerVertical;
  const itemsLayout = options.itemsLayout;          
  if(centerHorizontal) {
    styles.display = 'flex';
    styles.height = 'auto';
    styles.justifyContent = 'center';
    //styles.textAlign = 'center';
    if(options.spaceEvenly)
      styles.justifyContent = 'space-evenly';

    if(itemsLayout == 'v') {
      styles.height = '100%';
      styles.flexDirection = 'column';
    }
  }
  if(centerVertical) {
    styles.display = 'flex';
    styles.height = '100%';
    styles.alignItems = 'center';
    if(options.spaceEvenly)
      styles.justifyContent = 'space-evenly';            
    if(itemsLayout == 'v')
      styles.flexDirection = 'column';            
  }
}