// -*- coding: utf-8 -*-
// 极速追剧 (jisuzhuiju.com) drpy2 爬虫脚本
// 自包含版本: 使用 WebView 原生 API, 不依赖外部框架的 req/pyquery

const BASE_URL = "https://jisuzhuiju.com";

const CHANNEL_MAP = {
    "dianshiju": "1",
    "dianying": "2",
    "dongman": "3",
    "zongyi": "4"
};

// === 自包含 req 函数 (同步 XMLHttpRequest) ===
function req(url, options) {
    options = options || {};
    let xhr = new XMLHttpRequest();
    let method = options.method || "GET";
    xhr.open(method, url, false);
    xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36");
    if (options.headers) {
        for (let k in options.headers) {
            xhr.setRequestHeader(k, options.headers[k]);
        }
    }
    try {
        xhr.send(options.body || null);
        return xhr.responseText || "";
    } catch (e) {
        return "";
    }
}

// === 自包含 pyquery 函数 (基于 DOMParser) ===
function pyquery(html) {
    let doc = new DOMParser().parseFromString(html, "text/html");

    function make(nodes) {
        nodes = nodes || [];
        let obj = {
            length: nodes.length,
            each: function(cb) {
                for (let i = 0; i < nodes.length; i++) {
                    cb.call(nodes[i], i, nodes[i]);
                }
                return obj;
            },
            find: function(sel) {
                let found = [];
                for (let i = 0; i < nodes.length; i++) {
                    let list = nodes[i].querySelectorAll(sel);
                    for (let j = 0; j < list.length; j++) found.push(list[j]);
                }
                return make(found);
            },
            first: function() {
                return nodes.length > 0 ? make([nodes[0]]) : make([]);
            },
            parent: function() {
                let parents = [];
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].parentNode) parents.push(nodes[i].parentNode);
                }
                return make(parents);
            },
            text: function() {
                let t = "";
                for (let i = 0; i < nodes.length; i++) t += nodes[i].textContent || "";
                return t;
            },
            attr: function(name) {
                return nodes.length > 0 ? (nodes[0].getAttribute(name) || "") : "";
            }
        };
        return obj;
    }

    function $(selector) {
        if (typeof selector === "string") {
            return make(Array.from(doc.querySelectorAll(selector)));
        } else if (selector instanceof Element || selector instanceof Document) {
            return make([selector]);
        } else if (Array.isArray(selector)) {
            return make(selector);
        }
        return make([]);
    }
    return $;
}

function init(extend) {
    return JSON.stringify({
        "key": "jisuzhuiju",
        "name": "极速追剧",
        "type": 3,
        "api": "csp_JisuZhuiju",
        "searchable": 1,
        "quickSearch": 1,
        "filterable": 0
    });
}

function parseVodCard($, cardEl) {
    // cardEl 是 .vod-card 元素, 其父元素是 <a href="/detail/xxx.html">
    let a = cardEl.parentNode;
    let detailUrl = a.getAttribute("href") || "";
    let m = detailUrl.match(/\/detail\/(\d+)\.html/);
    if (!m) return null;
    let titleEl = cardEl.querySelector(".vod-title");
    let imgEl = cardEl.querySelector("img");
    let subEl = cardEl.querySelector(".vod-subtitle");
    return {
        "vod_id": m[1],
        "vod_name": titleEl ? titleEl.textContent.trim() : "",
        "vod_pic": imgEl ? (imgEl.getAttribute("src") || "") : "",
        "vod_remarks": subEl ? subEl.textContent.trim() : "",
        "vod_year": ""
    };
}

function home(filter) {
    let classes = [
        {"type_id": "dianshiju", "type_name": "电视剧"},
        {"type_id": "dianying", "type_name": "电影"},
        {"type_id": "dongman", "type_name": "动漫"},
        {"type_id": "zongyi", "type_name": "综艺"}
    ];
    let html = req(BASE_URL + "/");
    let $ = pyquery(html);
    let list = [];
    let cards = document.querySelectorAll ? null : null;
    // 重新解析以便用原生 DOM
    let doc = new DOMParser().parseFromString(html, "text/html");
    let vodCards = doc.querySelectorAll(".vod-card");
    for (let i = 0; i < vodCards.length; i++) {
        let vod = parseVodCard($, vodCards[i]);
        if (vod && vod.vod_name) list.push(vod);
    }
    return JSON.stringify({"class": classes, "list": list});
}

function homeVod() {
    return home({});
}

function category(tid, pg, filter, extend) {
    let channel = CHANNEL_MAP[tid] || "2";
    let url = BASE_URL + "/filter?channel=" + channel + "&type=&area=&year=&sort=hot&page=" + pg;
    let html = req(url);
    let doc = new DOMParser().parseFromString(html, "text/html");
    let list = [];
    let vodCards = doc.querySelectorAll(".vod-card");
    for (let i = 0; i < vodCards.length; i++) {
        let vod = parseVodCard(null, vodCards[i]);
        if (vod && vod.vod_name) list.push(vod);
    }
    return JSON.stringify({"page": parseInt(pg), "pagecount": 9999, "limit": 12, "total": 99999, "list": list});
}

