---
layout: post.liquid
pageTitle: Electron JS and ZeroMQ build error
date: 2020-12-11
tags: posts
---

This error happened to me on Electron 8, zeromq 5.2.0, Mac OS Catalina. Other library versions or OSes may need adjustments.

If starting the application fails due to mismatching compiled version of `zeromq` library:
```
The module '/.../node_modules/zeromq/build/Release/zmq.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 57. This version of Node.js requires
NODE_MODULE_VERSION 76. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```
to rebuild the library, run *both* commands:
```
npm rebuild --runtime=electron --target=8.0.0
npx electron-rebuild zeromq
```

With running only the first command, and not the second, you'll get the error that NODE_MODULE_VERSION is not matching.
With running only the second command without the first one before, you'll get an error `zmq.h file not found` during compilation.
