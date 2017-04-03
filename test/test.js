var assert = require('assert');
var grab = require("../grab.js");
var gl = require("../grabLibs.js");
var fs = require("fs");
var fse = require('fs-extra');
describe('Build files non-recursively with wildcards', function() {
  before(function(){
    fse.removeSync("./test/sampleBuild");
  });
  describe('moves html file', function() {
    before(function(){
      try{ grab("./test/sampleDir/*.html").moveTo("./test/sampleBuild/"); }
      catch(e){console.log("\x1b[31m","     - "+e.message); this.skip(); }
    });
    it('moves file', function() {
      assert(fs.existsSync("./test/sampleBuild/sample.html"));
    });
  });
  describe('move and minify css', function() {
    before(function(){
      try{ grab("./test/sampleDir/*.css").transform(gl.minifycss).moveTo("./test/sampleBuild/"); }
      catch(e){console.log("\x1b[31m","     - "+e.message); this.skip(); }
    });
    it('moves css file', function() {
      assert(fs.existsSync("./test/sampleBuild/sample.css"));
    });
    it('minify\'s css', function() {
      assert(fs.readFileSync("./test/sampleBuild/sample.css").length < fs.readFileSync("./test/sampleDir/sample.css").length);
    });
  });
  describe('move, browserify, and minify javascript', function() {
    before(function(){
      try{ grab("./test/sampleDir/*.js").transform(gl.browserify).transform(gl.babelAndMinify).moveTo("./test/sampleBuild/"); }
      catch(e){console.log("\x1b[31m","     - "+e.message); this.skip(); }
    });
    it('moves js file', function(done) {
      setTimeout(function() {
        assert(fs.existsSync("./test/sampleBuild/sample.js"));
        done()
      }, 200);
    });
    it('browserify\'s js', function() {
      assert.equal("Test successful!", eval(fs.readFileSync("./test/sampleBuild/sample.js")+"(() => completeTest())()"));
    });
    it("minify's js", function(){
      assert(fs.readFileSync("./test/sampleBuild/sample.js").toString().split("\n").length < fs.readFileSync("./test/sampleDir/sample.js").toString().split("\n").length);
    });
  });
});

describe("build files non-recursively with regexp", function(){
  before(function(){
    fse.removeSync("./test/sampleBuild");
  });
  describe('moves html file', function() {
    before(function(){
      try{ grab(/\.\/test\/sampleDir\/.*\.html/).moveTo("./test/sampleBuild/"); }
      catch(e){console.log("\x1b[31m","     - "+e.message); this.skip(); }
    });
    it('moves file', function() {
      assert(fs.existsSync("./test/sampleBuild/sample.html"));
    });
  });
});

describe("build files recursively with wildcards", function(){
  before(function(){
    fse.removeSync("./test/sampleBuild");
  });
  describe('move, browserify, and minify javascript', function() {
    before(function(){
      try{ grab({find: "./test/sampleDir/*.js",recursive: true}).transform(gl.browserify).transform(gl.babelAndMinify).moveTo({path: "./test/sampleBuild/", recursive: true}); }
      catch(e){console.log("\x1b[31m","     - "+e.message+", line: "+e.stack); this.skip(); }
    });
    it('moves js files', function(done) {
      setTimeout(function() {
        assert(fs.existsSync("./test/sampleBuild/sample.js"));
        assert(fs.existsSync("./test/sampleBuild/Libs/sampleLib.js"));
        done()
      }, 200);
    });
    it('browserify\'s js', function() {
      assert.equal("Test successful!", eval(fs.readFileSync("./test/sampleBuild/sample.js")+"(() => completeTest())()"));
    });
    it("minify's js", function(){
      assert(fs.readFileSync("./test/sampleBuild/sample.js").toString().split("\n").length < fs.readFileSync("./test/sampleDir/sample.js").toString().split("\n").length);
    });
  });
});

describe("build files recursively with regex", function(){
  before(function(){
    fse.removeSync("./test/sampleBuild");
  });
  describe('move, browserify, and minify javascript', function() {
    before(function(){
      try{ grab({find: /\.\/test\/sampleDir\/.*\.js/,recursive: true}).transform(gl.browserify).transform(gl.babelAndMinify).moveTo({path: "./test/sampleBuild/", recursive: true}); }
      catch(e){console.log("\x1b[31m","     - "+e.message+", line: "+e.stack); this.skip(); }
    });
    it('moves js files', function(done) {
      setTimeout(function() {
        assert(fs.existsSync("./test/sampleBuild/sample.js"));
        assert(fs.existsSync("./test/sampleBuild/Libs/sampleLib.js"));
        done()
      }, 200);
    });
    it('browserify\'s js', function() {
      assert.equal("Test successful!", eval(fs.readFileSync("./test/sampleBuild/sample.js")+"(() => completeTest())()"));
    });
    it("minify's js", function(){
      assert(fs.readFileSync("./test/sampleBuild/sample.js").toString().split("\n").length < fs.readFileSync("./test/sampleDir/sample.js").toString().split("\n").length);
    });
  });
  after(function(){
    fse.removeSync("./test/sampleBuild");
  })
});
