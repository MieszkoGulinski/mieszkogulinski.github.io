# Quick setup of github.io page generated with Eleventy

[Eleventy](https://www.11ty.dev/) is a static page generator running on Node.js.

## Setup, running and uploading
Initialize package.json:
`npm init`

Install the required package:
`npm install @11ty/eleventy`

To build the pages, use the command:
`npx @11ty/eleventy --input=src --output=docs`
The options `input` and `output` specify directories for input - content in Markdown, layouts etc - and output - complete built HTML and other files, ready to be served as a working website. This command can be put into `package.json` file in the `scripts` object.

My repository is configured so that content of `docs` is served from the root URL at https://mieszkogulinski.github.io/ but you can configure it otherwise. I also use `src` directory to store the source files.

For easier previewing of your changes locally, Eleventy provides a built-in server with auto-updating. A command with `--serve` flag will start a server on localhost:
`@11ty/eleventy --serve --input=sr --output=docs`
The default port is 8080, and can be configured with flag `--port`, for example `--port=3000`. The setup with `--serve` flag watches the files for change and triggers rebuild, and then uses [Browsersync](https://www.browsersync.io/) for auto-updating the served page.

To publish the changes, after building the page, commit and push the changes:
```
git add .
git commit -m "..."
git push
```
After pushing, the github.io page will update automatically.

It may be useful to have the build step automatically ran before a commit. I installed [pre-commit](https://www.npmjs.com/package/pre-commit) package to do that. The page is configured in `package.json` file: `"pre-commit": ["build"],` where the entries are names of scripts to run (from `scripts` object).

## Initial file structure
The content will be inserted to a layout file, common for all posts:
```
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>{{ pageTitle }}</title>
    </head>
    <body>
        {{ content }}
    </body>
</html>
```
where `content` and `pageTitle` will be filled with actual content.

## Plugins
To use plugins, you need configuration file named `.eleventy.js`.
The file exports a function that mutates configuration object given as its argument:
```
module.exports = function(config) {
  config.addPlugin(...);
}
```

For example, to run a minifier for HTML files, install package `@sherby/eleventy-plugin-files-minifier` and use:
```
const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");

module.exports = function(config) {
  config.addPlugin(eleventyPluginFilesMinifier);
}
```
Thanks to [this article](https://www.benjaminrancourt.ca/how-to-minify-your-eleventy-build) for explanation.
