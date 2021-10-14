const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(config) {
  config.addPassthroughCopy("src/img");
  config.addPassthroughCopy("src/styles");

  config.addPlugin(syntaxHighlight);
  config.addPlugin(eleventyPluginFilesMinifier);
}
