// -*- coding: utf-8 -*-
// 极速追剧 (jisuzhuiju.com) —— drpy2 规则式脚本
// 适用于 OK影视 / 影视仓 / TVBox 等基于 drpy2.min.js 的壳
// 播放地址需调用 /api/play-url 接口获取
var rule = {
    title: '极速追剧',
    host: 'https://jisuzhuiju.com',
    homeUrl: '/',
    url: '/filter?channel=fyclass&type=&area=&year=&sort=hot&page=fypage',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    headers: { 'User-Agent': 'MOBILE_UA' },
    class_name: '电视剧&电影&动漫&综艺',
    class_url: '1&2&3&4',
    double: false,
    推荐: 'a[href^="/detail/"];.vod-title&&Text;.vod-cover img&&src;.vod-subtitle&&Text;&&href',
    一级: 'a[href^="/detail/"];.vod-title&&Text;.vod-cover img&&src;.vod-subtitle&&Text;&&href',
    二级: {
        title: '.detail-title&&Text',
        img: '.detail-poster-wrapper img&&src',
        desc: '.detail-meta-grid&&Text',
        content: '.detail-meta-grid&&Text',
        tabs: '.source-tabs .source-tab',
        lists: '.source-panel:eq(#id) .episode-btn'
    },
    play_parse: true,
    lazy: 'js:let m=input.match(/\\/vodplay\\/(\\d+)-([^-]+)-(\\d+)\\.html/);if(m){let api=rule.host+"/api/play-url?vodId="+m[1]+"&playFrom="+encodeURIComponent(m[2])+"&index="+m[3];let resp=request(api,{headers:{Referer:rule.host+input}});try{let data=JSON.parse(resp);if(data.code===200&&data.url){input={parse:0,url:data.url}}}catch(e){}}'
};
