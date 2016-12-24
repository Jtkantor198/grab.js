var UglifyJS = require("uglify-js");
var CleanCSS = require('clean-css');
var browserify = require('browserify');
var stream = require('stream');
module.exports = {
    browserify: function(input, options){
        return new Promise(function(resolve, reject){
            try {
                var code = new stream.Readable();
                code._read = function(){};
                code.push(input);
                code.push(null);
                var b = browserify();
                b.add(code);
                var result = '';
                var outputStream = new stream.Writable();
                outputStream._write = function(){return true;};
                outputStream.write = function(data){
                    result+=data;
                    return true;
                };
                outputStream.end = function(){
                    resolve(result);
                    return true;
                };
                b.bundle().pipe(outputStream);
            }
            catch (e){
                console.log(e);
            }
        });
    },
    uglify: function(input, options){
        uglyStuff = UglifyJS.parse(input);
        uglyStuff.figure_out_scope();
        uglyStuff =  uglyStuff.transform(UglifyJS.Compressor()).print_to_string();
        return uglyStuff;
    },
    minifycss: function(input){
        return new CleanCSS().minify(input).styles;
    }
}
