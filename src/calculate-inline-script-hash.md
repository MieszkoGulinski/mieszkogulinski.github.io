---
layout: post.liquid
pageTitle: Calculate inline script hash for Content Security Policy with Firefox or Chrome development tools
date: 2021-06-08
tags: posts
---

Content Security Policy (CSP) settings help improving website security by allowing usage of resources only from specified origins. For example, it's possible to prevent the website from executing scripts not coming from our server, or prevent performing HTTP requests to addresses other than ours.

## Why do we need it?

One of the possibilities of attack is called **cross-site scripting**, a subset of **code injection**. If a website allows user-provided input, and doesn't properly escape the input text, it may be possible for a malicious user to inject arbitrary HTML tags. These tags may include scripts that steal user data, or make it possible for the attacker to impersonate the current user. Disabling execution of inline scripts helps preventing this type of attacks.

Inline scripts have their legitimate uses, and there are ways to enable execution of the legitimate scripts, while disabling it for other inline scripts. One of them is by using a **nonce**. For each page load, server generates a random value, adds it to CSP policy, and adds `nonce=...` attribute to each valid script.

Another way is to, for every valid script, add a **hash** of its text content to CSP policy. The script will be executed only if its hash is included in the provided ones.

While it's possible to configure CSP policy to allow execution of any inline script, it's not recommended, because it disables protection against code injection attacks.

## How to get the hash?

Browsers, given a disallowed inline script, will show you the hash of the script in the JavaScript error console that you can paste into the CSP policy. But this requires the CSP headers to be present.

But it's also possible to calculate the required hash even without the browser receiving CSP headers.

To do this, in the browser's dev tools console, paste this code:
```
getScriptHash = async (script) => {
  const scriptText = script.innerText;

  const msgBuffer = new TextEncoder('utf-8').encode(scriptText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const base64String = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  console.log(base64String);
}
```
This function takes the text content of a given element, calculates its SHA-256 hash in base64 format, and prints it in the console. The function is added to the global namespace.

Then, in Elements tab, right-click the script element and click the option to save reference to the script element to a global variable. In Chrome it'll be "Store as global variable", while in Firefox it's "Use in Console". Reference to the script element will be stored as a global variable named `temp0`, `temp1`, `temp2`, etc. - the name will be printed to the console.

Unfortunately, Safari (as of version 14.0.2) doesn't have this feature.

Then, run the function in the console:
```
getScriptHash(temp1)
```
possibly replacing `temp1` with the correct name. The hashes will be printed to the JavaScript console.

Repeat this for each script that needs to be added to CSP settings.

## How to add the hash to the CSP policy?

This script:
```
<script>console.log('ok');</script>
```
has SHA-256 hash equal to `Aqg81WB3fsDjPYW8ncUP7I3hCMVclFRDy2CL+mW+mIQ=`.

To enable execution of this script in CSP policy, the hash needs to be added under `script-src` like that:
```
script-src ... 'sha256-Aqg81WB3fsDjPYW8ncUP7I3hCMVclFRDy2CL+mW+mIQ=' ...
```

For example, this CSP policy:
```
script-src self 'sha256-Aqg81WB3fsDjPYW8ncUP7I3hCMVclFRDy2CL+mW+mIQ=';
```
will allow execution of the example inline script, and the scripts downloaded from current website origin (marked by `'self'`).

## Further reading

[Content Security Policy article on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
