module.exports = {
    browserify: function(input, options){
        var browserify=require("browserify");
        var stream=require("stream");
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
            var browserifyStream = b.bundle();
            browserifyStream.on('error', (e) => {
              reject(e.message);
            });
        	browserifyStream.pipe(outputStream);
        });
    },
    babel: function(input){
        var babel=require("babel-core");
        return babel.transform(input).code;
    },
    babelAndMinify: function(input){
        var babel=require("babel-core");
        return babel.transform(input, {minified: true}).code;
    },
    uglify: function(input, options){
        var UglifyJS=require("uglify-js");
        return UglifyJS.minify(input, {fromString: true});
    },
    minifycss: function(input){
        var CleanCSS=require("clean-css");
        return new CleanCSS().minify(input).styles;
    }
}
