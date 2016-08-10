var Finder = require('fs-finder');
var fse = require('fs-extra');
var fs = require('fs');
module.exports = function(regex){
    if (typeof regex == "string"){
        filename = regex.substring(regex.lastIndexOf("/")+1,regex.length);
        pathname = regex.substring(0,regex.lastIndexOf("/"));
        var files = Finder.in(__dirname + pathname).findFiles(filename);
    }
    else if (regex.exclude){
        filename = regex.find.substring(regex.find.lastIndexOf("/")+1,regex.find.length);
        pathname = regex.find.substring(0,regex.find.lastIndexOf("/"));
        var files = Finder.in(__dirname + pathname).exclude(regex.exclude).findFiles(filename);
    }
    for (var i in files){
        name = files[i];
        files[i] = {}
        files[i].data = fs.readFileSync(name);
        name = name.substring((name.lastIndexOf("\\")+1 || name.lastIndexOf("/")+1), name.length);
        files[i].name = name;
    }
    //Read files keep names
    this.current = files;
    this.transform = function(transformer){
        /*this.current = this.current.map(function(item){
            item.data = transformer(item.data);
            return item;
        })*/
        //Apply transformer
        //Check if promise is returned, if so async chain down to file write
        for (var i=0;i<this.current.length;i++){
            if (this.current[i].data.then){
                if (!this.current[i].stack){
                    this.current[i].stack = [];
                }
                if (this.current[i].stack.length == 0 && !this.current[i].waiting){
                    var current = this.current[i];
                    function delayExecution(value){
                        //Excute until stack empty
                         current.data = transformer(value);
                         while (current.stack.length > 0 && !promise){
                             if(current.data.then){
                                 var promise = true;
                                 current.then(delayExecution);
                             }
                             else{
                                 current.data = current.stack[0].call(this, current.data);
                                 current.stack.splice(0,1);
                             }
                         }
                    }
                    this.current[i].data.then(delayExecution);
                    current.waiting = true;
                }
                else{
                    this.current[i].stack.push(transformer);
                }
            }
            else{
                //apply transformer
                //console.log(this.current[i].name);
                this.current[i].data = transformer(this.current[i].data);
            }
        }
        return this;
    }
    this.moveTo = function(dir){
        this.current = this.current.map(function(item){
            if (item.data.then){
                if (!item.waiting && (!item.stack || item.stack.length == 0)){
                    item.data.then(function(value){fse.outputFileSync(dir + "/"+ item.name, value)});
                }
                else{
                    item.stack.push(function(input){fse.outputFileSync(dir + "/"+ item.name, item.data)});
                }
            }
            else{
                fse.outputFileSync(dir + "/"+ item.name, item.data);
            //If err, create folder
            }
        });
        return true;
    }
    return this;
}
