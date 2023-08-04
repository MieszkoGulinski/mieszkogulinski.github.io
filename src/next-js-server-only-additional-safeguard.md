---
layout: post.liquid
pageTitle: Additional security safeguard for server-only files in Next.js 
date: 2023-05-18
tags: posts
pageDescription: How to prevent sending server-only code to the browser in Next.js
---

## Problem and solution

The problem is described in [this StackOverflow question](https://stackoverflow.com/questions/72119806/ensuring-sensitive-code-is-run-only-server-side-with-nextjs-where-can-such-code).

Next.js allows the same code to be ran on the server and in the browser. Code in `getStaticProps` and `getServerSideProps` will run on the server only, and when compiling the code to be sent to the browser, in `pages/...` files, Next automatically eliminates imports that are used only in the server-only functions.

But it may happen that code, that should be ran on server only, is accidentally included on the browser-side. This is a security risk. To mitigate a risk of leakage of some of the sensitive values, [Next.js environmental variables aren't exposed to the browser unless prefixed with `NEXT_PUBLIC_`](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#exposing-environment-variables-to-the-browser) - it's a part of the solution.

## Additional safeguard

As an additional safeguard against exposing sensitive server-only code to the browser, it's possible to add a simple code snippet that will display an error if a server-only code gets imported on the client:

```tsx
if (typeof window !== "undefined")
  throw Error("--- SECURITY ERROR - Cannot import this file in the browser ---");
```

This code should be added in the main scope of a file that should be run on the server only - a good place is immediately after imports.

### Example

Let's consider a protected file named `sensitiveFunction.ts`:
```tsx
if (typeof window !== "undefined")
  throw Error("--- SECURITY ERROR - Cannot import this file in the browser ---");

const sensitiveFunction = () => {
  console.log("This should be ran on the server only!");
}

export default sensitiveFunction
```

This page file will be displayed correctly, and it'll display the message `This should be ran on the server only!` on the console where Next.js is launched:
```tsx
// ... other imports ...
import sensitiveFunction from "../utils/sensitiveFunction"

const SomePage = (props) => {
  return (
    <div>
      {/* ... */}
    </div>
  );
};

export default SomePage;

export const getStaticProps = async (
  context
) => {
  sensitiveFunction() // <------ HERE

  return { props: { /* ... */ } };
};
```

Displaying of this page file will cause the error to be visible in console.:
```tsx
// ... other imports ...
import sensitiveFunction from "../utils/sensitiveFunction"

const SomePage = (props) => {
  sensitiveFunction() // <------ HERE

  return (
    <div>
      {/* ... */}
    </div>
  );
};

export default SomePage;

export const getStaticProps = async (
  context
) => {
  return { props: { /* ... */ } };
};
```