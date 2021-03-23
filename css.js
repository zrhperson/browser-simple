const css = require("css");
let rules = [];

function addCssRules(text) {
  let ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
    if(!selector || !element.attributes){
        return false;
    }
    if(selector.charAt(0) == '#') {
        let attr = element.attributes.filter(attr => attr.name === "id")[0];
        if(attr && attr.value == selector.replace('#', '')){
            return true;
        }
    }else if(selector.charAt(0) == '.'){
        let attr = element.attributes.filter(attr => attr.name === "class")[0];
        if(attr && attr.value == selector.replace('.', '')){
            return true;
        }
    }else{
        if(element.tagName == selector){
            return true;
        }
    }
    return false;

}

function computeCss(element) {
    if(!element.computeStyle){
        element.computeStyle = {}
    }
    let ele = element;
    for(let rule of rules) {
        let selectorParts = rule.selectors[0].split(" ").reverse();
        let matched = false;
        if(!match(ele, selectorParts[0])){
            continue;
        }
        let j = 1;
        while(ele.parent){
            if(match(ele.parent, selectorParts[j])){
                j++
            }
            ele = ele.parent;
        }
        if(j >= selectorParts.length){
            matched = true;
        }
        if(matched){
            console.log("Element====>", element);
            console.log("matched====>", rule);
        }
    }
}

module.exports = { addCssRules, computeCss };