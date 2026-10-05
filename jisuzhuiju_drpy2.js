// -*- coding: utf-8 -*-
// 极速追剧 (jisuzhuiju.com) drpy2 爬虫脚本
// 适用于支持 drpy2 的 TVBox 衍生版本

const BASE_URL = "https://jisuzhuiju.com";

// 分类 -> channel 映射
const CHANNEL_MAP = {
    "dianshiju": "1",   // 电视剧
    "dianying": "2",    // 电影
    "dongman": "3",     // 动漫
    "zongyi": "4"       // 综艺
};

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

function parseVodCard($, item) {
    let a = item.find("a").first();
    let detailUrl = a.attr("href") || "";
    let m = detailUrl.match(/\/detail\/(\d+)\.html/);
    if (!m) return null;
    let title = item.find(".vod-title").first().text().trim();
    let pic = item.find("img").first().attr("src") || "";
    let subtitle = item.find(".vod-subtitle").first().text().trim();
    return {
        "vod_id": m[1],
        "vod_name": title,
        "vod_pic": pic,
        "vod_remarks": subtitle,
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
    let html = req(BASE_URL + "/", {});
    let $ = pyquery(html);
    let list = [];
    $(".vod-card").each(function () {
        let item = $(this).parent();
        let vod = parseVodCard($, item);
        if (vod && vod.vod_name) list.push(vod);
    });
    return JSON.stringify({"class": classes, "list": list});
}

function homeVod() {
    return home({});
}

function category(tid, pg, filter, extend) {
    let channel = CHANNEL_MAP[tid] || "2";
    let url = BASE_URL + "/filter?channel=" + channel + "&type=&area=&year=&sort=hot&page=" + pg;
    let html = req(url, {});
    let $ = pyquery(html);
    let list = [];
    $(".vod-card").each(function () {
        let item = $(this).parent();
        let vod = parseVodCard($, item);
        if (vod && vod.vod_name) list.push(vod);
    });
    return JSON.stringify({"page": parseInt(pg), "pagecount": 9999, "limit": 12, "total": 99999, "list": list});
}

function detail(ids) {
    let id = ids;
    let url = BASE_URL + "/detail/" + id + ".html";
    let html = req(url, {});
    let $ = pyquery(html);
    let vod = {
        "vod_id": id,
        "vod_name": $(".detail-title").first().text().trim(),
        "vod_pic": $(".detail-cover img, .detail-poster img").first().attr("src") || $("meta[property='og:image']").attr("content") || "",
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
    // 类型
    let tags = [];
    $(".detail-tags .tag-pill").each(function () {
        tags.push($(this).text().trim());
    });
    vod.type_name = tags.join("/");
    // 元信息
    $(".detail-meta-grid .meta-item").each(function () {
        let label = $(this).find(".meta-label").text().trim();
        let value = $(this).find(".meta-value").text().trim();
        if (label.indexOf("主演") >= 0) vod.vod_actor = value;
        else if (label.indexOf("导演") >= 0) vod.vod_director = value;
        else if (label.indexOf("地区") >= 0) vod.vod_area = value;
        else if (label.indexOf("年份") >= 0) vod.vod_year = value;
        else if (label.indexOf("备注") >= 0) vod.vod_remarks = value;
    });
    // 简介
    vod.vod_content = $(".detail-desc, .detail-intro, .detail-content").first().text().trim() || $("meta[name='description']").attr("content") || "";
    // 播放源
    let playFrom = [];
    let playUrls = [];
    $(".source-panel").each(function () {
        let sourceKey = $(this).attr("data-key") || "";
        if (!sourceKey) return;
        // 找到对应的线路名
        let tabBtn = $(".source-tab[data-target='" + $(this).attr("id") + "']");
        let lineName = tabBtn.length > 0 ? tabBtn.first().text().trim() : sourceKey;
        playFrom.push(lineName);
        let eps = [];
        $(this).find(".episode-btn").each(function () {
            let epName = $(this).text().trim();
            let epHref = $(this).attr("href") || "";
            if (epHref) {
                eps.push(epName + "$" + epHref);
            }
        });
        playUrls.push(eps.join("#"));
    });
    vod.vod_play_from = playFrom.join("$$$");
    vod.vod_play_url = playUrls.join("$$$");
    return JSON.stringify({"list": [vod]});
}

function search(wd, quick, pg) {
    let url = BASE_URL + "/search?wd=" + encodeURIComponent(wd);
    let html = req(url, {});
    let $ = pyquery(html);
    let list = [];
    $(".vod-card").each(function () {
        let item = $(this).parent();
        let vod = parseVodCard($, item);
        if (vod && vod.vod_name) list.push(vod);
    });
    return JSON.stringify({"list": list});
}

function play(flag, id, vipFlags) {
    // id 格式: /vodplay/{vodId}-{playFrom}-{index}.html
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
