Vue.component('vuedraggable', window.vuedraggable)
const vm = new Vue({
    el: '#app',
    components: {
        vuedraggable: window.vuedraggable,
    },
    watch: {
        'config.settings': {
            handler(val, prev) {
                // 数据发生改变后 保存新数据到db
                idbKeyval.set('config.settings', JSON.stringify(val));
            },
            deep: true
        },
        'config.background': {
            handler(val, prev) {
                // 背景图片size较大 单独处理 减少损耗
                idbKeyval.set('config.background', val);
            },
            deep: true
        },
        'bookmarks': {
            handler(val, prev) {
                // 实时保存书签到db
                idbKeyval.set('config.bookmarks', JSON.stringify(val));
            },
            deep: true
        },
        'live2d': {
            handler(val, prev) {
                idbKeyval.set('live2d', JSON.stringify(val));
            },
            deep: true
        },
        // 'live2d.open': {
        //     handler(val, prev) {
        //         this.loadLive2dResources(val);
        //     },
        //     deep: true
        // },
        'live2d.json': {
            handler(val, prev) {
                this.loadLive2dModel(val);
            },
            deep: true
        },
        'dialogs.settings': {
            handler(val, prev) {
                document.body.style.overflow = val ? 'hidden' : 'auto';
            },
            deep: true
        }
    },
    data: {
        config: {
            background: null,
            settings: {
                searchEngineDefaultIndex: 0,
                theme: 'white',
                background: {
                    opacity: 100
                },
                bookmarks: {
                    opacity: 88
                },
                bookmarksView: 'gui',
                weather: {
                    open: '1',
                    color: 'FFFFFF'
                }
            }
        },
        dialogs: {
            settings: false,
            settingsIcon: false
        },
        icon: {
            name: '',
            image: '',
            url: '',
            flag: 0,
            icon: false,
            i: null,
            j: null
        },
        search: {
            keyword: '',
            searchEngineIndex: 0,
            searchEngines: [
                {
                    name: "百度",
                    url: "https://www.baidu.com/s",
                    key: "wd"
                },
                {
                    name: "Bing",
                    url: "https://cn.bing.com/search",
                    key: "q"
                },
                {
                    name: "DuckGo",
                    url: "https://duckduckgo.com/",
                    key: "q"
                },
                {
                    name: "Google",
                    url: "https://www.google.com/search",
                    key: "q"
                }
            ],
            words: [],
            focusIndex: null,
            showSearchDatalist: false
        },
        bookmarks: [],
        bookmarksStringTemp: '',
        bookmarksCheck: true,
        options: {
            strictMode: false,
            key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
            q: {
                name: "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        },
        settingsMenus: {
            menu: [
                {
                    name: '基础样式',
                    icon: 'icon-settings'
                },
                {
                    name: '书签收藏',
                    icon: 'icon-favorites'
                },
                {
                    name: '导入导出',
                    icon: 'icon-save'
                },
                {
                    name: '模型加载',
                    icon: 'icon-customer-interests'
                },
                {
                    name: '关于本站',
                    icon: 'icon-info'
                }
            ],
            activeIndex: 0
        },
        live2d: {
            open: false,
            show: false,
            models: [{'name': '22娘', 'value': 'model/22/model.default.json'}, {
                'name': '33娘',
                'value': 'model/33/model.default.json'
            }, {'name': '羊栖菜', 'value': 'model/hijiki/hijiki.model.json'}, {
                'name': '山药泥',
                'value': 'model/tororo/tororo.model.json'
            }, {'name': '小埋', 'value': 'model/xiaomai/xiaomai.model.json'}, {
                'name': '碗中小年糕',
                'value': 'model/wanko/wanko.model.json'
            }, {'name': '血小板', 'value': 'model/platelet-3/kesyoban.model.json'}],
            json: ''
        }
    },
    methods: {
        /** 启动页面时调用 用于恢复数据到之前保存的状态 */
        init: function () {
            this.$refs.app.style.display = 'block';
            // 从db恢复图片 (异步)
            idbKeyval.get('config.settings').then((val) => {
                if (val) {
                    const json = JSON.parse(val);
                    json.searchEngineDefaultIndex = json.searchEngineDefaultIndex ? json.searchEngineDefaultIndex : 0;
                    vm.config.settings = json;
                    // 为之前已经有缓存的用户做补充
                    if (!vm.config.settings.weather) {
                        vm.config.settings.weather = {open: '1', color: 'FFFFFF'}
                    }
                    vm.search.searchEngineIndex = json.searchEngineDefaultIndex;
                }
                if (vm.config.settings.weather.open == 1) {
                    vm.loadWeather();
                }
            });
            idbKeyval.get('config.background').then((val) => {
                if (val) {
                    vm.config.background = val;
                } else {
                    vm.getDefaultImage();
                }
            });
            idbKeyval.get('live2d').then((val) => {
                if (val) {
                    const json = JSON.parse(val);
                    if (json.open) {
                        vm.live2d.open = json.open;
                        vm.loadLive2dResources(function () {
                            vm.live2d.json = json.json;
                        });

                    }
                }
            });
            this.jsonReset();
            // 搜索框获取焦点
            this.$refs.keyword.focus();
        },
        /** 获取默认背景图 用于用户首次访问 未上传过背景图时 这里使用Blob方式请求，并转换为base64缓存到db */
        getDefaultImage: function () {
            this.ajax(
                "get",
                "public/img/default.webp",
                null,
                "blob",
                function (file) {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(new Blob([file], {type: "image/webp"}));
                    fileReader.onload = function () {
                        vm.config.background = this.result;
                    }
                }
            )
        },
        /** 同上 首次访问 获取默认书签 */
        getDefaultBookmarks: function () {
            this.ajax(
                "get",
                "public/json/default.json",
                null,
                "application/json",
                function (json) {
                    if (json) {
                        vm.bookmarks = json;
                        vm.bookmarksStringTemp = JSON.stringify(json, null, 4);
                        vm.jsonCheck(json);
                    }
                }
            )
        },
        /** 按下搜索按钮或回车时跳转到搜索引擎网站 */
        doSearch: function () {
            const engine = this.search.searchEngines[this.search.searchEngineIndex];
            if (engine) {
                window.open(engine.url + "?" + engine.key + "=" + this.search.keyword);
            }
        },
        /** 搜索联想 目前所有引擎都用这个百度的联想，因为只发现百度有jsoup方式支持跨域请求 */
        doInput: function () {
            if (this.search.keyword) {
                this.jsonp("https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su", {
                    wd: this.search.keyword
                }, function (result) {
                    vm.search.words = result.s;
                });
            } else {
                this.search.words = [];
            }
        },
        /** 用于自定义搜索联想提示框的按键效果实现 键盘上键 */
        searchDataListOnKeyUp: function () {
            if (this.search.showSearchDatalist && this.search.words.length > 0) {
                // 第一次 或者已经到第一行 再按都重置到最后一行
                if (this.search.focusIndex == null || this.search.focusIndex == 0 || this.search.focusIndex > this.search.words.length) {
                    this.search.focusIndex = this.search.words.length - 1;
                } else {
                    this.search.focusIndex--;
                }
                this.search.keyword = this.search.words[this.search.focusIndex];
            } else {
                this.search.focusIndex = null;
            }
        },
        /** 用于自定义搜索联想提示框的按键效果实现 键盘下键 */
        searchDataListOnKeyDown: function () {
            if (this.search.showSearchDatalist && this.search.words.length > 0) {
                if (this.search.focusIndex == null || this.search.focusIndex >= this.search.words.length - 1) {
                    this.search.focusIndex = 0;
                } else {
                    this.search.focusIndex++;
                }
                this.search.keyword = this.search.words[this.search.focusIndex];
            } else {
                this.search.focusIndex = null;
            }
        },
        /** 搜索输入框获取焦点时 搜索联想提示框显示 */
        onSearchDatalistFocusIn: function () {
            this.search.showSearchDatalist = true;
        },
        /** 搜索输入框失去焦点时 搜索联想提示框消失 */
        onSearchDatalistFocusOut: function () {
            this.search.showSearchDatalist = false;
        },
        /** 更换背景图片 使用纯前端方式 上传文件后转base64格式 会在watch中自动存db */
        changeBackgroundImage: function (e) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function () {
                vm.config.background = this.result;
            }
        },
        /** 解析url 分解成 protocol host authority path 等 */
        parseUrl: function (url) {
            if (!url) {
                return '';
            }
            const o = this.options,
                m = o.parser[o.strictMode ? "strict" : "loose"].exec(url),
                uri = {};
            let i = 14;
            while (i--) {
                uri[o.key[i]] = m[i] || "";
            }
            uri[o.q.name] = {};
            uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                if ($1) uri[o.q.name][$1] = $2;
            });
            return uri;
        },
        /** 获取网站默认icon 如果配置中icon设为true 且image未设置 会去该网站首页下请求favicon.ico 作为默认icon ， 由于用户未必收藏的都是首页，通过parseUrl解析url后拼出首页 url + /favicon.ico */
        getImage: function (url) {
            const parse = this.parseUrl(url);
            return parse.protocol + '://' + parse.authority + '/favicon.ico';
        },
        /** 判断json格式是否正确 */
        jsonCheck: function () {
            try {
                const jsonValue = JSON.parse(this.bookmarksStringTemp);
                if (typeof jsonValue == "object" && jsonValue) {
                    this.bookmarksCheck = true;
                } else {
                    this.bookmarksCheck = false;
                }
            } catch (e) {
                this.bookmarksCheck = false;
            }
        },
        /** json格式化 */
        jsonFormat: function () {
            this.jsonCheck(this.bookmarksStringTemp);
            if (this.bookmarksCheck) {
                this.bookmarksStringTemp = JSON.stringify(JSON.parse(this.bookmarksStringTemp), null, 4);
            } else {
                alert('JSON格式出错');
            }
        },
        /** json压缩一行 */
        jsonCompress: function () {
            this.jsonCheck(this.bookmarksStringTemp);
            if (this.bookmarksCheck) {
                this.bookmarksStringTemp = JSON.stringify(JSON.parse(this.bookmarksStringTemp), null, 0);
            } else {
                alert('JSON格式出错');
            }
        },
        /** json 书签 保存到db (watch中实现) */
        jsonSave: function () {
            this.jsonCheck(this.bookmarksStringTemp);
            if (this.bookmarksCheck) {
                this.bookmarks = JSON.parse(this.bookmarksStringTemp);
                alert('保存成功!');
            } else {
                alert('JSON格式出错');
            }
        },
        /** json 书签重置 若db有值优先恢复成db db没有值则请求默认json ，一般用于配置json后格式出错无法保存的情况 */
        jsonReset: function () {
            idbKeyval.get('config.bookmarks').then((val) => {
                if (val) {
                    const parse = JSON.parse(val);
                    vm.bookmarks = parse;
                    vm.bookmarksStringTemp = JSON.stringify(parse, null, 4);
                    vm.jsonCheck(val);
                } else {
                    // 拿不到判定为首次访问，用默认覆盖
                    this.getDefaultBookmarks();
                }
            });
        },
        /** 封装 XMLHttpRequest 实现简单的ajax */
        ajax: function (method, url, data, resultType, success, error) {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            if (resultType) {
                if (resultType.search("json") == -1) {
                    xhr.responseType = 'arraybuffer';
                } else {
                    xhr.setRequestHeader("content-type", resultType);
                }
            }
            xhr.timeout = 60000;
            xhr.send(data);
            xhr.onreadystatechange = function () {
                // 仅处理完成状态
                if (xhr.readyState == 4) {
                    // 状态200判断为成功
                    if (xhr.status == 200) {
                        if (success) {
                            if (resultType.search("json") != -1) {
                                success(JSON.parse(xhr.responseText));
                            } else {
                                success(xhr.response);
                            }
                        }
                    } else {
                        if (error) {
                            error();
                        }
                    }
                }
            }
        },
        /** 对于支持jsoup方式跨域请求的简单封装 */
        jsonp: function (url, data, callback) {
            data = data || {};
            data.cb = 'callback';
            window.callback = function (data) {
                callback(data);
            };

            const script = document.createElement('script');
            const query = [];
            for (let key in data) {
                query.push(key + '=' + encodeURIComponent(data[key]));
            }
            script.src = url + '?' + query.join('&');
            document.head.appendChild(script);
            document.head.removeChild(script);
        },
        /** 导出所有配置并下载文件 */
        outPutSettings: async function () {
            const data = new Object();
            await idbKeyval.get('config.settings').then((val) => {
                if (val) data.settings = JSON.parse(val)
            });
            await idbKeyval.get('config.background').then((val) => {
                if (val) data.background = val;
            });
            await idbKeyval.get('config.bookmarks').then((val) => {
                if (val) data.bookmarks = JSON.parse(val)
            });
            const blob = new Blob(["\ufeff" + JSON.stringify(data)], {
                type: 'application/json;charset=utf-8;'
            });
            const anchor = document.createElement('a');
            anchor.href = URL.createObjectURL(blob);
            anchor.target = '_blank';
            anchor.download = '极简导航1.0-数据备份.json';
            anchor.click();
            alert('导出完成');
        },
        /** 导入配置文件恢复配置 */
        inPutSettings: function () {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = function (e) {
                const file = e.target.files[0];
                const fileReader = new FileReader();
                fileReader.readAsText(file, 'utf-8');
                fileReader.onload = function () {
                    const data = JSON.parse(this.result);
                    if (data.background) {
                        vm.config.background = data.background;
                        idbKeyval.set('config.background', data.background);
                    }
                    if (data.settings) {
                        vm.config.settings = data.settings;
                        idbKeyval.set('config.settings', JSON.stringify(data.settings))
                    }
                    if (data.bookmarks) {
                        vm.bookmarks = data.bookmarks;
                        idbKeyval.set('config.bookmarks', JSON.stringify(data.bookmarks))
                    }
                    alert('导入完成');
                }
            };
            input.click();
        },
        /** 全部配置重置为默认 */
        resetSettings: function () {
            if (confirm('确定要重置吗？所有设置都会被清除！')) {
                this.config.settings = {
                    theme: 'white',
                    background: {opacity: 100},
                    bookmarks: {opacity: 88},
                    bookmarksView: 'gui'
                };
                this.getDefaultImage();
                this.getDefaultBookmarks();
                alert('已重置！');
            }
        },
        /** 加载live2d的js资源 判断条件为 打开开关 且之前没有加载过本js (反复测试后发现，如果用户打开开关瞬间加载模型，会造成找不到方法而失败，这里加入show字段，用于控制加载完成后才允许选择模型) */
        loadLive2dResources: function (callback) {
            if (this.live2d.open) {
                let live2djs = document.querySelector('#live2djs');
                if (!live2djs) {
                    live2djs = document.createElement('script');
                    live2djs.onload = function () {
                        vm.live2d.show = true;
                        if (typeof callback === 'function') {
                            callback();
                        }
                    };
                    live2djs.id = 'live2djs';
                    live2djs.async = true;
                    live2djs.src = 'public/js/live2d.min.js';
                    document.body.appendChild(live2djs);
                } else {
                    this.live2d.show = true;
                }
            } else {
                this.live2d.show = false;
            }
        },
        loadLive2dModel: function (json) {
            if (json) loadlive2d('live2d', 'public/' + json);
        },
        deleteBookmarksGroup: function (name, i) {
            if (confirm('确定要删除 \'' + name + '\' 吗？')) {
                this.bookmarks.splice(i, 1);
            }
        },
        deleteBookmark: function (name, i, j) {
            if (confirm('确定要删除 \'' + name + '\' 吗？')) {
                this.bookmarks[i] && this.bookmarks[i].marks.splice(j, 1);
            }
        },
        newGroup: function () {
            this.bookmarks.push({"name": "", "marks": []});
        },
        newBookmark: function (i) {
            this.bookmarks[i] && this.bookmarks[i].marks.push({name: '', url: '', image: '', icon: false})
        },
        changeIcon: function (bookmark, i, j) {
            this.dialogs.settingsIcon = true;
            this.icon.name = bookmark.name;
            this.icon.url = bookmark.url ? bookmark.url : this.getImage(bookmark.url);
            this.icon.image = bookmark.image;
            this.icon.icon = bookmark.icon;
            this.icon.flag = bookmark.icon == false ? 2 : bookmark.image ? 0 : 1;
            this.icon.i = i;
            this.icon.j = j;
        },
        confirmIcon: function () {
            const mark = this.bookmarks[this.icon.i] && this.bookmarks[this.icon.i].marks[this.icon.j];
            mark.name = this.icon.name;
            mark.url = this.icon.url;
            mark.image = this.icon.flag == 1 ? null : this.icon.image;
            mark.icon = this.icon.flag == 2 ? false : true;
            this.icon = {
                name: '',
                image: '',
                url: '',
                flag: 0,
                icon: false,
                i: null,
                j: null
            };
            this.dialogs.settingsIcon = false;
        },
        uploadIcon: function (e) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function () {
                vm.icon.image = this.result;
                vm.icon.icon = true;
            }
        },
        /** 在我找到廉价的ip地址直接获取天气数据的方案之前，先用这个tianqiapi插件方案零时解决 */
        loadWeather: function () {
            const color = this.config.settings.weather.color;
            const iframe = document.createElement('iframe');
            iframe.src = 'https://widget.tianqiapi.com/?style=tv&skin=cake&color=' + color;
            iframe.frameBorder = 0;
            iframe.scrolling ='no';
            iframe.width = 255;
            iframe.height = 25;
            iframe.allowtransparency = 'true';
            iframe.style.display = 'block';
            const div = document.querySelector('#he-plugin-simple');
            div.appendChild(iframe);
        },
        openSettings: function (){
            // 由于部分功能用到的JS依赖，并非每次启动都需要用到， 每次加载会严重拖慢网站速度， 故打开设置后异步加载这些JS
            this.dialogs.settings = true;
            this.loadJavaScript('https://www.itxst.com/package/sortable/Sortable.min.js', true);
            this.loadJavaScript('https://www.itxst.com/package/vuedraggable/vuedraggable.umd.min.js', true);
            // <script src="https://www.itxst.com/package/sortable/Sortable.min.js"></script>
            // <script src="https://www.itxst.com/package/vuedraggable/vuedraggable.umd.min.js"></script>
        },
        loadJavaScript: function (src,async){
            const script = document.createElement('script');
            script.async = async;
            script.src = src;
            document.body.appendChild(script);
        }
    },
    mounted() {
        this.init();
    }
});

