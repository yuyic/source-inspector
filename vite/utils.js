// const ALL_SCRIPT_REGEX = /(<script[\s\S]*?>)[\s\S]*?<\/script>/gi;
// const SCRIPT_TAG_REGEX =
//     /<(script)\s+((?!type=('|")text\/ng-template\3).)*?>.*?<\/\1>/is;
// const SCRIPT_SRC_REGEX = /.*\ssrc=('|")?([^>'"\s]+)/;
// const SCRIPT_TYPE_REGEX = /.*\stype=('|")?([^>'"\s]+)/;
// const SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;
// const SCRIPT_ASYNC_REGEX = /.*\sasync\s*.*/;
// const SCRIPT_NO_MODULE_REGEX = /.*\snomodule\s*.*/;
// const SCRIPT_MODULE_REGEX = /.*\stype=('|")?module('|")?\s*.*/;
// const LINK_TAG_REGEX = /<(link)\s+.*?>/gis;
// const LINK_PRELOAD_OR_PREFETCH_REGEX = /\srel=('|")?(preload|prefetch)\1/;
// const LINK_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
// const LINK_AS_FONT = /.*\sas=('|")?font\1.*/;
// const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
// const STYLE_TYPE_REGEX = /\s+rel=('|")?stylesheet\1.*/;
// const STYLE_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
// const HTML_COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
// const LINK_IGNORE_REGEX = /<link(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;
// const STYLE_IGNORE_REGEX = /<style(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;
// const SCRIPT_IGNORE_REGEX = /<script(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;

function setObjValue(obj, path, value) {
    path = path.split(".");
    let i = 0,
        key;
    for (i = 0; i < path.length - 1; i++) {
        key = path[i];
        Object.assign(obj, obj[key] ?? { [key]: {} });
        obj = obj[key];
    }
    obj[path[i]] = value;
}

module.exports = {
    // SCRIPT_SRC_REGEX,
    // LINK_HREF_REGEX,
    setObjValue,
};
