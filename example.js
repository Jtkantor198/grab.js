path = process.argv[2];
if (path == ""){
    throw Error("Need to enter target path");
}
pages = ['about', 'blog','contact','home','projects','readroll','recent'];
res = ['blog','projects','readroll'];
var Finder = require('fs-finder');
var fse = require('fs-extra');
var fs = require('fs');
var UglifyJS = require("uglify-js");
var CleanCSS = require('clean-css');
var BrowserifyFn = require('browserify-string');
var grab = require('grab.js');
for (var i in pages){
    grab("/"+pages[i]+"/*.js").transform(browserify).transform(uglify).moveTo(path+"/"+pages[i]);
    grab("/"+pages[i]+"/*.css").transform(minifycss).moveTo(path+"/"+pages[i]);
    grab("/"+pages[i]+"/*.html").moveTo(path+"/"+pages[i]);
}

function browserify(input, options){
    return new Promise(function(resolve, reject){
        js = BrowserifyFn(input);
        js.bundle(function(err, data){
            if (err){
                throw err;
            }
            output += data;
            resolve(output);
        });
    });
}
function uglify(input, options){
    stuff = UglifyJS.parse(input);
    stuff.figure_out_scope();
    stuff =  stuff.transform(UglifyJS.Compressor()).print_to_string();
    return stuff;
}
function minifycss(input){
    return new CleanCSS().minify(input).styles;
}
