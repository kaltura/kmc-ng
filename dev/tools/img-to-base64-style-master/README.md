# img-to-base64-style

Convert images to base64 string with scss file output. File will be put inside work directory provided by params.

Arguments:

`--dir`[required] – work directory path, images must be inside this folder

`--outputName` [optional] – file name of result file, default is `styles`

`--classPrefix` [optional] – prefix of class name, default is `.`

Example:

`node script.js --dir=[work directory path] --outputName=[name of result file] --classPrefix=[default is .]`

Produces output like for each file in the provided directory:
```
{classPrefix}{fileName} {
  background-image: url('{base64String}');
}
```