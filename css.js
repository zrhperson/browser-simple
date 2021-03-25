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

function specificity(selector) {
    let p = [0,0,0,0];
    let selectorParts = selector.split(' ');
    for(let part of selectorParts) {
        if(part.charAt('0') == '#'){
            p[1] += 1;
        }else if(part.charAt('0') == '.'){
            p[2] += 1;
        }else{
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2) {
    if(sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    }else if(sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    }else if(sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    }
    return sp1[3] - sp2[3]
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
            let sp = specificity(rule.selectors[0])
            let computeStyle = element.computeStyle;
            for(let declaration of rule.declarations){
                if(!computeStyle[declaration.property]){
                    computeStyle[declaration.property] = {}
                }
                if(!computeStyle[declaration.property].specificity){
                    computeStyle[declaration.property].value = declaration.value;
                    computeStyle[declaration.property].specificity = sp
                }else if(compare(computeStyle[declaration.property].specificity, sp) < 0){
                    computeStyle[declaration.property].specificity = sp
                    computeStyle[declaration.property].value = declaration.value;
                }
            }
        }
    }
}

module.exports = { addCssRules, computeCss };