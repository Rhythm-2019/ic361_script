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

    /**
     * 
     * @param {string} path 
     * @returns element
     */
    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    /**
     * 
     * @param {Element} element 
     * @param {string} type 
     * @param {function} fn 
     */
    function addEventListener(element, type, fn) {
        //判断浏览器是否支持这个方法
        if (element.addEventListener) {
            element.addEventListener(type, fn, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, fn);
        } else {
            element["on" + type] = fn;
        }
    }

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

    // ------------------------ 主逻辑 ------------------------------
    GM_log("Running ic361 script...")
    GM_log(document.getElementsByClassName("mini-tree-selectedNode")[0])

    // TODO 判断【现货查询】窗口是否已经打开
    if (false) {
        bindSearchResultEvent()
    } else {
        // 在打开入口添加一个监听事件
        var menuButton = document.getElementsByClassName("mini-tree-selectedNode")[0].getElementsByClassName("mini-tree-nodetext")[0]
        addEventListener(menuButton, "click", function () {
            GM_log("Select 现货快查 menu")
            bindSearchResultEvent()
        });
    }

})();