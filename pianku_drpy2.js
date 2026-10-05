// -*- coding: utf-8 -*-
// 片库 (pianku.online) drpy2 爬虫脚本
// 适用于支持 drpy2 的 TVBox 衍生版本（如 OK影视、影视仓、TVBox 等）

const BASE_URL = "https://4k01.pianku.online";

function init(extend) {
    return JSON.stringify({
        "key": "pianku",
        "name": "片库",
        "type": 3,
        "api": "csp_Pianku",
        "searchable": 1,
        "quickSearch": 1,
        "filterable": 0
    });
}

function home(filter) {
    let classes = [
        {"type_id": "20", "type_name": "电影"},
        {"type_id": "21", "type_name": "动作片"},
        {"type_id": "22", "type_name": "喜剧片"},
        {"type_id": "23", "type_name": "爱情片"},
        {"type_id": "24", "type_name": "科幻片"},
        {"type_id": "25", "type_name": "恐怖片"},
        {"type_id": "26", "type_name": "剧情片"},
        {"type_id": "27", "type_name": "战争片"},
        {"type_id": "28", "type_name": "惊悚片"},
        {"type_id": "29", "type_name": "犯罪片"},
        {"type_id": "30", "type_name": "冒险片"},
        {"type_id": "31", "type_name": "动画片"},
        {"type_id": "32", "type_name": "悬疑片"},
        {"type_id": "33", "type_name": "武侠片"},
        {"type_id": "34", "type_name": "奇幻片"},
        {"type_id": "35", "type_name": "纪录片"},
        {"type_id": "36", "type_name": "其他片"},
        {"type_id": "37", "type_name": "连续剧"},
        {"type_id": "38", "type_name": "国产剧"},
        {"type_id": "39", "type_name": "日韩剧"},
        {"type_id": "40", "type_name": "欧美剧"},
        {"type_id": "41", "type_name": "港台剧"},
        {"type_id": "43", "type_name": "动漫"},
        {"type_id": "45", "type_name": "综艺"},
        {"type_id": "47", "type_name": "B站"}
    ];
    let homeVodList = [];
    let html = req(BASE_URL + "/", {});
    let $ = pyquery(html);
    $(".vod-item").each(function () {
        let item = $(this);
        let a = item.find("a").first();
        let detailUrl = a.attr("href") || "";
        let vodId = detailUrl.match(/\/voddetail\/(\d+)\.html/);
        if (!vodId) return;
        let title = item.find(".title").first().text().trim();
        let pic = item.find("img").first().attr("src") || "";
        let remarks = item.find(".remarks").first().text().trim();
        let subtitle = item.find(".subtitle").first().text().trim();
        homeVodList.push({
            "vod_id": vodId[1],
            "vod_name": title,
            "vod_pic": pic,
            "vod_remarks": remarks,
            "vod_year": subtitle ? subtitle.split("/")[0].trim() : ""
        });
    });
    return JSON.stringify({
        "class": classes,
        "list": homeVodList
    });
}

function homeVod() {
    return home({});
}

function category(tid, pg, filter, extend) {
    let url = BASE_URL + "/vodtype/" + tid + (pg > 1 ? "-" + pg : "") + ".html";
    let html = req(url, {});
    let $ = pyquery(html);
    let vodList = [];
    $(".vod-item").each(function () {
        let item = $(this);
        let a = item.find("a").first();
        let detailUrl = a.attr("href") || "";
        let vodId = detailUrl.match(/\/voddetail\/(\d+)\.html/);
        if (!vodId) return;
        let title = item.find(".title").first().text().trim();
        let pic = item.find("img").first().attr("src") || "";
        let remarks = item.find(".remarks").first().text().trim();
        let subtitle = item.find(".subtitle").first().text().trim();
        vodList.push({
            "vod_id": vodId[1],
            "vod_name": title,
            "vod_pic": pic,
            "vod_remarks": remarks,
            "vod_year": subtitle ? subtitle.split("/")[0].trim() : ""
        });
    });
    let pagecount = 999;
    let pageMatch = html.match(/\/vodtype\/\d+-(\d+)\.html[^>]*>尾页<\/a>/);
    if (pageMatch) pagecount = parseInt(pageMatch[1]);
    return JSON.stringify({
        "page": parseInt(pg),
        "pagecount": pagecount,
        "limit": vodList.length,
        "total": vodList.length * pagecount,
        "list": vodList
    });
}

