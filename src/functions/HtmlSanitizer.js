// JavaScript HTML Sanitizer v2.0.2, (c) Alexander Yumashev, Jitbit Software.
// homepage https://github.com/jitbit/HtmlSanitizer
// License: MIT https://github.com/jitbit/HtmlSanitizer/blob/master/LICENSE

// ADAPTED BY: rooyca (2024-06-16)

'use strict';

class HtmlSanitizer {
    constructor() {
        this._tagWhitelist = {
            'A': true, 'ABBR': true, 'B': true, 'BLOCKQUOTE': true, 'BODY': true, 'BR': true, 'CENTER': true, 'CODE': true, 'DD': true, 'DIV': true, 'DL': true, 'DT': true, 'EM': true, 'FONT': true,
            'H1': true, 'H2': true, 'H3': true, 'H4': true, 'H5': true, 'H6': true, 'HR': true, 'I': true, 'IMG': true, 'LABEL': true, 'LI': true, 'OL': true, 'P': true, 'PRE': true,
            'SMALL': true, 'SOURCE': true, 'SPAN': true, 'STRONG': true, 'SUB': true, 'SUP': true, 'TABLE': true, 'TBODY': true, 'TR': true, 'TD': true, 'TH': true, 'THEAD': true, 'UL': true, 'U': true, 'VIDEO': true
        };

        this._contentTagWhiteList = { 'FORM': true, 'GOOGLE-SHEETS-HTML-ORIGIN': true }; // tags that will be converted to DIVs
        this._attributeWhitelist = { 'align': true, 'color': true, 'controls': true, 'height': true, 'href': true, 'id': true, 'src': true, 'style': true, 'target': true, 'title': true, 'type': true, 'width': true };
        this._cssWhitelist = { 'background-color': true, 'color': true, 'font-size': true, 'font-weight': true, 'text-align': true, 'text-decoration': true, 'width': true };
        this._schemaWhiteList = ['http:', 'https:', 'data:', 'm-files:', 'file:', 'ftp:', 'mailto:', 'pw:']; // which "protocols" are allowed in "href", "src" etc
        this._uriAttributes = { 'href': true, 'action': true };
        this._parser = new DOMParser();
    }

    SanitizeHtml(input, extraSelector) {
        input = input.trim();
        if (input === "") return ""; // to save performance

        // firefox "bogus node" workaround for wysiwyg's
        if (input === "<br>") return "";

        if (input.indexOf("<body") === -1) input = "<body>" + input + "</body>"; // add "body" otherwise some tags are skipped, like <style>

        let doc = this._parser.parseFromString(input, "text/html");

        // DOM clobbering check (damn you firefox)
        if (doc.body.tagName !== 'BODY') doc.body.remove();
        if (typeof doc.createElement !== 'function') doc.createElement.remove();

        const makeSanitizedCopy = (node) => {
            let newNode;
            if (node.nodeType === Node.TEXT_NODE) {
                newNode = node.cloneNode(true);
            } else if (node.nodeType === Node.ELEMENT_NODE && (this._tagWhitelist[node.tagName] || this._contentTagWhiteList[node.tagName] || (extraSelector && node.matches(extraSelector)))) { // is tag allowed?

                if (this._contentTagWhiteList[node.tagName])
                    newNode = doc.createElement('DIV'); // convert to DIV
                else
                    newNode = doc.createElement(node.tagName);

                for (let i = 0; i < node.attributes.length; i++) {
                    let attr = node.attributes[i];
                    if (this._attributeWhitelist[attr.name]) {
                        if (attr.name === "style") {
                            for (let s = 0; s < node.style.length; s++) {
                                let styleName = node.style[s];
                                if (this._cssWhitelist[styleName])
                                    newNode.style.setProperty(styleName, node.style.getPropertyValue(styleName));
                            }
                        }
                        else {
                            if (this._uriAttributes[attr.name]) { // if this is a "uri" attribute, that can have "javascript:" or something
                                if (attr.value.indexOf(":") > -1 && !this.startsWithAny(attr.value, this._schemaWhiteList))
                                    continue;
                            }
                            newNode.setAttribute(attr.name, attr.value);
                        }
                    }
                }
                for (let i = 0; i < node.childNodes.length; i++) {
                    let subCopy = makeSanitizedCopy(node.childNodes[i]);
                    newNode.appendChild(subCopy, false);
                }

                // remove useless empty spans (lots of those when pasting from MS Outlook)
                if ((newNode.tagName === "SPAN" || newNode.tagName === "B" || newNode.tagName === "I" || newNode.tagName === "U") && newNode.innerHTML.trim() === "") {
                    return doc.createDocumentFragment();
                }

            } else {
                newNode = doc.createDocumentFragment();
            }
            return newNode;
        };

        let resultElement = makeSanitizedCopy(doc.body);

        return resultElement.innerHTML
            .replace(/<br[^>]*>(\S)/g, "<br>\n$1")
            .replace(/div><div/g, "div>\n<div"); // replace is just for cleaner code
    }

    startsWithAny(str, substrings) {
        for (let i = 0; i < substrings.length; i++) {
            if (str.indexOf(substrings[i]) === 0) {
                return true;
            }
        }
        return false;
    }

    get AllowedTags() {
        return this._tagWhitelist;
    }

    get AllowedAttributes() {
        return this._attributeWhitelist;
    }

    get AllowedCssStyles() {
        return this._cssWhitelist;
    }

    get AllowedSchemas() {
        return this._schemaWhiteList;
    }
}

export const sanitizer = new HtmlSanitizer();
export default HtmlSanitizer;
