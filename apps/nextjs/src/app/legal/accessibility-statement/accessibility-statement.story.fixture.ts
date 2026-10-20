import type { PolicyDocument } from "@/cms/types/policyDocument";

export const accessibilityStatementFixture: { pageData: PolicyDocument } = {
  pageData: {
    title: "Accessibility Statement",
    slug: "accessibility-statement",
    body: [
      {
        style: "heading2",
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
        style: "heading2",
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
      {
        _type: "block",
        style: "heading2",
        _key: "a11",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Technical information about this website’s accessibility",
            _key: "a11a",
          },
        ],
      },
      {
        _type: "block",
        style: "heading3",
        _key: "a12",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Compliance status",
            _key: "a12a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a13",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "This website is partially compliant with the Web Content Accessibility Guidelines version 2.2 AA standard, due to the non-compliances listed below.",
            _key: "a13a",
          },
        ],
      },
      {
        _type: "block",
        style: "heading3",
        _key: "a14",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Non-accessible content",
            _key: "a14a",
          },
        ],
      },
      {
        _type: "block",
        style: "heading4",
        _key: "a15",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Non-compliance with the accessibility regulations",
            _key: "a15a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a16",
        listItem: "bullet",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: ["strong"],
            text: "Missing labels:",
            _key: "a16a",
          },
          {
            _type: "span",
            marks: [],
            text: " Some buttons and links lack appropriate accessible names, impacting screen reader users.",
            _key: "a16b",
          },
        ],
      },
      {
        _type: "block",
        style: "heading4",
        _key: "a17",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Disproportionate burden",
            _key: "a17a",
          },
        ],
      },
      {
        _type: "block",
        style: "heading5",
        _key: "a18",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Navigation and accessing information",
            _key: "a18a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a19",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "It’s not always possible to change the device orientation from horizontal to vertical without making it more difficult to view the content.",
            _key: "a19a",
          },
        ],
      },
      {
        _type: "block",
        style: "heading2",
        _key: "a20",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "What we’re doing to improve accessibility",
            _key: "a20a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a21",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "We plan to fix these issues in this order:",
            _key: "a21a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a22",
        listItem: "number",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Add accessible names to buttons and links.",
            _key: "a22a",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        _key: "a23",
        listItem: "number",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Add headings and landmarks to every page.",
            _key: "a23a",
          },
        ],
      },
    ],
  },
};
