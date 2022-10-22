// ==UserScript==
// @name         IC全能王插件
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  增强，为IC全能王中搜索的型号添加其他平台的快捷链接
// @author       Rhythm-2019
// @match        http://beta.ic361.cn/q/xq2.aspx
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://unpkg.com/@popperjs/core@2
// @require      https://unpkg.com/tippy.js@6
// @require      https://cdnjs.cloudflare.com/ajax/libs/dot/1.1.3/doT.js
// @require      https://cdn.jsdelivr.net/npm/clipboard@2.0.6/dist/clipboard.min.js
// @updateURL    https://raw.githubusercontent.com/Rhythm-2019/ic361_script/master/main.js
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_setClipboard
// @grant GM_log
// @grant GM_xmlhttpRequest
// @grant unsafeWindow
// @grant window.close
// @grant window.focus
// ==/UserScript==

/* globals tippy */
(function () {

    const contentDivXpath = "//div[@id='dvInstockQ']/div[@class='mini-fit']/div[@class='mini-splitter mini-splitter-vertical']/div[@class='mini-splitter-border']/div[@class='mini-splitter-pane mini-splitter-pane1 mini-splitter-pane1-vertical']/div[@class='mini-fit grid_container']/div/div[@class='mini-panel-border mini-grid-border']/div[@class='mini-panel-viewport mini-grid-viewport']/div[@class='mini-panel-body mini-grid-rows']/div[@class='mini-grid-rows-view']"
    const observerConfig = { attributes: true, childList: true, subtree: true }

    const websitePropArray = [
        {name: '华强网', urlTempl: 'https://s.hqew.com/{0}.html'},
        {name: 'IC交易网', urlTempl: 'https://www.ic.net.cn/searchNic/{0}.html'},
        {name: '正能量', urlTempl: 'https://www.bom.ai/ic/{0}.html'},
        {name: '云汉', urlTempl: 'https://search.ickey.cn/?keyword={0}'},
        {name: '立创', urlTempl: 'https://so.szlcsc.com/global.html?k={0}'},
        {name: '贸泽', urlTempl: 'https://www.mouser.cn/c/?q={0}'},
        {name: 'Digikey', urlTempl: 'https://www.digikey.com/en/products/result?keywords={0}'},
        {name: '淘宝', urlTempl: 'https://s.taobao.com/search?q={0}'},
    ]

    const tipsTempl = `
        <ul style="list-style: none;"> 
            {{~ it.websitePropArray:item:index }}
            <li style="display: inline;">
                <span style="cursor: pointer; color: white; font-size: 10px;" onclick="window.open(String.format('{{=item.urlTempl}}', '{{=it.identify}}'), '_blank', 'noreferrer');">{{= item.name}}</span>
            </li> 
            {{~ }}
        </ul>
    `

    var tipsTempFn = doT.template(tipsTempl)

    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    function isElement(element) {
        return element instanceof Element || element instanceof HTMLDocument;
    }
    function runWhenReady(xpath, callback) {
        var numAttempts = 0;
        var tryNow = function () {
            var elem = getElementByXpath(xpath)
            if (elem) {
                callback(elem);
            } else {
                numAttempts++;
                if (numAttempts >= 34) {
                    console.warn('Giving up after 34 attempts. Could not find: ' + xpath);
                } else {
                    setTimeout(tryNow, 250 * Math.pow(1.1, numAttempts));
                }
            }
        };
        tryNow();
    }
    function addEventListener(element, type, fn) {
        if (element.addEventListener) {
            element.addEventListener(type, fn, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, fn);
        } else {
            element["on" + type] = fn;
        }
    }

    function normalizeIdentify(identify) {
        // 处理括号
        let leftParenthesis = identify.indexOf('(')
        let rightParenthesis = identify.lastIndexOf(')')
        if (leftParenthesis != -1 && rightParenthesis != -1) {
            identify = identify.substring(0, leftParenthesis)
        }

        return identify
    }

    function addTooltips(elem, identify) {
        console.log(tipsTempFn)
        tippy(elem, {
            content: tipsTempFn({identify: normalizeIdentify(identify), websitePropArray: websitePropArray}),
            interactive: true,
            allowHTML: true,
        });
    }
    function addClipboar(elem, identify) {
        var button = document.createElement('button')
        button.innerHTML = 'Copy'
        button.setAttribute('data-clipboard-text', identify)
        button.setAttribute('style', 'margin-left:10px')
        button.setAttribute('id', 'clipboar')

        new ClipboardJS('#clipboar');
        elem.firstChild.appendChild(button)
    }

    function mutationHandleFunc(mutationRecords, observer) {
        for (const mutationRecord of mutationRecords) {

            if (mutationRecord.type === 'childList' && mutationRecord.addedNodes.length != 0) {
                let tableElem = mutationRecord.addedNodes[0]
                // 由于添加浮动提示框也会触发这里的突发事件，所以这里进行了判断
                if (tableElem.tagName != 'TABLE') {
                    continue
                }
                for (let trElem of tableElem.firstChild.children) {
                    let trClassName = trElem.getAttribute('class')
                    if (trClassName == null || !trClassName.includes('mini-grid-row')) {
                        continue
                    }

                    for (let tdElem of trElem.children) {
                        if (tdElem.length == 0) {
                            continue
                        }
                        if (tdElem.firstChild != null && tdElem.firstChild.firstChild != null && isElement(tdElem.firstChild.firstChild)
                            && tdElem.firstChild.firstChild.getAttribute('data-pn') != null) {
                            
                            // 添加连接提示
                            addTooltips(tdElem, tdElem.firstChild.firstChild.getAttribute('data-pn'))
                            // 添加复制按钮
                            addClipboar(tdElem, tdElem.firstChild.firstChild.getAttribute('data-pn'))
                            break
                        }
                    }
                }
            }
        }
    }

    GM_log("Running ic361 script...")

    runWhenReady(contentDivXpath, (elem) => {
        GM_log('create obserer to content div')
        const observer = new MutationObserver(mutationHandleFunc);
        observer.observe(elem, observerConfig);
    })
})();