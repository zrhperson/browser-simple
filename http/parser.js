let currentToken = null;
let currentAttribute = null;

let stack = [{type: 'document', children: []}];
let currentTextNode = null;

function emit(token) {
    let top = stack[stack.length - 1];
    if(token.type === 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: [],
        };
        element.tagName = token.tagName;
        for(let key in token) {
            if(key != 'type' && key != 'tagName'){
                element.attributes.push({
                    name: key,
                    value: token[key],
                })
            }
        }

        top.children.push(element);
        element.parent = top;
        if(!token.isSelfClosing) {
            stack.push(element);
        }
        currentTextNode = null;
    }else if(token.type === 'endTag'){
        if(top.tagName != token.tagName) {
            throw new Error("error ====> 标签不对应");
        }else {
            stack.pop();
        }
        currentTextNode = null;
    }else if(token.type === 'text') {
        if(currentTextNode === null){
            currentTextNode = {
                type: 'text',
                content: '',
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

const EOF = Symbol('EOF');

function data(s) {
    if(s == '<') {
        return tagOpen;
    }else if( s === EOF){
        emit({
            type: 'EOF',
        });
        return ;
    }else {
        emit({
            type: 'text',
            content: s,
        });
        return data;
    }
}

function tagOpen(s) {
    if(s == '/'){
        return endTagOpen
    }else if(s.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: '',
        };
        return tagName(s)
    }else {
        emit({
            type: 'text',
            content: s,
        })
        return 
    }
}

function tagName(s) {
    if(s.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(s == '/') {
        return selfClosingStartTag;
    }else if(s.match(/^[A-Z]$/)) {
        currentToken.tagName += s;
        return tagName(s)
    }else if(s == '>'){
        emit(currentToken);
        return data;
    }else {
        currentToken.tagName += s;
        return tagName;
    }
}

function beforeAttributeName(s){
    if(s.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(s == '/' || s == '>' || s == EOF) {
        return afterAttributeName(s);
    }else if(s == '=') {
        
    }else {
        currentAttribute = {
            name: '',
            value: '',
        }
        return attributeName(s)
    }
}

function attributeName(s) {
    if(s.match(/^[\t\n\f ]$/) || s == '/' || s == '>' || s == EOF){
        return afterAttributeName(s);
    }else if(s == '=') {
        return beforeAttributeValue;
    }else if(s == '\u0000') {
        
    }else if(s == '\"' || s == "'" || s == '<'){

    }else {
        currentAttribute.name += s;
        return attributeName;
    }
}

function beforeAttributeValue(s) {
    if(s.match(/^[\t\n\f ]$/) || s == '/' || s == '>' || s == EOF){
        return beforeAttributeValue;
    }else if(s == '\"') {
        return doubleQuotedAttributeValue;
    }else if(s == '\'') {
        return singleQuotedAttributeValue;
    }else if(s == '>'){

    }else {
        return UnquotedAttributeValue(s);
    }
}

function doubleQuotedAttributeValue(s) {
    if(s == '\"'){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue
    }else if(s == '\u0000') {
        
    }else if(s == EOF){

    }else {
        currentAttribute.value += s
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(s) {
    if(s == '\''){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue
    }else if(s == '\u0000') {
        
    }else if(s == EOF){

    }else {
        currentAttribute.value += s
        return singleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(s) {
    if(s.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(s == '/') {
        return selfClosingStartTag;
    }else if(s == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(s == EOF){

    }else {
        // return beforeAttributeValue(s);
    }
}

function UnquotedAttributeValue(s) {
    if(s.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    }else if(s == '/') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }else if(s == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(s == '\u0000'){

    }else if(s == '\"' || s == '\'' || s == '<' || s == '=' || s == '`'){

    }else if(s == EOF){

    }else {
        currentAttribute.value  += s;
        return UnquotedAttributeValue;
    }
}

function afterAttributeName(s) {
    if(s.match(/^[\t\n\f ]$/)){
        return afterAttributeName;
    }else if(s == '/') {
        return selfClosingStartTag;
    }else if(s == '=') {
        return beforeAttributeValue;
    }else if(s == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(s == EOF){

    }else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: '',
            value: '',
        }
        return attributeName(s);
    }
}

function selfClosingStartTag(s) {
    if(s == '>'){
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if(s == EOF){

    }else {

    }
}

function endTagOpen(s) {
    if(s.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: 'endTag',
            tagName: '',
        }
        return tagName(s)
    }else if(s == '>') {
        
    }else if(s == EOF) {
        
    }else {

    }
}

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for(let s of html) {
        state = state(s);
    }
    state = state(EOF)
    return stack[0];
}