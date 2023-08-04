---
layout: post.liquid
pageTitle: Next.js conditional dynamic import
date: 2023-05-16
tags: posts
pageDescription: How to use Next.js dynamic import more effectively
---

While [it's not fully clear from documentation](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading), and a [Stack Overflow answer](https://stackoverflow.com/questions/66791922/conditionally-import-module-using-next-js-dynamic-import-ssr-doesnt-work) doesn't provide that information explicitly enough, Next.js dynamic import can be used for **conditional** importing of React components.

Most examples of dynamic import are about a case where a component is displayed or not, like a modal opened on clicking a button:
```tsx
import dynamic from "next/dynamic";
const Modal = dynamic(() => import("./Modal"));

const ComponentOpeningModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return <>
    <button onClick={() => setIsModalOpen(true)}>Open</button>
    {isOpen? <Modal onClose={() => setIsModalOpen(false)}/> : null}
  </>
}
```

But let's not forget that it's also possible to conditionally import and display one of several available components.

## Example code

For a moment let's forget about translation libraries, and let's suppose that we have several variants of components for multiple languages. In actual usage, dynamic import makes sense when the components are large, but for the purpose of this example, let's consider these examples:

```tsx
const GreetingEN: React.FC = () => <div>Hello!<div>;
export default GreetingEN;
```

```tsx
const GreetingPL: React.FC = () => <div>Cześć!</div>;
export default GreetingPL;
```

```tsx
const GreetingJA: React.FC = () => <div>こんにちは</div>;
export default GreetingJA;
```

Let's augment the code with `console.log`:

```tsx
console.log('import EN');
const GreetingEN: React.FC = () => {
  console.log('render EN');
  return <div>Hello!<div>
}
export default GreetingEN;
```
```tsx
console.log('import PL');
const GreetingPL: React.FC = () => {
  console.log('render PL');
  return <div>Cześć!</div>
}
export default GreetingPL;
```
```tsx
console.log('import JA');
const GreetingJA: React.FC = () => {
  console.log('render JA');
  return <div>こんにちは</div>
}
export default GreetingJA;
```

Let's create a component that imports and displays one of the available components:

```tsx
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const GreetingPL = dynamic(() => import("./GreetingPL"));
const GreetingEN = dynamic(() => import("./GreetingPL"));
const GreetingJA = dynamic(() => import("./GreetingJA"));

const greetingsByLanguage = {
  pl: GreetingPL,
  en: GreetingEN,
  ja: GreetingJA
}

const Greeting: React.FC = () => {
  const { locale } = useRouter();
  const GreetingComponent = greetingsByLanguage[locale];
  return <GreetingComponent />
}
```

In the browser console, when the locale is `en`, we can see `import EN` and `render EN`, but not `import PL` or `import JA`. After changing the locale of the displayed page, by clicking a `Link` component pointing to the same page but with a different locale, we can see the corresponding `import` and `render` messages.

It means that the dynamic import actually works for conditionally displaying React components.
