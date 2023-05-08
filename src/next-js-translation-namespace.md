---
layout: post.liquid
pageTitle: Next.js and FormatJS language namespacing
date: 2023-05-08
tags: posts
---

As a part of my job, I work on a certain website using Next.js and FormatJS. As indicated by [Pagespeed Insights](https://pagespeed.web.dev/), file `_app.tsx` has lots of unused code andits size could be reduced to improve loading time and decrease data usage. Here's an optimization that reduces bundle size when using FormatJS and Next.js, especially for large websites.

## Problem

When working with Next.js and FormatJS, most tutorials tells us to import JSON files with [compiled](https://formatjs.io/docs/getting-started/message-distribution#compiling-messages) translations inside `_app.tsx` and pass the correct translation into, like that:

```tsx
import translationsPL from "../locales/compiled/pl.json";
import translationsEN from "../locales/compiled/en.json";
// ... other languages ...

function MyApp(props) {
  const { Component, pageProps } = props;
  const router = useRouter();

  const locale = pageProps.locale ?? router.locale;
  const messages = useMemo(() => {
    switch (locale) {
      case "pl":
        return translationsPL;
      case "en":
        return translationsEN;
      // ... other languages ...
      // ...
      // ...
      default:
        return translationPL;
    }
  }, [locale]);

  return (
    {/* ... other providers ... */}
      <IntlProvider locale={locale} messages={messages}>
        {/* ... other providers ... */}
          <Component {...pageProps} />
        {/* ... other providers ... */}
      </IntlProvider>
    {/* ... other providers ... */}
  );
}
```

It works, but it's wasteful. It causes **all** translations to be loaded on **every** page. With lots of languages and lots of pages, it'll cause the downloaded JS size to significantly grow.

## Solution

After trying several other ideas, I found a working solution:
1. Make translations namespaced
2. Split messages into multiple files
3. Merge shared messages and namespaced translations and pass it into another IntlProvider

### Make translations namespaced

As we currently use explicit id for every translated text, for texts that are page-specific, not shared, we changed translation ids to format `[somenamespace]::[sometranslation]`. The separator is `::` but it could be actually any character or character sequence that doesn't otherwise exist in any existing translation id.

For example:
```ts
intl.formatMessage({
  id: "some-translation-id",
  defaultMessage: "some text"
})
```

became:
```ts
intl.formatMessage({
  id: "mynamespace::some-translation-id",
  defaultMessage: "some text"
})
```

and this:
```tsx
<FormattedMessage
  id="some-translation-id-2"
  defaultMessage="another text"
/>
```

became:
```tsx
<FormattedMessage
  id="anothernamespace::some-translation-id-2"
  defaultMessage="another text"
/>
```

Shared messages, that don't go to any namespace, don't have namespace name and separator prepended.

Note that moving translations to namespaces can be done gradually - messages not moved to a namespace so far will stay in shared messages.

### Split messages into multiple files

After running [compilation script](https://formatjs.io/docs/getting-started/message-distribution#compiling-messages) (`formatjs compile`), the compiled files (pl.json, en.json) contain all translations, including namespaced ones. Then, a custom-written Node.js script reads the compiled files, identifies what namespaces exist and what keys are in each, and writes files with namespace name prepended (or nothing prepended for shared messages):

```
pl.json
en.json
...
mynamespace-pl.json
mynamespace-en.json
...
anothernamespace-pl.json
anothernamespace-en.json
...
...
...
```

The `[namespacename]-[languageid].json` files have identical format to compiled `[languageid].json`, but contain files only from a given namespace.

### Merge shared messages and namespaced translations and pass it into another IntlProvider

Because `useIntl` hook returns current locale and all available messages, it's possible to get the shared messages and locale from there, and pass them (with namespaced messages added) to another `IntlProvider`. Then, every component inside the new `IntlProvider` will use the new, larger translations set.

A component that provides namespaced translations to its children could look like that:

```tsx
import translationsPL from "../locales/compiled/mynamespace-pl.json";
import translationsEN from "../locales/compiled/mynamespace-en.json";
// ... other languages ...

const MyNamespaceTranslationsProvider = (props) => {
  const { children, translations } = props;
  const { locale, messages: commonMessages } = useIntl(); // <- imports messages from the upper IntlProvider

  const allMessages = useMemo(() => {
    let namespacedMessages = translationsPL;
    switch (locale) {
      case "pl":
        namespacedMessages = translationsPL;
        break;
      case "en":
        namespacedMessages = translationsEN;
        break;
      // ... other languages ...
    }

    // Merge messages from the upper IntlProvider with locally imported one
    return { ...commonMessages, ...namespacedMessages }; 
  }, [locale, commonMessages]);

  // Provide merged messages to the components inside
  return (
    <IntlProvider locale={locale} messages={allMessages}>
      {children}
    </IntlProvider>
  );
};

```

Then, it can be used e.g. on a file in `src/pages/pageName.tsx`:

```tsx
import NamespacedTranslationsProvider from "../../components-v2/NamespacedTranslationsProvider";
// ... other imports

const SomePage = () => {
  return (
    <MyNamespaceTranslationsProvider>
      {/* .... other content .... */}
    </MyNamespaceTranslationsProvider>
  );
};

export default SomePage;
```

## Results

How much it's going to help? It very much depends on size of translations on your site, how many languages you support, and how many messages can be moved to their namespaces.

In my case, moving content of several pages to namespaces (not all of them, we can move more texts) decreased `_app.tsx` size by tens of kB.
