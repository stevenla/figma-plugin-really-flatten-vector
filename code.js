function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
var $20d88460e26b527b$exports = {};
var $c2a702e645480fab$exports = {};
var $6cab3b74aa13c4e8$exports = {};
var $6cab3b74aa13c4e8$var$tagRegExp = /(<\/?[a-z][a-z0-9]*(?::[a-z][a-z0-9]*)?\s*(?:\s+[a-z0-9-_]+=(?:(?:'[\s\S]*?')|(?:"[\s\S]*?")))*\s*\/?>)|([^<]|<(?![a-z\/]))*/gi, $6cab3b74aa13c4e8$var$attrRegExp = /\s[a-z0-9-_]+\b(\s*=\s*('|")[\s\S]*?\2)?/gi, $6cab3b74aa13c4e8$var$splitAttrRegExp = /(\s[a-z0-9-_]+\b\s*)(?:=(\s*('|")[\s\S]*?\3))?/gi, $6cab3b74aa13c4e8$var$startTagExp = /^<[a-z]/, $6cab3b74aa13c4e8$var$selfCloseTagExp = /\/>$/, $6cab3b74aa13c4e8$var$closeTagExp = /^<\//, $6cab3b74aa13c4e8$var$nodeNameExp = /<\/?([a-z][a-z0-9]*)(?::([a-z][a-z0-9]*))?/i, $6cab3b74aa13c4e8$var$attributeQuotesExp = /^('|")|('|")$/g, $6cab3b74aa13c4e8$var$noClosingTagsExp = /^(?:area|base|br|col|command|embed|hr|img|input|link|meta|param|source)/i;
var $76eeb9737d33397b$exports = {};
//https://developer.mozilla.org/en-US/docs/Web/API/Element
function $76eeb9737d33397b$var$Node(cfg) {
    this.namespace = cfg.namespace || null;
    this.text = cfg.text;
    this._selfCloseTag = cfg.selfCloseTag;
    Object.defineProperties(this, {
        nodeType: {
            value: cfg.nodeType
        },
        nodeName: {
            value: cfg.nodeType == 1 ? cfg.nodeName : '#text'
        },
        childNodes: {
            value: cfg.childNodes
        },
        firstChild: {
            get: function() {
                return this.childNodes[0] || null;
            }
        },
        lastChild: {
            get: function() {
                return this.childNodes[this.childNodes.length - 1] || null;
            }
        },
        parentNode: {
            value: cfg.parentNode || null
        },
        attributes: {
            value: cfg.attributes || []
        },
        innerHTML: {
            get: function() {
                var result = '', cNode;
                for(var i = 0, l = this.childNodes.length; i < l; i++){
                    cNode = this.childNodes[i];
                    result += cNode.nodeType === 3 ? cNode.text : cNode.outerHTML;
                }
                return result;
            }
        },
        outerHTML: {
            get: function() {
                if (this.nodeType != 3) {
                    var str, attrs = (this.attributes.map(function(elem) {
                        return elem.name + (elem.value ? '="' + elem.value + '"' : '');
                    }) || []).join(' '), childs = '';
                    str = '<' + this.nodeName + (attrs ? ' ' + attrs : '') + (this._selfCloseTag ? '/' : '') + '>';
                    if (!this._selfCloseTag) {
                        childs = (this._selfCloseTag ? '' : this.childNodes.map(function(child) {
                            return child.outerHTML;
                        }) || []).join('');
                        str += childs;
                        str += '</' + this.nodeName + '>';
                    }
                } else str = this.textContent;
                return str;
            }
        },
        textContent: {
            get: function() {
                if (this.nodeType == $76eeb9737d33397b$var$Node.TEXT_NODE) return this.text;
                else return this.childNodes.map(function(node) {
                    return node.textContent;
                }).join('').replace(/\x20+/g, ' ');
            }
        }
    });
}
$76eeb9737d33397b$var$Node.prototype.getAttribute = function(attributeName) {
    for(var i = 0, l = this.attributes.length; i < l; i++){
        if (this.attributes[i].name == attributeName) return this.attributes[i].value;
    }
    return null;
};
function $76eeb9737d33397b$var$searchElements(root, conditionFn, onlyFirst) {
    var result = [];
    onlyFirst = !!onlyFirst;
    if (root.nodeType !== 3) for(var i = 0, l = root.childNodes.length; i < l; i++){
        if (root.childNodes[i].nodeType !== 3 && conditionFn(root.childNodes[i])) {
            result.push(root.childNodes[i]);
            if (onlyFirst) break;
        }
        result = result.concat($76eeb9737d33397b$var$searchElements(root.childNodes[i], conditionFn));
    }
    return onlyFirst ? result[0] : result;
}
$76eeb9737d33397b$var$Node.prototype.getElementsByTagName = function(tagName) {
    return $76eeb9737d33397b$var$searchElements(this, function(elem) {
        return elem.nodeName == tagName;
    });
};
$76eeb9737d33397b$var$Node.prototype.getElementsByClassName = function(className) {
    var expr = new RegExp('^(.*?\\s)?' + className + '(\\s.*?)?$');
    return $76eeb9737d33397b$var$searchElements(this, function(elem) {
        return elem.attributes.length && expr.test(elem.getAttribute('class'));
    });
};
$76eeb9737d33397b$var$Node.prototype.getElementById = function(id) {
    return $76eeb9737d33397b$var$searchElements(this, function(elem) {
        return elem.attributes.length && elem.getAttribute('id') == id;
    }, true);
};
$76eeb9737d33397b$var$Node.prototype.getElementsByName = function(name) {
    return $76eeb9737d33397b$var$searchElements(this, function(elem) {
        return elem.attributes.length && elem.getAttribute('name') == name;
    });
};
$76eeb9737d33397b$var$Node.ELEMENT_NODE = 1;
$76eeb9737d33397b$var$Node.TEXT_NODE = 3;
$76eeb9737d33397b$exports = $76eeb9737d33397b$var$Node;


function $6cab3b74aa13c4e8$var$findByRegExp(html, selector, onlyFirst) {
    var result = [], tagsCount = 0, tags = html.match($6cab3b74aa13c4e8$var$tagRegExp), composing = false, currentObject = null, matchingSelector, fullNodeName, selfCloseTag, attributes, attrBuffer, attrStr, buffer, tag;
    for(var i = 0, l = tags.length; i < l; i++){
        tag = tags[i];
        fullNodeName = tag.match($6cab3b74aa13c4e8$var$nodeNameExp);
        matchingSelector = selector.test(tag);
        if (matchingSelector && !composing) composing = true;
        if (composing) {
            if ($6cab3b74aa13c4e8$var$startTagExp.test(tag)) {
                selfCloseTag = $6cab3b74aa13c4e8$var$selfCloseTagExp.test(tag) || $6cab3b74aa13c4e8$var$noClosingTagsExp.test(fullNodeName[1]);
                attributes = [];
                attrStr = tag.match($6cab3b74aa13c4e8$var$attrRegExp) || [];
                for(var aI = 0, aL = attrStr.length; aI < aL; aI++){
                    $6cab3b74aa13c4e8$var$splitAttrRegExp.lastIndex = 0;
                    attrBuffer = $6cab3b74aa13c4e8$var$splitAttrRegExp.exec(attrStr[aI]);
                    attributes.push({
                        name: attrBuffer[1].trim(),
                        value: (attrBuffer[2] || '').trim().replace($6cab3b74aa13c4e8$var$attributeQuotesExp, '')
                    });
                }
                (currentObject && currentObject.childNodes || result).push(buffer = new $76eeb9737d33397b$exports({
                    nodeType: 1,
                    nodeName: fullNodeName[1],
                    namespace: fullNodeName[2],
                    attributes: attributes,
                    childNodes: [],
                    parentNode: currentObject,
                    startTag: tag,
                    selfCloseTag: selfCloseTag
                }));
                tagsCount++;
                if (!onlyFirst && matchingSelector && currentObject) result.push(buffer);
                if (selfCloseTag) tagsCount--;
                else currentObject = buffer;
            } else if ($6cab3b74aa13c4e8$var$closeTagExp.test(tag)) {
                if (currentObject.nodeName == fullNodeName[1]) {
                    currentObject = currentObject.parentNode;
                    tagsCount--;
                }
            } else currentObject.childNodes.push(new $76eeb9737d33397b$exports({
                nodeType: 3,
                text: tag,
                parentNode: currentObject
            }));
            if (tagsCount == 0) {
                composing = false;
                currentObject = null;
                if (onlyFirst) break;
            }
        }
    }
    return onlyFirst ? result[0] || null : result;
}
function $6cab3b74aa13c4e8$var$Dom(rawHTML) {
    this.rawHTML = rawHTML;
}
$6cab3b74aa13c4e8$var$Dom.prototype.getElementsByClassName = function(className) {
    var selector = new RegExp('class=(\'|")(.*?\\s)?' + className + '(\\s.*?)?\\1');
    return $6cab3b74aa13c4e8$var$findByRegExp(this.rawHTML, selector);
};
$6cab3b74aa13c4e8$var$Dom.prototype.getElementsByTagName = function(tagName) {
    var selector = new RegExp('^<' + tagName, 'i');
    return $6cab3b74aa13c4e8$var$findByRegExp(this.rawHTML, selector);
};
$6cab3b74aa13c4e8$var$Dom.prototype.getElementById = function(id) {
    var selector = new RegExp('id=(\'|")' + id + '\\1');
    return $6cab3b74aa13c4e8$var$findByRegExp(this.rawHTML, selector, true);
};
$6cab3b74aa13c4e8$var$Dom.prototype.getElementsByName = function(name) {
    return this.getElementsByAttribute('name', name);
};
$6cab3b74aa13c4e8$var$Dom.prototype.getElementsByAttribute = function(attr, value) {
    var selector = new RegExp('\\s' + attr + '=(\'|")' + value + '\\1');
    return $6cab3b74aa13c4e8$var$findByRegExp(this.rawHTML, selector);
};
$6cab3b74aa13c4e8$exports = $6cab3b74aa13c4e8$var$Dom;


function $c2a702e645480fab$var$DomParser() {}
$c2a702e645480fab$var$DomParser.prototype.parseFromString = function(html) {
    return new $6cab3b74aa13c4e8$exports(html);
};
$c2a702e645480fab$exports = $c2a702e645480fab$var$DomParser;


$20d88460e26b527b$exports = $c2a702e645480fab$exports;


var $8658ba70bd42f784$var$__awaiter = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var $8658ba70bd42f784$var$__generator = undefined && undefined.__generator || function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
};
var $8658ba70bd42f784$var$__read = undefined && undefined.__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
};
var $8658ba70bd42f784$var$__spreadArray = undefined && undefined.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2) {
        for(var i = 0, l = from.length, ar; i < l; i++)if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function $8658ba70bd42f784$var$isContainerNode(node) {
    return node.type === "INSTANCE" || node.type === "FRAME" || node.type === "COMPONENT" || node.type === "GROUP";
}
function $8658ba70bd42f784$var$cloneFrame(ref) {
    var clone = figma.createFrame();
    clone.name = ref.name;
    // clone.fills = "fills" in ref ? ref.fills : [];
    clone.fills = [];
    clone.resize(ref.width, ref.height);
    clone.x = ref.x;
    clone.y = ref.y;
    clone.rotation = "rotation" in ref ? ref.rotation : 0;
    return clone;
}
function $8658ba70bd42f784$var$detachAndUnion(nodes) {
    var clones = nodes.map(function(node) {
        return node.clone();
    });
    var frameClones = clones.map(function(node) {
        return $8658ba70bd42f784$var$cloneFrame(node);
    });
    clones.filter($8658ba70bd42f784$var$isContainerNode).forEach(function(node, i) {
        return figma.union([
            node
        ], frameClones[i]);
    });
    frameClones.forEach(function(node) {
        return node.findChildren(function(child) {
            return child.type === "VECTOR";
        }).map(function(child) {
            return child.outlineStroke();
        });
    });
    return frameClones;
}
var $8658ba70bd42f784$var$getSinglePath = function(svgstring) {
    var parser = new (/*@__PURE__*/$parcel$interopDefault($20d88460e26b527b$exports))();
    // let svgDOM = parser.parseFromString(svgstring, "image/svg+xml");
    var svgDOM = parser.parseFromString(svgstring);
    var svgEl = svgDOM.getElementsByTagName("svg")[0];
    var paths = svgEl.getElementsByTagName("path");
    // console.log(paths);
    // throw new Error();
    var svgD = $8658ba70bd42f784$var$__spreadArray([], $8658ba70bd42f784$var$__read(paths), false).map(function(path) {
        return path.getAttribute("d");
    });
    var joinedD = svgD.join(" ");
    return {
        data: joinedD,
        size: {
            width: svgEl.getAttribute("width"),
            height: svgEl.getAttribute("height")
        },
        viewBox: svgEl.getAttribute("viewBox")
    };
};
// somehow unioning something a million times with itself will flatten it out
// pretty nicely. i have no clue why this works but it does.
function $8658ba70bd42f784$var$reallyFlattenNodes() {
    return $8658ba70bd42f784$var$__awaiter(this, void 0, void 0, function() {
        var detachedNodes, promises;
        var _this = this;
        return $8658ba70bd42f784$var$__generator(this, function(_a1) {
            switch(_a1.label){
                case 0:
                    detachedNodes = $8658ba70bd42f784$var$detachAndUnion(figma.currentPage.selection);
                    promises = detachedNodes.map(function(node) {
                        return $8658ba70bd42f784$var$__awaiter(_this, void 0, void 0, function() {
                            var rawSVGNode, outputNode, exportOutput, svgString, reexportOutput, reexportedSVGString, outputVector, e_1;
                            return $8658ba70bd42f784$var$__generator(this, function(_a) {
                                switch(_a.label){
                                    case 0:
                                        rawSVGNode = null;
                                        outputNode = null;
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([
                                            1,
                                            4,
                                            ,
                                            5
                                        ]);
                                        return [
                                            4 /*yield*/ ,
                                            node.exportAsync({
                                                format: "SVG"
                                            })
                                        ];
                                    case 2:
                                        exportOutput = _a.sent();
                                        svgString = String.fromCharCode.apply(String, $8658ba70bd42f784$var$__spreadArray([], $8658ba70bd42f784$var$__read(exportOutput), false));
                                        rawSVGNode = figma.createNodeFromSvg(svgString);
                                        figma.flatten([
                                            figma.union(rawSVGNode.children, rawSVGNode)
                                        ]);
                                        return [
                                            4 /*yield*/ ,
                                            rawSVGNode.exportAsync({
                                                format: "SVG"
                                            })
                                        ];
                                    case 3:
                                        reexportOutput = _a.sent();
                                        reexportedSVGString = String.fromCharCode.apply(null, reexportOutput);
                                        outputNode = figma.createNodeFromSvg(reexportedSVGString);
                                        outputVector = outputNode.children[0];
                                        outputVector.fills = [
                                            {
                                                type: "SOLID",
                                                color: {
                                                    r: 0,
                                                    g: 0,
                                                    b: 0
                                                }
                                            }
                                        ];
                                        outputNode.x = node.x + node.width + 20;
                                        outputNode.y = node.y;
                                        outputNode.name = "flatten(".concat(node.name, ")");
                                        node.remove();
                                        rawSVGNode === null || rawSVGNode === void 0 || rawSVGNode.remove();
                                        return [
                                            3 /*break*/ ,
                                            5
                                        ];
                                    case 4:
                                        e_1 = _a.sent();
                                        console.error(e_1);
                                        return [
                                            3 /*break*/ ,
                                            5
                                        ];
                                    case 5:
                                        return [
                                            2 /*return*/ 
                                        ];
                                }
                            });
                        });
                    });
                    return [
                        4 /*yield*/ ,
                        Promise.all(promises)
                    ];
                case 1:
                    _a1.sent();
                    return [
                        2 /*return*/ 
                    ];
            }
        });
    });
}
function $8658ba70bd42f784$var$main() {
    return $8658ba70bd42f784$var$__awaiter(this, void 0, void 0, function() {
        var e_2;
        return $8658ba70bd42f784$var$__generator(this, function(_a) {
            switch(_a.label){
                case 0:
                    _a.trys.push([
                        0,
                        2,
                        ,
                        3
                    ]);
                    return [
                        4 /*yield*/ ,
                        $8658ba70bd42f784$var$reallyFlattenNodes()
                    ];
                case 1:
                    _a.sent();
                    return [
                        3 /*break*/ ,
                        3
                    ];
                case 2:
                    e_2 = _a.sent();
                    return [
                        3 /*break*/ ,
                        3
                    ];
                case 3:
                    figma.closePlugin();
                    return [
                        2 /*return*/ 
                    ];
            }
        });
    });
}
$8658ba70bd42f784$var$main();


//# sourceMappingURL=code.js.map
