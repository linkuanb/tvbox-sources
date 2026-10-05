// -*- coding: utf-8 -*-
// 片库 (pianku.online) —— drpy2 规则式脚本
// 适用于 OK影视 / 影视仓 / TVBox 等基于 drpy2.min.js 的壳
// 站点为苹果CMS结构，播放页 player_aaaa.url 为直链 m3u8
var rule = {
    title: '片库',
    host: 'https://4k01.pianku.online',
    homeUrl: '/',
    url: '/vodtype/fyclass-fypage.html',
    searchUrl: '/vodsearch/-------------.html?wd=**',
    searchable: 0,            // 站点搜索有滑块验证码，关闭
    quickSearch: 0,
    filterable: 0,
    headers: { 'User-Agent': 'MOBILE_UA' },
    class_name: '电影&动作片&喜剧片&爱情片&科幻片&恐怖片&剧情片&战争片&惊悚片&犯罪片&冒险片&动画片&悬疑片&武侠片&奇幻片&纪录片&其他片&连续剧&国产剧&日韩剧&欧美剧&港台剧&动漫&综艺',
    class_url: '20&21&22&23&24&25&26&27&28&29&30&31&32&33&34&35&36&37&38&39&40&41&43&45',
    double: false,
    推荐: '.vod-item;.title&&Text;.vod-pic img&&src;.remarks&&Text;a&&href',
    一级: '.vod-item;.title&&Text;.vod-pic img&&src;.remarks&&Text;a&&href',
    二级: {
        title: '.detail-title&&Text',
        img: '.detail-poster img&&src',
        desc: '.detail-meta&&Text',
        content: '.detail-desc&&Text',
        tabs: '.source-tabs .source-tab-item',
        lists: '.source-content .source-pane:eq(#id) .play-btn-item'
    },
    play_parse: true,
    lazy: 'js:let u=input;if(u.indexOf("http")!==0){u=rule.host+u}let html=request(u);let m=html.match(/player_aaaa\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*<\\/script>/);let j={};try{j=JSON.parse(m[1])}catch(e){}if(j.url){input={parse:0,url:j.url}}'
};
