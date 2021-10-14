---
layout: post.liquid
pageTitle: HTML <object> element as a quick preview
date: 2021-06-03
tags: posts
---

HTML `object` can embed multiple types of items downloaded from given URL:
- Image - but there's a specialized `<img>` tag for that.
- Video - similarly, there's a specialized `<video>` tag for that.
- PDF file
- Text from an external URL. `<object type="text/plain" data={url} />`, where the MIME type can be, among others, `text/plain`, `text/csv` or `application/json`.

It can be useful in several cases:

## PDF preview
Modern browsers can display PDF files. But these files don't have to be displayed in a separate tab or window. When it's necessary to display a PDF file as a part of an existing page, `<object>` tag can be handy. It won't work in browsers that don't support PDF file format, and in this case it may turn out to be necessary to use a PDF renderer implemented in JavaScript, such as PDF.js.

## Text preview
Similarly to PDF preview, the `<object>` tag may come handy for a quick preview of a raw text file, CSV, JSON etc. from a given URL - without downloading the file with JavaScript. It displays the text without any preprocessing, so it's not a good solution if you need syntax highlighting, formatting, or you need to extract information from the file.

## Example
I used `<object>` tag next to a file upload button, for preview of uploaded file. This way the preview can somehow work for lots file types - including PDF or various text formats - without having to write complicated preview components (and importing large libraries) for each possible type.
