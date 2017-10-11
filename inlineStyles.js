var proto = Element.prototype;
var slice = Function.call.bind(Array.prototype.slice);
var matches = Function.call.bind(proto.matchesSelector ||
              proto.mozMatchesSelector || proto.webkitMatchesSelector ||
              proto.msMatchesSelector || proto.oMatchesSelector);

// Returns true if a DOM Element matches a cssRule
var elementMatchCSSRule = function(element, cssRule) {
  return matches(element, cssRule.selectorText);
};

// Returns true if a property is defined in a cssRule
var propertyInCSSRule = function(prop, cssRule) {
  return prop in cssRule.style && cssRule.style[prop] !== "";
};

// Here we get the cssRules across all the stylesheets in one array
var cssRules = slice(document.styleSheets).reduce(function(rules, styleSheet) {
  return rules.concat(slice(styleSheet.cssRules));
}, []);

function getAppliedCss(elm) {
  // get only the css rules that matches that element
  var elementRules = cssRules.filter(elementMatchCSSRule.bind(null, elm));
  var rules = [];
  var props = [];
  var propsClean = [];

  if(elementRules.length) {
    for(i = 0; i < elementRules.length; i++) {
      var e = elementRules[i];

      rules.push({
        order: i,
        text: e.cssText,
        selector: e.cssText.split('{')[0].trim()
      });
    }
  }

  if(elm.getAttribute('style')) {
    rules.push({
      order: elementRules.length,
      text: elm.getAttribute('style')
    });
  }

  rules.forEach(function (rule){
    if(rule.selector){
      props = rule.text.split('{')[1].trim().split('}')[0].trim().split(';');
    }else{
      props = rule.text.split(';');
    }

    propsClean = [];

    for(var n=0;n<props.length;n++){
      props[n] = props[n].trim();

      if(props[n]){
        propsClean.push('"' + props[n].split(':')[0].trim() + '":' + '"' + encodeURIComponent(props[n].split(':')[1].trim()) + '"');
      }
    }

    rule.props = JSON.parse('{' + propsClean.join(',') + '}');
  });

  return rules;
}

$(document).ready(function (){
  var allElems = $('body *').not('style').not('script');

  allElems.each(function (i, elem){
    var $elem = $(elem);
    var rules = getAppliedCss(elem);
    var styles = {};

    rules.forEach(function (rule){
      styles = $.extend(styles, rule.props, true);
    });

    for(var prop in styles){
      $elem.css(prop, $elem.css(prop));
    }
  });
});
