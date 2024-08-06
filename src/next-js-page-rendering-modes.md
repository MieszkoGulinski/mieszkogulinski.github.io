---
layout: post.liquid
pageTitle: Next.js page rendering modes - a short guide
date: 2021-09-25
tags: posts
pageDescription: When to use various modes of page rendering in Next.js - server-side rendering (SSR), static generation (SSG) and incremental static regeneration (ISR)
---

[Next.js](https://nextjs.org/) is a framework that allows pre-rendering and server-side rendering of pages written in [React](https://reactjs.org/), and comes integrated with a HTTP server.

## Why is Next.js useful?

With "raw" React - without using any other framework - the server returns an empty HTML page, and JavaScript code. Then the browser executes the JS code, and the code fills the page with final HTML content, and - when needed - queries an API to get required data. After the page gets initialized, React handles the page logic - form inputs, event handling etc.

Next.js, instead, already returns the initial HTML and CSS, and sends corresponding JavaScript code to handle the page logic, so that after loading it behaves like any other React page.

Because the HTML with final content is already sent to the user, the page content loads faster, and is more compatible with search engine crawlers.

Next.js, both when building and running on the server, can query an external resource - database, external API, files, or just anything Node.js can access. Then the returned data is inserted as the props of the outermost React component of the page, ready to be displayed.

## Rendering modes
Next.js uses several page rendering modes:

- **static generation** - a page is generated during **build time**,
- **server-side rendering** - a page is generated on-demand, every time it's requested,
- **incremental static regeneration** - a page is generated both during build time and after it's requested. After being generated, it's cached for a specified amount of time, then it's generated again when it's requested.

In Next.js, **generation** means querying the resources and rendering React JS code to HTML.

Also, Next.js has a special path, `/api`, for API routes - that could be used for client-side requests. But using it for fetching initial data negates the benefit of Next.js server-side rendering. API routes are of course useful for e.g. fetching more data when a page displays paginated content, or for performing some action.

Rendering mode is dependent on what functions are exported from the JavaScript page corresponding to a given page. Each page can have one of these modes.

### Static generation
A page will be statically generated, when either:
- it has an exported `getStaticProps` function,
- it has neither `getStaticProps` or `getServerSideProps` exported.

An asynchronous function `getStaticProps` queries the resources during build time. Typically, build process is performed during page (re)deployment. That's why this mode is most useful for pages with very slowly changing or constant content.

A page that can take a parameter in the path, e.g. `/blog/[slug]`, to be rendered during build time, requires a function that enumerates every possible value of the parameter. Then, for each possible value of the parameter, a page is individually generated. It's a limitation, but without knowing in advance what values can the parameter have, generating pages in advance isn't possible.

Pages without `getStaticProps` or `getServerSideProps` don't use Next.js for getting initial data - they'll just display what is there in their React code. On such pages, React is active on the client side, and can load data by querying an API.

### Server-side rendering
This mode is triggered by having an exported `getServerSideProps` function. In this mode, every time the page is requested from the server, this function is called, and with the received props, React markup is rendered to HTML.

While this mode immediately reflects the changes in the data source, it may be **very** expensive to generate a page on each request.

Server-side rendering mode has an advantage that the server can read query parameters from the argument of `getServerSideProps`. For example, a page displaying search results, having URL like `/search?term=...`, could have this function implemented like that:
```
export const getServerSideProps = async (context) => {
  const term = context.query.term;

  ... fetch the results dependent on term ...

  return {
    props: { ... },
  };
};
```

### Incremental static regeneration (cached mode)
This mode generates the page during build time, but the pre-built page isn't stored permanently. After a specified time passes since last generation of the page, after the page is requested, the old version is sent to the user, but the page starts being generated again, and the new version is stored in a cache and will be available on the next request.

This mode is triggered by having `getStaticProps` with `revalidate` in the options, like that:

```
export const getStaticProps = async () => {
  ... fetch the data here ...
  return {
    props: { ... },
    revalidate: 60,
  };
};
```
where `revalidate` is the cache expiration time in seconds.

## Limitations of server-side and build-time rendering
During build time and server-side rendering, React markup (with props) is rendered to HTML, but the lifecycle methods executed on the component mounting aren't. Also, browser-side APIs aren't available.

### Lifecycle methods/hooks
These are `useEffect`, for functional components, and `componentDidMount`, for class components. During server-side and build-time rendering they aren't executed, but they are executed on the client after the page initializes.

### Browser-side APIs
Because server-side and build-time rendering happens in Node.js, not browser, environment, browser-specific APIs aren't available, and using them will result in errors such as `window is not defined`.

A React component that initializes its state with a value from `localStorage`, in a purely client-side React, can be written this way:
```
const SomeSwitch = () => {
  const [switchValue, setSwitchValue] = useState(localStorage.getItem("switchValue"));
  ...
  ...
}
```

But in Next.js, rendering a component on the server will fail, as localStorage isn't available on the server. You must either rewrite the component so that it doesn't access browser-specific APIs on the server, or not render the component during initial rendering.

For example, this component can be modified like that:
```
const SomeSwitch = () => {
  const [switchValue, setSwitchValue] = useState('default value');

  useEffect(() => {
    setSwitchValue(localStorage.getItem("switchValue"));
  }, []);

  ...
  ...
}
```

An additional limitation of Next.js is that during server-side rendering, it's not possible to get the current path parameters from [the router](https://nextjs.org/docs/api-reference/next/router#router-object).

### Writable filesystem (updated 2024)
Incremental static regeneration requires the file system to be writable. It's a limitation when deploying to certain environments, such as Google App Engine standard environment, with read-only filesystem except `/tmp` path.

Next.js [since version 14.1](https://nextjs.org/blog/next-14-1#improved-self-hosting) supports [configurable cache](https://nextjs.org/docs/app/building-your-application/deploying#configuring-caching), which means that on Google App Engine standard environment, Next.js can use `/tmp` directory to store the files generated during incremental static regeneration. This feature also allows to use other mechanisms for storing the cached items, such as Redis, where the cache can be shared between multiple instances of the application, and easily invalidated with a single request.

A library that can be used to create an ISR cache is [`@neshca/cache-handler`](https://caching-tools.github.io/next-shared-cache) that provides a built-in Redis and in-memory cache handlers, and also allows to create custom cache handlers.

## Example
I built a help page for some company, it features articles and blog posts, fetched from an external API (a headless CMS).

- For an article page, I used **incremental static regeneration**. This way, when an editor makes an update to the article, it'll be visible to the visitors after the cache expires. In this particular case, the expiration time was set to 10 minutes.
- The same for article lists (global and from each category).
- For the search page, I used **server-side rendering**, as it's not possible to predict what the user enters in the search input. The search page has a limited number of results displayed...
- ...and clicking "load more" button performs a call to an **API route**.
- The error page is fully hardcoded in React and doesn't fetch any data, so it's **statically generated**.

Every project has its own requirements, so it's always important to know what tools are available, and when to use them.

## Update (2023)
This article is about Next.js using [`/pages` router](https://nextjs.org/docs/pages/building-your-application/routing). In the newest versions, Next.js has an [`/app` router](https://nextjs.org/docs/app/building-your-application/routing), where individual components may perform their own data fetching.
