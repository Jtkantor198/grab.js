module.exports = {
    browserify: function(input, options){
        return new Promise(function(resolve, reject){
            js = BrowserifyFn(input);
            js.bundle(function(err, data){
            	if (err){
                    throw err;
            	}
                output += data;
                //resolve(output);
                resolve(output);
            });
        });
    },
    uglify: function(input, options){
        stuff = UglifyJS.parse(input);
        stuff.figure_out_scope();
        stuff =  stuff.transform(UglifyJS.Compressor()).print_to_string();
        return stuff;
    },
    minifycss: function(input){
        return new CleanCSS().minify(input).styles;
    }
}