function detail(ids) {
    let id = ids;
    let url = BASE_URL + "/detail/" + id + ".html";
    let html = req(url);
    let doc = new DOMParser().parseFromString(html, "text/html");
    let vod = {
        "vod_id": id,
        "vod_name": "",
        "vod_pic": "",
        "type_name": "",
        "vod_year": "",
        "vod_area": "",
        "vod_remarks": "",
        "vod_actor": "",
        "vod_director": "",
        "vod_content": "",
        "vod_play_url": "",
        "vod_play_from": ""
    };
    let titleEl = doc.querySelector(".detail-title");
    if (titleEl) vod.vod_name = titleEl.textContent.trim();
    let posterEl = doc.querySelector(".detail-poster img") || doc.querySelector("meta[property='og:image']");
    if (posterEl) vod.vod_pic = posterEl.getAttribute("content") || posterEl.getAttribute("src") || "";
    // 元信息
    let metaItems = doc.querySelectorAll(".detail-meta-grid .meta-item");
    for (let i = 0; i < metaItems.length; i++) {
        let labelEl = metaItems[i].querySelector(".meta-label");
        let valueEl = metaItems[i].querySelector(".meta-value");
        if (!labelEl || !valueEl) continue;
        let label = labelEl.textContent.trim();
        let value = valueEl.textContent.trim();
        if (label.indexOf("主演") >= 0) vod.vod_actor = value;
        else if (label.indexOf("导演") >= 0) vod.vod_director = value;
        else if (label.indexOf("地区") >= 0) vod.vod_area = value;
        else if (label.indexOf("年份") >= 0) vod.vod_year = value;
        else if (label.indexOf("备注") >= 0) vod.vod_remarks = value;
    }
    // 简介
    let descEl = doc.querySelector(".detail-desc, .detail-intro, .detail-content");
    if (descEl) vod.vod_content = descEl.textContent.trim();
    else {
        let descMeta = doc.querySelector("meta[name='description']");
        if (descMeta) vod.vod_content = descMeta.getAttribute("content") || "";
    }
    // 播放源
    let playFrom = [];
    let playUrls = [];
    let panels = doc.querySelectorAll(".source-panel");
    for (let i = 0; i < panels.length; i++) {
        let panelId = panels[i].getAttribute("id") || "";
        if (!panelId) continue;
        let tabBtn = doc.querySelector(".source-tab[data-target='" + panelId + "']");
        let lineName = tabBtn ? tabBtn.textContent.trim() : panelId;
        playFrom.push(lineName);
        let eps = [];
        let epBtns = panels[i].querySelectorAll(".episode-btn");
        for (let j = 0; j < epBtns.length; j++) {
            let epName = epBtns[j].textContent.trim();
            let epHref = epBtns[j].getAttribute("href") || "";
            if (epHref) eps.push(epName + "$" + epHref);
        }
        playUrls.push(eps.join("#"));
    }
    vod.vod_play_from = playFrom.join("$$$");
    vod.vod_play_url = playUrls.join("$$$");
    return JSON.stringify({"list": [vod]});
}

function search(wd, quick, pg) {
    let url = BASE_URL + "/search?wd=" + encodeURIComponent(wd);
    let html = req(url);
    let doc = new DOMParser().parseFromString(html, "text/html");
    let list = [];
    let vodCards = doc.querySelectorAll(".vod-card");
    for (let i = 0; i < vodCards.length; i++) {
        let vod = parseVodCard(null, vodCards[i]);
        if (vod && vod.vod_name) list.push(vod);
    }
    return JSON.stringify({"list": list});
}

function play(flag, id, vipFlags) {
    let m = id.match(/\/vodplay\/(\d+)-([^-]+)-(\d+)\.html/);
    if (!m) {
        return JSON.stringify({"parse": 0, "url": ""});
    }
    let vodId = m[1];
    let playFrom = m[2];
    let index = m[3];
    let apiUrl = BASE_URL + "/api/play-url?vodId=" + vodId + "&playFrom=" + encodeURIComponent(playFrom) + "&index=" + index;
    let headers = {"Referer": BASE_URL + "/vodplay/" + vodId + "-" + playFrom + "-" + index + ".html"};
    let resp = req(apiUrl, {"headers": headers});
    try {
        let data = JSON.parse(resp);
        if (data.code === 200 && data.url) {
            return JSON.stringify({"parse": 0, "url": data.url});
        }
    } catch (e) {}
    return JSON.stringify({"parse": 0, "url": ""});
}
