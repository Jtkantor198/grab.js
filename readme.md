grab.js
=========
Build tool for grabbing files and applying transformations (minifying, compressing).

Why not use gulp.js?
* You don't want to use gulp's package system
* You want to use regular expressions
* You want to keep it simple

Install
---------

To install run
```bash
npm install git+http://repos.kantor.site/jtkantor198/grab.js.git
```
GrabLibs.js has a number of convenience transformations for some commmon libraries. You can include it using `require`
```javascript
grab = require("grab.js");
gl = require("grab.js/grabLibs.js");  
```
But you will still need to install the relevant dependencies for the transformation inside grabLibs.js. For instance to use `gl.minifycss` you'll need to run `npm install clean-css`.


Basic Usage
---------
You can grab files from a folder using wildcard, minify it, and move it to another folder.
```javascript
grab("./test/sampleDir/*.css").transform(gl.minifycss).moveTo("./test/sampleBuild/");
```
You can use regular expression as well
```javascript
grab(/\.\/test\/sampleDir\/.*\.html/).moveTo("./test/sampleBuild/");
```
You can even grab files from an entire directory by adding `recursive: true`  
```javascript
grab({find: "./test/sampleDir/*.js",recursive: true})
    .transform(gl.browserify)
    .transform(gl.babelAndMinify)
    .moveTo("./test/sampleBuild/");
```
Adding `recursive: true` to `moveTo` will drop the files in the same tree structure they were grabbed in
```javascript
grab({find: "./test/sampleDir/*.js",recursive: true})
    .transform(gl.browserify)
    .transform(gl.babelAndMinify)
    .moveTo({path: "./test/sampleBuild/", recursive: true});
```

Watch
---------
You can also wrap your grab statements in ``grab.watch(dir, function)`` so your build will be rerun whenever those files are changed
```javascript
grab.watch("./test/", function(){
    grab("./test/sampleDir/*.html").moveTo("./test/sampleBuild/");
    grab("./test/sampleDir/*.css").transform(gl.minifycss).moveTo("./test/sampleBuild/");
    grab("./test/sampleDir/*.js").transform(gl.browserify).transform(gl.babelAndMinify).moveTo("./test/sampleBuild/");
});
```

If running your build when your files aren't parsable cause issues, you can revent the build from running by adding `onlyIf` function. The build will only be run if that function returns true.
```javascript
grab.watch("./test/", function(){
    grab("./test/sampleDir/*.html").moveTo("./test/sampleBuild/");
    grab("./test/sampleDir/*.css").transform(gl.minifycss).moveTo("./test/sampleBuild/");
    grab("./test/sampleDir/*.js").transform(gl.browserify).transform(gl.babelAndMinify).moveTo("./test/sampleBuild/");
}, function(){
    return true;
});
```  

Custom Transformations
---------
Transformations are simple to write yourself, just take in a string and return a string
```javascript
function babelAndMinify(input){
    return babel.transform(input, {minified: true}).code;
}

grab({find: "./test/sampleDir/*.js",recursive: true})
    .transform(gl.browserify)
    .transform(babelAndMinify)
    .moveTo({path: "./test/sampleBuild/", recursive: true});
```
You can also return a promise
```javascript
function browserify(input, options){
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
}

grab({find: "./test/sampleDir/*.js",recursive: true})
    .transform(browserify)
    .transform(babelAndMinify)
    .moveTo({path: "./test/sampleBuild/", recursive: true});
```