function detail(ids) {
    let id = ids.split(",")[0];
    let url = BASE_URL + "/voddetail/" + id + ".html";
    let html = req(url, {});
    let $ = pyquery(html);

    let vodPic = $(".detail-poster img").first().attr("src") || "";
    let vodName = $(".detail-title").first().text().trim().replace(/\s+/g, " ");
    let vodRemarks = $(".detail-remarks").first().text().trim();
    // 从标题中移除 remarks
    if (vodRemarks && vodName.indexOf(vodRemarks) >= 0) {
        vodName = vodName.replace(vodRemarks, "").trim();
    }

    let typeName = "";
    let vodArea = "";
    let vodYear = "";
    let vodLang = "";
    let vodDirector = "";
    let vodActor = "";

    $(".detail-meta").each(function () {
        let text = $(this).text().trim();
        if (text.indexOf("分类：") >= 0) {
            typeName = $(this).find("a").first().text().trim();
        } else if (text.indexOf("地区：") >= 0) {
            vodArea = text.replace("地区：", "").trim();
        } else if (text.indexOf("年份：") >= 0) {
            vodYear = text.replace("年份：", "").trim();
        } else if (text.indexOf("语言：") >= 0) {
            vodLang = text.replace("语言：", "").trim();
        } else if (text.indexOf("导演：") >= 0) {
            vodDirector = text.replace("导演：", "").trim();
        } else if (text.indexOf("主演：") >= 0) {
            vodActor = text.replace("主演：", "").trim();
        }
    });

    let vodContent = $(".detail-desc p").first().text().trim();

    // 解析播放源
    let vodPlayFrom = [];
    let vodPlayUrl = [];
    let tabs = $(".source-tab-item");
    if (tabs.length > 0) {
        tabs.each(function (i) {
            let tab = $(this);
            let sourceName = tab.text().trim();
            let target = tab.attr("data-target") || "";
            vodPlayFrom.push(sourceName);
            let urls = [];
            $("#" + target + " .play-btn-item").each(function () {
                let btn = $(this);
                let epName = btn.text().trim();
                let epUrl = btn.attr("href") || "";
                if (epUrl) urls.push(epName + "$" + epUrl);
            });
            vodPlayUrl.push(urls.join("#"));
        });
    } else {
        // 单源无 tab 情况
        let urls = [];
        $(".play-btn-item").each(function () {
            let btn = $(this);
            let epName = btn.text().trim();
            let epUrl = btn.attr("href") || "";
            if (epUrl) urls.push(epName + "$" + epUrl);
        });
        if (urls.length > 0) {
            vodPlayFrom.push("片库");
            vodPlayUrl.push(urls.join("#"));
        }
    }

    let vod = {
        "vod_id": id,
        "vod_name": vodName,
        "vod_pic": vodPic,
        "type_name": typeName,
        "vod_year": vodYear,
        "vod_area": vodArea,
        "vod_lang": vodLang,
        "vod_remarks": vodRemarks,
        "vod_actor": vodActor,
        "vod_director": vodDirector,
        "vod_content": vodContent,
        "vod_play_from": vodPlayFrom.join("$$$"),
        "vod_play_url": vodPlayUrl.join("$$$")
    };

    return JSON.stringify({
        "list": [vod]
    });
}

function search(wd, quick, pg) {
    // 注意：片库搜索页有滑块验证码，直接请求可能返回验证页面
    // 尝试直接请求，如果失败返回空列表
    let url = BASE_URL + "/vodsearch/-------------.html?wd=" + encodeURIComponent(wd);
    let html = req(url, {});
    let vodList = [];
    if (html.indexOf("请完成验证") >= 0 || html.indexOf("SlideCaptcha") >= 0) {
        return JSON.stringify({
            "page": parseInt(pg),
            "pagecount": 0,
            "limit": 0,
            "total": 0,
            "list": [],
            "msg": "搜索需要验证码，暂不支持"
        });
    }
    let $ = pyquery(html);
    $(".vod-item").each(function () {
        let item = $(this);
        let a = item.find("a").first();
        let detailUrl = a.attr("href") || "";
        let vodId = detailUrl.match(/\/voddetail\/(\d+)\.html/);
        if (!vodId) return;
        let title = item.find(".title").first().text().trim();
        let pic = item.find("img").first().attr("src") || "";
        let remarks = item.find(".remarks").first().text().trim();
        vodList.push({
            "vod_id": vodId[1],
            "vod_name": title,
            "vod_pic": pic,
            "vod_remarks": remarks
        });
    });
    return JSON.stringify({
        "page": parseInt(pg),
        "pagecount": 1,
        "limit": vodList.length,
        "total": vodList.length,
        "list": vodList
    });
}

function play(flag, id, vipFlags) {
    // id 格式: /vodplay/{vod_id}-{sid}-{nid}.html
    let url = id;
    if (url.indexOf("http") !== 0) {
        url = BASE_URL + url;
    }
    let html = req(url, {});
    let playUrl = "";
    let match = html.match(/var\s+player_aaaa\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
        try {
            let playerData = JSON.parse(match[1]);
            playUrl = playerData.url || "";
        } catch (e) {
            // 尝试从 url 字段提取
            let urlMatch = match[1].match(/"url"\s*:\s*"([^"]+)"/);
            if (urlMatch) playUrl = urlMatch[1];
        }
    }
    return JSON.stringify({
        "parse": 1,
        "url": playUrl
    });
}
