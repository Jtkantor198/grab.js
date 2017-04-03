var fse = require('fs-extra');
var fs = require('fs');
var path = require('path');
var recursiveReadDirSync = function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(path.resolve(dir), file)).isDirectory()) {
            filelist = recursiveReadDirSync(path.join(path.resolve(dir), file), filelist);
        }
        else {
            filelist.push(path.join(path.resolve(dir), file));
        }
    });
    return filelist;
};
var readDirSync = function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(path.resolve(dir), file)).isDirectory()) {
            //filelist = find(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.join(path.resolve(dir), file));
        }
    });
    return filelist;
};

function globStringToRegex(str) {
    return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.'), 'g');
}
function preg_quote (str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}
function getPathName(a){
  var a = a.toString().substring(a.toString().indexOf("/")+1, a.toString().lastIndexOf("/")).replace(/\\\//g,"/").replace("\\.",".");
  return a.substring(0,a.toString().lastIndexOf("/"))
}
function regexRelativePath(regex){
    if (/^(\\\.)+\\\//.test(regex.toString().substring(regex.toString().indexOf("/")+1, regex.toString().lastIndexOf("/")))){
        var begining = getPathName(regex).substring(0,getPathName(regex).indexOf("/")+1);
        return new RegExp(regex.toString().substring(regex.toString().indexOf("/")+1, regex.toString().lastIndexOf("/")).replace(/^(\\\.)+\\\//, path.resolve(begining).replace(/\//g,"/")+"/"));
    }
    else{

    }
}


module.exports = function(regex){
      if (typeof regex == "string"){
          regex = globStringToRegex(regex);
          regex = {find: regex, recursive: false};
      }
      else if (regex instanceof RegExp){
        regex = {find: regex, recursive: false};
      }
      else if (regex.find && (typeof regex.find == "string")){
        regex.find = globStringToRegex(regex.find);
      }
	    //var filename = regex.find.substring(regex.find.lastIndexOf("/")+1,regex.find.length);
      function getPathName(a){
        var a = a.toString().substring(a.toString().indexOf("/")+1, a.toString().lastIndexOf("/")).replace(/\\\//g,"/").replace("\\.",".");
        return a.substring(0,a.toString().lastIndexOf("/"))
      }
	    var pathname = getPathName(regex.find);
      regex.find = regexRelativePath(regex.find);
	    if (regex.exclude){
  			if (regex.recursive){
  				//var files = Finder.from(pathname).exclude(regex.exclude).findFiles(filename);
          var files = recursiveReadDirSync(pathname).filter(function(filename){
  					return regex.find.test(filename) && !(filename in exclude);
  				});
  			}
  			else{
  				//var files = Finder.in(pathname).exclude(regex.exclude).findFiles(filename);
          var files = readDirSync(pathname).filter(function(filename){
            return regex.find.test(filename) && !(filename in exclude);
          });
  			}
	    }
	    else{
  			if (regex.recursive){
  				//var files = Finder.from(pathname).findFiles(filename);
  				var files = recursiveReadDirSync(pathname).filter(function(filename){
  					return regex.find.test(filename);
  				});
  			}
  			else{
  				//var files = Finder.in(pathname).findFiles(filename);
  				var files = readDirSync(pathname).filter(function(filename){
  					return regex.find.test(filename);
  				});
  			}
	    }
        for (var i in files){
            name = files[i];
            files[i] = {};
            files[i].data = fs.readFileSync(name);
            pathname = path.resolve(process.cwd().replace(/\\+/g,"/").replace(/\/+/g,"/"), pathname.replace(/\\+/g,"/").replace(/\/+/g,"/"));
            name = name.replace(/\\+/g,"/").replace(/\/+/g,"/");
            files[i].path = name.substring(name.lastIndexOf(pathname)+pathname.length+1, name.length).replace(/\\+/g,"/").replace(/\/+/g,"/");
            name = name.substring((name.lastIndexOf("\\")+1 || name.lastIndexOf("/")+1), name.length);
            files[i].name = name;
        }
        //Read files keep names
        this.current = files;
        this.transform = function(transformer){
            //Apply transformer
            //Check if promise is returned, if so async chain down to file write
            for (var i=0;i<this.current.length;i++){
                if (this.current[i].data.then){
                    if (!this.current[i].stack){
                        this.current[i].stack = [];
                    }
                    if (this.current[i].stack.length == 0 && !this.current[i].waiting){
                        let current = this.current[i];
                        function delayExecution(value){
                            //Excute until stack empty
                             current.data = transformer(value);
                             while (current.stack.length > 0 && !promise){
                                 if(current.data.then){
                                     var promise = true;
                                     let currentName = this.current[i].name;
                                     current.then(delayExecution).catch(function(e){
                                        console.log("Execution delay failed for "+currentName+":");
                                        console.log(e);
                                     });
                                 }
                                 else{
                                    try {
                                      current.data = current.stack[0].call(this, current.data);
                                    }
                                    catch(e){
                                      console.log("Error: "+current.name);
                                    }
                                     current.stack.splice(0,1);
                                 }
                             }
                        }
                        let currentName = this.current[i].name;
                        this.current[i].data.then(delayExecution).catch(function(e){
                           console.log("Error building "+currentName+":");
                           console.log(e);

                        });
                        current.waiting = true;
                    }
                    else{
                        this.current[i].stack.push(transformer);
                    }
                }
                else{
                    //apply transformer
                    //console.log(this.current[i].name);
                    let currentName = this.current[i].name;
                    try{
                      this.current[i].data = transformer(this.current[i].data);
                    }
                    catch(e){
                      console.log("Error building "+currentName+":");
                      console.log(e);
                    }
                }
            }
            return this;
        }
        this.moveTo = function(dir){
            if (dir.recursive){
                dir.path = dir.path.replace(/\\/g,"/");
                this.current = this.current.map(function(item){
                    if (item.data.then){
                        if (!item.waiting && (!item.stack || item.stack.length == 0)){
                            item.data.then(function(value){fse.outputFileSync((dir.path + "/"+ item.path).replace(/\\+/g,"/").replace(/\/+/g,"/"), value);}).catch(
                              function(e){
                                console.log(item.name);
                              }
                            );
                        }
                        else{
                            item.stack.push(function(input){fse.outputFileSync((dir.path + "/"+ item.path).replace(/\\+/g,"/").replace(/\/+/g,"/"), item.data)});
                        }
                    }
                    else{
                        fse.outputFileSync((dir.path + "/"+ item.path).replace(/\\+/g,"/").replace(/\/+/g,"/"), item.data);
                    }
                });
                return true;
            }
            else{
                this.current = this.current.map(function(item){
                    if (item.data.then){
                        if (!item.waiting && (!item.stack || item.stack.length == 0)){
                            item.data.then(function(value){fse.outputFileSync(dir + "/"+ item.name, value)}).catch(
                              function(e){
                                console.log(e);
                              }
                            );
                        }
                        else{
                            item.stack.push(function(input){fse.outputFileSync(dir + "/"+ item.name, item.data)});
                        }
                    }
                    else{
                        fse.outputFileSync(dir + "/"+ item.name, item.data);
                    }
                });
                return true;
            }
        }
        return this;
};
module.exports.watch = function(path, repeat, asLongAs){
    repeat();
    if (process.argv[2] == "watch"){
        fs.watch(path, {recursive: true}, (eventType, filename) => {
			if (!asLongAs || asLongAs()){
            	repeat();
			}
        });
    }
};
