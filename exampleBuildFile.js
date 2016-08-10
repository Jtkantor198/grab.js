path = process.argv[2];
if (path == ""){
    throw Error("Need to enter target path");
}
var grab = require('grab.js');
var grabLibs = require('grabLibs.js');
pages = ['about', 'blog','contact','home','projects','readroll','recent'];
res = ['blog','projects','readroll'];
for (var i in pages){
    grab("/"+pages[i]+"/*.js").transform(grabLibs.browserify).transform(grabLibs.uglify).moveTo(path+"/"+pages[i]);
    grab("/"+pages[i]+"/*.css").transform(minifycss).moveTo(path+"/"+pages[i]);
    grab("/"+pages[i]+"/*.html").moveTo(path+"/"+pages[i]);
}

//---How to building a transformer---
var CleanCSS = require('clean-css');
function minifycss(input){
    return new CleanCSS().minify(input).styles;
}
