// ==UserScript==
// @name         IC全能王插件
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  增强，为IC全能王中搜索的型号添加其他平台的快捷链接
// @author       Rhythm-2019
// @match        http://beta.ic361.cn/q/xq2.aspx
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_setClipboard
// @grant GM_log
// @grant GM_xmlhttpRequest
// @grant unsafeWindow
// @grant window.close
// @grant window.focus
// ==/UserScript==

(function () {


    // ---------------------------- 公共函数 --------------------------



    function insertFloatWindow() {
        var idElements = getElementByXpath("//*[contains(@id,'$cell$12')]/div/a")
        if (idElements.length == 0) {
            GM_log("no result need to add float window")
            return
        }
        GM_log(`${idElements} need to add float window`)

        // 添加当鼠标移动到元素上，插入一个浮动框
        idElements.forEach(element => {
            var span = document.createElement('div');
            element.onmouseover = function () {
                span.innerHTML = `
                <span style = "width: 100px; border: 1px solid black; position: absolute; top: 50px; left: 3px">
                    <ul>
                        <li><a href="https://s.hqew.com/$(id).html">华强网</a><li>
                    </ul>
                </span>
            `
                element.parentNode.appendChild(span)
            }
            element.onmouseleave = function () {
                span.innerText = '';
            }
        });
    }

   
    function bindSearchResultEvent() {

        // 监听回车事件
        addEventListener(document, "keyup", function (e) {
            GM_log("trigger keyup event ")
            var event = e || window.event;
            var key = event.which || event.keyCode || event.charCode;
            if (key == 13) {
                insertFloatWindow()
            }
        })

        // TODO 监听查询点击事件

        // TODO 监听点击型号事件
    }



    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    function runWhenReady(xpath, callback) {
        var numAttempts = 0;
        var tryNow = function () {
            var elem = getElementByXpath(xpath)
            console.log(elem)
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
    function callback(mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
            } else if (mutation.type === 'attributes') {
                console.log(`The ${mutation.attributeName} attribute was modified.`);
            } else {
                console.log(`${mutation}`);
            }
        }
    }
    GM_log("Running ic361 script...")
    
    runWhenReady('//*[@id="5$cell$1"]/div/div/span[2]/span[2]', (elem) => {
        GM_log('menu button is loaded')
        addEventListener(elem, 'click', () => {
            GM_log('menu button is clicked')
            runWhenReady('/html/body/div[1]/div[4]/div/div/div[2]/div/table/tbody/tr/td[2]/div[2]/div/div/div/div/div/div[1]/div[2]/div/div/div[2]/div[4]/div[2]/div/table', (elem) => {
                GM_log('table is loaded')
                // 为什么这里的 Elem 是外部的
                const observer = new MutationObserver(callback);
                observer.observe(elem, { attributes: true, childList: true, subtree: true });
            })
        })
    })


})();