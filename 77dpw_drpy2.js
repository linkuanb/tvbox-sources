var rule = {
    title: '66大片网',
    host: 'https://www.77dpw.vip',
    homeUrl: '/',
    url: '/vodtype/fyclass-fypage.html',
    searchUrl: '/vodsearch/----------wd---------.html',
    searchable: 1,quickSearch: 1,filterable: 0,
    class_name: '电影&动漫&剧集&短剧&综艺',
    class_url: '1&2&3&4&5',
    推荐: 'a.module-poster-item;.module-poster-item-title&&Text;.module-item-pic img&&data-original;.module-item-note&&Text;a&&href',
    一级: 'a.module-poster-item;.module-poster-item-title&&Text;.module-item-pic img&&data-original;.module-item-note&&Text;a&&href',
    二级: {
        title: '.module-info-heading&&Text',
        img: '.module-item-pic img&&data-original',
        desc: '.module-info-intro&&Text',
        content: '.module-info-intro-content&&Text',
        tabs: '.module-tab-item:eq(1)&&Text;.module-tab-item:eq(2)&&Text',
        lists: '.module-play-list:eq(0) a;.module-play-list:eq(1) a'
    }
};
