
## Class: grab

Class for grabbing files and applying transformations (minifying, compressing).

### grab(regex)

**Parameters**

**regex**: `string | Regex | object`, The regular expression or string with wildcards describing the files to grab, or object containing parameters

 - **regex.find**: `string | Regex`, The regular expression or string with wildcards describing the files to grab

 - **regex.recursive**: `string`, (optional) Boolean describing whether or not search recursively from the search's root directory



### grab.transform(transformer)

transform

**Parameters**

**transformer**: `function`, A function that accepts a string or buffer and returns a string, buffer, or promise


### grab.moveTo(dir)

moveTo

**Parameters**

**dir**: `string | object`, The path where the files will be dropped, or an object with parameters

 - **dir.path**: `string`, The path where the files will be dropped

 - **dir.recursive**: `string`, Boolean describing whether to output the files in the same relative tree structure they were grabbed in, or to just dump them all in the same folder


### grab.watch(path, repeat, asLongAs)

watch

**Parameters**

**path**: `string`, The directory to watch

**repeat**: `function`, A function with the build to be repeated

**asLongAs**: `function`, A function which checks whether a build can be run after a certain file change. Should return a bool.
