# Storybook mocking

These files are used to help us mock out certain libraries and providers for use in Storybook.

## Libraries that are incompatible with Storybook

The package.json file includes subpath imports for libraries which causes us problems when we try to display certain components in Storybook.

Some server components have imports for libraries that should only be included on the server side, but Storybook seems unable to differentiate.

For instance, next/navigation and prisma both cause trouble.

To solve this, we provide mocks and rather than importing these files directly, we have some subpath aliases.

In package.json, you will see lines like this:

```
"imports": {
  "#next/navigation": {
    "storybook": "./src/mocks/next/navigation.ts",
    "default": "next/navigation"
  },
  ...
}
```

When we do `import {...} from "#next/navigation;` this means that in the normal environment we are importing next/navigation as normal, but in Storybook we are importing the mock that is defined in this folder.

[Read more in Storyboard's documentation](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-modules#subpath-imports) on how this works. 

## Mocked providers

In addition to these mocked imports, we also want to ensure that certain providers are mocked out. For instance, analytics, we do not want any analytics events to fire when in the Storybook environment, but we do want to know that these events are firing. So we mock out the analytics provider here. 

## Clerk

Clerk is mocked here too, because internally Clerk detects if it has been instantiated more than once on a page. Since Storybook displays more than one component on a page at any time, this results in only the first component being displayed. We use a subpath import to mock it, so that we can display more than one component on a page.