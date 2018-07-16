/**
 * @method a11yOnEnter
 * @summary create an "on Enter" handler with the supplied method
 * @param {Function} fn - function to be called on enter
 * @return {Function} event handler to be used onKeyUp, onKeyDown, or onKeyPress
 */
export function a11yOnEnter(fn) {
  return (event) => {
    if (event.keyCode !== 13) { return; }

    event.preventDefault();
    fn.call(this, event);
  };
}
