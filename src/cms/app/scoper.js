/* global exports */

function init() {
  var style = document.createElement('style');
  style.appendChild(document.createTextNode(''));
  document.head.appendChild(style);
  console.log('Scoper style added');
  style.sheet.insertRule('body { visibility: hidden; }', 0)
}

function scoper(css, prefix) {
  var re = new RegExp('([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)', 'g');
  css = css.replace(re, function (g0, g1, g2) {
    if (g1.match(/^\s*(@media|@keyframes|to|from)/)) {
      return g1 + g2
    }

    if (g1.match(/:scope/)) {
      g1 = g1.replace(/([^\s]*):scope/, function (h0, h1) {
        if (h1 === '') {
          return '> *'
        } else {
          return '> ' + h1
        }
      })
    }

    g1 = g1.replace(/^(\s*)/, '$1' + prefix + ' ');

    return g1 + g2
  });

  return css
}

function process(css) {
  var styles = document.querySelectorAll('style[scoped]');

  if (styles.length === 0) {
    document.getElementsByTagName('body')[0].style.visibility = 'visible';
    console.log('No styles found');
    return
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var newstyle = document.createElement('style');
  var csses = '';
  var style = document.querySelector('style[scoped]');
  //var css = document.querySelector('style[scoped]').innerHTML

  var i = 0;
  if (css) {
    var id = 'scoper-' + i;
    var prefix = '#' + id;

    var wrapper = document.createElement('span');
    wrapper.id = id;

    var parent = style.parentNode;
    var grandparent = parent.parentNode;

    grandparent.replaceChild(wrapper, parent);
    wrapper.appendChild(parent);
    style.parentNode.removeChild(style);

    csses = csses + scoper(css, prefix)
  }

  if (newstyle.styleSheet) {
    newstyle.styleSheet.cssText = csses
  } else {
    newstyle.appendChild(document.createTextNode(csses))
  }

  head.appendChild(newstyle);
  document.getElementsByTagName('body')[0].style.visibility = 'visible'
}

function scopeStyles() {
  'use strict';

  if ('scoped' in document.createElement('style')) {
    return
  }

  init();

  process()
}

export default {
  scopeStyles: scopeStyles,
  process: process
}
