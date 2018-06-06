# Contextual help generator
The generator converts provided csv file to json structure and writes the result into a file.

`"viewKey","linkLabel","linkValue"` > `[ { "viewKey": string, "links": [{ "label": string, "value": string" }] }`
### How to use
1. Put `contextual-help.csv` file in this folder
2. run `npm run generate:ch`
3. commit generated file
### `contextual-help.csv`
The file has the following structure `"viewKey","linkLabel","linkValue"` (**the header is mandatory!**).

`viewKey` - a key of corresponding view in the application, see `contextual-help.template.csv` as example, it has all available key in the application.

`linkLabel` - a label of the link, will go there `<a ...>{linkLabel}</a>`

`linkValue` - a href of the link, will go there `<a href={linkValue}>...</a>`

To create several links for the same page just provide link's label and value with the save viewKey

Example:
```$csv
"viewKey","linkLabel","linkValue"
"admin-roles","Link1","http://example1.com"
"admin-roles","Link2","http://example1.com"
```
