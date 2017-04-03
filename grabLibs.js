var UglifyJS=require("uglify-js");
var CleanCSS=require("clean-css");
var browserify=require("browserify");
var stream=require("stream");
var babel=require("babel-core");

module.exports = {
    browserify: function(input, options){
        return new Promise(function(resolve, reject){
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
        }).catch(function(e){
            console.log(e);
        });
    },
    babel: function(input){
        return babel.transform(input).code;
    },
    babelAndMinify: function(input){
        return babel.transform(input, {minified: true}).code;
    },
    uglify: function(input, options){
        return UglifyJS.minify(input, {fromString: true});
    },
    minifycss: function(input){
        return new CleanCSS().minify(input).styles;
    }
}
