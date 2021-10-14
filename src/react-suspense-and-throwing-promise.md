---
layout: post.liquid
pageTitle: React Suspense and throwing a Promise
date: 2021-06-21
tags: posts
---

Do you know that in JavaScript, you `throw` a `Promise`? This is used in a new feature of React, called Suspense.

## What is React Suspense?

React Suspense is an upcoming feature of React, where a component, descendant of a `<Suspense>` component, can notify that it's not ready for being rendered, so that Suspense can render a fallback in the meantime.

For example, this React code:
```
<Suspense fallback={null}>
  ...
  <div>
    <AsynchronouslyInitializingComponent />
  <div>
  ...
</Suspense>
```
will be rendered as `null` until the `AsynchronouslyInitializingComponent` notifies that it's ready, then all descendants of `Suspense` will be rendered normally. If no component inside `Suspense` notifies that it's not ready, the content is rendered immediately.

When there are more than one "suspended" component inside a single `Suspense` component, `Suspense` will be displaying the fallback until all components are ready. Revealing order may be also controlled by [SuspenseList](https://reactjs.org/docs/concurrent-mode-patterns.html#suspenselist).

## React requirements

### React versions before 18

Suspense is available in React experimental packages: `react@experimental` and `react-dom@experimental`, and requires running React in **concurrent mode**:
```
const node = document.querySelector("#react-root");
ReactDOM.createRoot(node).render(<OutermostComponent />);
```
or **blocking mode**:
```
const node = document.querySelector("#react-root");
ReactDOM.createBlockingRoot(node).render(<OutermostComponent />);
```
while the conventional mode is enabled this way:
```
const node = document.querySelector("#react-root");
ReactDOM.render(<OutermostComponent />, node);
```
Concurrent mode enables, in addition to Suspense, new features, at the cost of disabling deprecated features. Blocking mode provides compatibility with earlier mode, but has only a subset of the new concurrent mode features. [See documentation for details](https://reactjs.org/docs/concurrent-mode-adoption.html).

### React versions since 18

According to [React 18 announcement](https://reactjs.org/blog/2021/06/08/the-plan-for-react-18.html) and [concurrent mode change discussion](https://github.com/reactwg/react-18/discussions/64), since version 18:
- the concurrent features will be available by default, when using concurrent mode (`ReactDOM.createRoot`),
- old rendering mode (`ReactDOM.render`) will be deprecated,
- blocking mode (`ReactDOM.createBlockingRoot`) won't be available.

As of writing this article, it's still an upcoming release, so the library API may change.

## When to use it?

When is it useful? The most obvious use case is API data fetching. When you have multiple components, each fetching data, Suspense makes it possible to prevent the whole page - or a part of the page - from being incompletely rendered, displaying a spinner until all components are ready. It's much simpler than using some state management system to check if all data is loaded, especially if it's loaded by each component individually, like in libraries such as `swr` or `react-query`.

More and more data fetching libraries get Suspense support added. Suspense is supported by [swr](https://www.npmjs.com/package/swr) library, by setting a specific configuration flag. For GraphQL, [Relay](https://relay.dev/docs/migration-and-compatibility/suspense-compatibility/) will be able to use Suspense after it becomes fully stable in React.

Suspense can be used also for components that use asynchronously initiated libraries - I used Suspense with [@react-three/fiber](https://www.npmjs.com/package/@react-three/fiber) - a library for displaying 3D graphics with WebGL inside React.

But there are other cases. Suspense can be used for lazy loading components. React documentation [shows an example](https://reactjs.org/docs/concurrent-mode-suspense.html), where the component code is fetched using asynchronous `import` in `React.lazy`:
```
const ProfilePage = React.lazy(() => import('./ProfilePage'));
```
In this case, ProfilePage becomes a suspended component.

## How does a component notify that it's not ready yet?

By throwing a Promise when rendering.

An error thrown during rendering, but not being a Promise, will be handled in the usual way - either caught by an [error boundary](https://reactjs.org/docs/error-boundaries.html) if present, or crashing the complete page.

But throwing a Promise, when the rendered component is a descendant of `<Suspense>`, is treated in a different way. When the Promise is pending, React considers the component suspended. When the promise becomes resolved, it means that the component is ready. When the promise becomes rejected, it's treated just like a regular error.

An example of throwing a Promise is shown in [official React examples](https://codesandbox.io/s/jovial-lalande-26yep?file=/src/fakeApi.js).

## Further reading

[This article](https://css-tricks.com/react-suspense-in-practice/) shows how to use Suspense to lazy-load components in navigation, and also describes how to use `useTransition` feature of React concurrent mode.
