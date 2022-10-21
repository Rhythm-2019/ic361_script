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

    const websiteMap = new Map()
    websiteMap.set('华强网', 'https://s.hqew.com/{0}.html')
    websiteMap.set('IC交易网', 'https://www.ic.net.cn/searchNic/{0}.html')
    websiteMap.set('正能量', 'https://www.bom.ai/ic/{0}.html')
    websiteMap.set('云汉', 'https://search.ickey.cn/?keyword={0}')
    websiteMap.set('立创', 'https://so.szlcsc.com/global.html?k={0}')
    websiteMap.set('贸泽', 'https://www.mouser.cn/c/?q={0}')
    websiteMap.set('Digikey', 'https://www.digikey.com/en/products/result?keywords={0}')
    websiteMap.set('淘宝', 'https://s.taobao.com/search?q={0}')
    

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

    function trimIdentify(identify) {
        // 处理括号
        let leftParenthesis = identify.indexOf('(')
        let rightParenthesis = identify.lastIndexOf(')')
        if (leftParenthesis != -1 && rightParenthesis != -1) {
            identify = identify.substring(0, leftParenthesis)
        }

        return identify
    }

    function addTooltips(elem, identify) {
        var html = '<ul style="list-style: none;"> <li style="display: inline; ">'
        for (const [key, value] of websiteMap) {
            html += `<a target="_blank" href="${String.format(value, trimIdentify(identify))}" style=" padding: 10px 10px; text-decoration: none; color: white; font-size:12px";> ${key} </a>`
        }
        html += '</li> </ul>'

        tippy(elem, {
            content: html,
            interactive: true,
            allowHTML: true,
        });
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
                            addTooltips(tdElem, tdElem.firstChild.firstChild.getAttribute('data-pn'))
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
        observer.observe(elem, { attributes: true, childList: true, subtree: true });
    })
})();