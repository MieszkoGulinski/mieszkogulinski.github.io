---
layout: post.liquid
pageTitle: JSX components in React are JavaScript identifiers
date: 2021-09-25
tags: posts
pageDescription: JSX syntax in React - how to conditionally display one of the available React components or HTML elements
---

In React with JSX, rendering a JSX tag name beginning with a capital letter takes the component specification from an **identifier** in the surrounding scope.

It means that if you render `<SomeName />` in JSX, and you have a function under identifier `SomeName`, React will use it as the functional component. If there's a class, inheriting from `React.Component`, React will render it as a class component.

## Directly render a HTML tag

But there's another possibility. If the variable under that identifier is a **string**, the component will be rendered directly as a HTML component. For example a component declared like that:

```
const PageHeader = () => {
  const HeaderComponent = 'h1';
  return <HeaderComponent>Page Name</HeaderComponent>;
}
```
will be rendered as HTML `<h1>Page Name</h1>`.

This particular example isn't really useful, but the string with HTML element name could be selected by some logic. For example, a component could select the resulting HTML header level depending on a number given in props:

```
const componentNamesByLevel = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5'
}

const Header = (props) => {
  const { level, children } = props;
  const HeaderComponent = componentNamesByLevel[level] || 'h5';
  return <HeaderComponent>{children}</HeaderComponent>;
}
```

Note that if you use TypeScript, it may complain about about using a string in place of a React component.

## One or another component

Also, don't forget that it's possible to have configurable component as different name.
```
const RedText = (props) => {
  return <span style={{ color: 'red' }}>{props.children}</span>;
}
const GreenText = () => {
  return <span style={{ color: 'green' }}>{props.children}</span>;
}

const Header = (props) => {
  const TextComponent = props.green ? GreenText : RedText;
  return (
    <h1>
      <TextComponent>{props.children}</TextComponent>
    </h1>
  );
}
```
A component can also come as prop to another component. For example, in MUI library, [component Dialog can accept a component in BackdropComponent prop](https://mui.com/material-ui/api/dialog/).

Also, it's possible to combine both possibilities - for example if we want to pass a component in props, or use some default HTML tag, we can do something like that:
```
const Item = (props) => {
  const Component = props.component || 'div';
  return <Component>...</Component>;
}
```
where `props.component` can be a React component, or a string.

## Why did I write that?

It's very easy to forget about this capability of React, when in the code a single component is always under a single identifier:
```
import SomeComponent from './SomeComponent';

const SomeOtherComponent = (props) => {
  ...
  return <SomeComponent> ... </SomeComponent>
}
```

Let's not forget that React component name works just like every other identifier in JavaScript.
