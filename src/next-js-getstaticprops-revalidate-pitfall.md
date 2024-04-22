---
layout: post.liquid
pageTitle: Next.js getStaticProps + revalidate pitfall
date: 2024-04-19
tags: posts
pageDescription: Beware of a pitfall when using Next.js getStaticProps with revalidate, when the page displays stale data.
---

This mistake may seem obvious after it's explained, but it's easy to make, so it's worth mentioning in case you run into it. The shortest way to explain it is:

A freshly started Next.js instance, displaying page using `getStaticProps` with `revalidate`, before the time specified in the `revalidate` field has passed, will display the data valid at the time the website was built. This is an issue when running Next.js in an environment that can start and stop instances automatically - when a new instance is started, it will display stale data until the time specified in the `revalidate` field has passed since the instance was started.

## More detailed explanation

Let's imagine that we build a website using Next.js, displaying current weather conditions. Let's assume that fetching the weather data is expensive, and the website has a significant amount of traffic, so we don't want to fetch the data on every request. That's why the website uses `getStaticProps` with `revalidate` set to 10 minutes.

Let's assume that the website is built on April 10, then converted to a Docker image. The Docker image is pushed to a registry, and the website is deployed to a service such as Google Cloud Run or AWS Fargate.

Then let's assume that it's April 15, 10:00, and the website scaled up from 1 instance to 2 instances. The hosting service takes the Docker image and starts a new instance from it. While the old instance displays fresh data, the new instance displays the weather data that was valid on April 10, because this is the data that is stored in the Docker image, and is assumed to be valid until the time specified in the `revalidate` field passes. This results in some of the users seeing stale data, while others see fresh (correct) data. After 10:10 (10 minutes from the instance start), the new instance will start displaying fresh data, and all users will see roughly the same response.

This is a result of behavior described in [Next.js documentation about incremental state revalidation](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration), saying:
> When a request is made to a page that was pre-rendered at build time, it will initially show the cached page.

A mistake like that may result in a page displaying invalid data, **seemingly nondeterministically** - the invalid data may appear for some users only but not for other ones, or the page may start working correctly after some time passes, e.g. on a page refresh.

## How to avoid this pitfall

One of the way to mitigate this issue, while still keeping the benefits of `getStaticProps` with `revalidate`, is to set the `revalidate` field to a very low value during the build phase, and to a desired value in the production phase. This way, the page will display stale data after the server start, only on the first request. After that, the cache will go back to the desired value, e.g. 10 minutes.

```tsx
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// ...

export async function getStaticProps() {
  // ... fetch the props here ...

  return {
    props: {
      // ... insert props here ...
    },
    revalidate: (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD)? 1 : 60 * 10, // 1 second in build, 10 minutes in production
  };
}
```

