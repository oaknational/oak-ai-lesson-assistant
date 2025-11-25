import type { PolicyDocument } from "@/cms/types/policyDocument";

export const accessibilityStatementFixture: { pageData: PolicyDocument } = {
  pageData: {
    title: "Accessibility Statement",
    slug: "accessibility-statement",
    fake_updatedAt: null,
    body: [
      {
        style: "h1",
        _key: "a1",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Accessibility Statement",
            _key: "a1a",
          },
        ],
        _type: "block",
      },
      {
        style: "h2",
        _key: "a2",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Introduction",
            _key: "a2a",
          },
        ],
        _type: "block",
      },
      {
        _key: "a3",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "This accessibility statement applies to the website at the address below, which is owned and operated by Oak National Academy Limited.",
            _key: "a3a",
          },
        ],
        _type: "block",
        style: "normal",
      },
      {
        _key: "a4",
        markDefs: [
          {
            _type: "link",
            href: "https://labs.thenational.academy",
            _key: "link1",
          },
        ],
        children: [
          {
            _type: "span",
            marks: ["link1"],
            text: "https://labs.thenational.academy",
            _key: "a4a",
          },
        ],
        _type: "block",
        style: "normal",
      },
      {
        _key: "a5",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "We want as many people as possible to be able to use this website. For example, that means you should be able to:",
            _key: "a5a",
          },
        ],
        _type: "block",
        style: "normal",
      },
      {
        _type: "block",
        style: "normal",
        _key: "a6",
        listItem: "bullet",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Change colors, contrast levels, and fonts;",
            _key: "a6a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a7",
        listItem: "bullet",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Read and use most of the website while zoomed in up to 400%;",
            _key: "a7a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a8",
        listItem: "bullet",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Navigate most of the website using just a keyboard;",
            _key: "a8a",
          },
        ],
      },
      {
        style: "h2",
        _key: "a9",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Feedback and contact information",
            _key: "a9a",
          },
        ],
        _type: "block",
      },
      {
        _key: "a10",
        markDefs: [
          {
            _type: "link",
            href: "mailto:help@thenational.academy",
            _key: "link2",
          },
        ],
        children: [
          {
            _type: "span",
            marks: [],
            text: "If you need information on this website in a different format, please contact us at ",
            _key: "a10a",
          },
          {
            _type: "span",
            marks: ["link2"],
            text: "help@thenational.academy",
            _key: "a10b",
          },
          {
            _type: "span",
            marks: [],
            text: ".",
            _key: "a10c",
          },
        ],
        _type: "block",
        style: "normal",
      },
    ],
  },
};
