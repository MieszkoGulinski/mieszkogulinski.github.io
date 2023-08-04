---
layout: post.liquid
pageTitle: Keeping the blog minimal
date: 2021-06-26
tags: posts
pageDescription: How this blog is internally made, and how it's optimized for very fast loading
---

Bloated and slowly loading websites [scare off users](https://medium.com/pinterest-engineering/driving-user-growth-with-performance-improvements-cfc50dafadd7), [rank lower in search results](https://www.forbes.com/sites/jiawertz/2017/07/17/why-site-speed-design-can-make-or-break-your-google-ranking/), and apparently [are bad for the environment](https://www.websitecarbon.com/).

That's why I want my blog to be extremely fast to load, and have very small amount of data to be downloaded. Let's be considerate about people using low end devices and using a mobile network with data limits. I don't really want to squeeze every last byte or limit myself to a specific max size, but to be reasonably minimal, with compromises if necessary.

## Scripts

A significant port of bloat [comes from various analytics scripts](https://linustechtips.com/main/topic/931387-gdpr-brings-massive-speed-improvement-to-websites/). Huge amount of various tracking scripts will make your page sluggish, and will scare off your users. Use them really, really sparingly, if at all.

## Small CSS

My blog is inspired by [this website](http://bettermotherfuckingwebsite.com/), where the author decided to use only 7 CSS declarations while keeping the page look reasonably good.

I didn't limit myself to a specific size in kB, or specific number of lines, just aiming to keeping the styles small, simple and without unnecessary elements. That's why I didn't use any CSS framework and wrote everything from scratch. I also used system font, trying to make the text legible by setting font size to value I find personally easiest to read.

Blogs often have minimal style - [the ones](https://medium.com/the-node-js-collection/node-js-can-http-2-push-b491894e1bb1) [hosted on Medium](https://medium.com/squad-engineering/blazingly-fast-querying-on-huge-tables-by-avoiding-joins-5be0fca2f523) can be good examples, as well as [many](https://rauchg.com/2014/7-principles-of-rich-web-applications) [others](https://dave.cheney.net/2019/07/09/clear-is-better-than-clever). But it doesn't really mean that the download size is small. After loading [this Medium article](https://medium.com/@luke_73359/getting-started-with-icestorm-verilog-on-the-ice40hx1k-fpga-cbc71ad3947d) - with two images in the post body and no lead image - developer tools show `2.5 MB transferred` and `5.0 MB resources`. Quite bad, isn't it? On contrary, [this beautifully designed blog](https://dave.cheney.net/2018/07/12/slices-from-the-ground-up) shows `306 kB transferred` and `693 kB resources`. Much better, but it doesn't satisfy me.

I wanted styles to be small enough, so that they can be loaded as inline `<style>` tag, instead of a separate file, saving a single HTTP request. Maybe except code highlighting, but it can be loaded later and nothing bad should happen.

Harder to maintain? Yes, but the styles are small enough so it won't be a problem, and there's no risk of a customer asking me to change text color or font size somewhere.

An example of a really cool site that uses styling very sparingly is [Astronomy Picture of the Day](https://apod.nasa.gov/apod/astropix.html). It looks like it didn't change since its start in 1990s, but... it just works. It's functional.

## Static generation

Static generation means that each page - in case of blog, these will be index, article etc. - is pre-rendered and then served as a static HTML file. This is in contrast to dynamic templates, rendered on each page load.

From many static page generators, I use [Eleventy](https://www.11ty.dev/). There are many more static page generators, such as [Jekyll](https://jekyllrb.com/), [Gatsby](https://www.gatsbyjs.com/) or [Hugo](https://gohugo.io/). [Next.js](https://nextjs.org/) can generate pages statically or dynamically (on each request). A large list of static page generators is available [here](https://jamstack.org/generators/).

I used Eleventy because it's a simple tool with easy setup. Even though my job is a React developer, and I'm extremely familiar with this library, I didn't use React-based page generators (Next.js, Gatsby) because they're an overkill for a very simple blog.

## Images

At first, not every post needs a lead photo. If an image doesn't add anything to the article content, why insert it at all? I don't need to add a stock photo of a computer. Instead, I think it's better to find an image that gives some useful information to the reader - if it's about software, it can be a screenshot, in other subjects it can be an infographics, or photo of the specific item the article is about.

Posting code as a screenshot, [or a screenshot-like image](https://carbon.now.sh/), has a risk that font size on the image mismatches font size of the rest of the article, making the article harder to read.

What about image size? In this very blog, the largest possible content width, in CSS pixels, is 710 px. So it's no use having larger photos - unless I want to show a great looking photo with lots of details and make it look perfect on high-DPI screens.

## Does it really help the end user?

Many of the things really do, also I do them for my own fun. Worth it? Definitely yes.
