var rule = {
    title: '片库',
    host: 'https://4k01.pianku.online',
    homeUrl: '/',
    url: '/vodtype/fyclass-fypage.html',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    class_name: '电影&连续剧&动漫&综艺',
    class_url: '20&38&43&45',
    推荐: '.vod-item;.title&&Text;.vod-pic img&&src;.remarks&&Text;a&&href',
    一级: '.vod-item;.title&&Text;.vod-pic img&&src;.remarks&&Text;a&&href',
    二级: {"title":".detail-title&&Text","desc":".detail-desc p&&Text","content":".detail-desc p&&Text","lists":".play-btn-item"}
};
