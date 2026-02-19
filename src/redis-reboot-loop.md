---
layout: post.liquid
pageTitle: Redis reboot loop
date: 2026-02-19
tags: posts
pageDescription: Investigation a Next.js application failing because of Redis downtime due to reboot loop on Kubernetes
---

Recently, our Next.js application had a downtime for approximately one hour.

## The problem and investigation

Our Next.js application heavily relies on [incremental static regeneration (ISR)](https://nextjs.org/docs/pages/guides/incremental-static-regeneration) feature of Next.js, where:
- initially, pages are generated during build time
- pages are cached for a specified amount of time
- when the cache expires, Next.js initially serves stale content, but in the background, it starts generating a new version of the page
- when the new version is ready, it's saved to the cache

To use ISR, a page must export `getStaticProps` function with `revalidate` property.

By default, Next.js uses in-memory and in-file cache for generated pages, but if an application runs on multiple instances, such a cache is not shared. For this reason, we use Redis as a shared cache.

During the downtime, I checked logs of Next.js, and saw that the application cannot connect to Redis.

So, tried logging into Redis, but `redis-cli` returned message that it cannot connect over TCP to the server.

Checking logs of Redis, I only saw that Redis was starting multiple times. It never reached the point where it was ready to accept connections. Ultimately, it started successfully. There were no other error messages. No "out of memory" type errors or any other. Just a message that it's starting.

Why? It turned out that:

1. The Redis instance was being moved by Kubernetes from one node to another, and the new node was significantly slower.
2. Redis was configured to use RDB persistence, which means that it saves its state to a file on disk.
3. Until the `.rdb` file is loaded, Redis does not accept connections.
4. Last `.rdb` file had several hundred MB of data
5. Loading it into memory took so long on the new node, that the readiness probe of Redis failed, and Kubernetes restarted the container.

This created a loop where Redis was being constantly restarted. The issue repeated until the `.rdb` file was finally loaded in time for the readiness probe to pass.

## Potential solutions

None of these solutions are ideal, but:

1. Increase the timeout for the readiness probe of Redis
2. Use appropriate Kubernetes settings to keep Redis on the same node
3. Decrease limit of data stored in Redis and use auto-eviction policy
4. Disable persistence
