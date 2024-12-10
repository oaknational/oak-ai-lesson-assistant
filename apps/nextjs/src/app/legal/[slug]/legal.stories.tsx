import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "../../../../.storybook/chromatic";
import { LegalContent } from "./legal";

const meta: Meta<typeof LegalContent> = {
  title: "Pages/Legal/Sanity dynamic",
  component: LegalContent,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
};

export default meta;
type Story = StoryObj<typeof LegalContent>;

const fixture = {
  pageData: {
    title: "Cookies Policy",
    slug: "cookies",
    fake_updatedAt: null,
    body: [
      {
        style: "h1",
        _key: "a123e8d0499d",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Cookies Policy",
            _key: "87dc43994d24",
          },
        ],
        _type: "block",
      },
      {
        _key: "ecf8dd84fb68",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Updated 26 June 2024",
            _key: "e863a62ef05c",
          },
        ],
        _type: "block",
        style: "normal",
      },
      {
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve it. By continuing to browse our site, you are agreeing to our use of cookies.",
            _key: "63d9fd04a848",
          },
        ],
        _type: "block",
        style: "normal",
        _key: "62daf349cd86",
      },
      {
        style: "h2",
        _key: "be02a68d7a27",
        markDefs: [],
        children: [
          {
            marks: [],
            text: "What are cookies and web beacons?",
            _key: "f422422bfacd",
            _type: "span",
          },
        ],
        _type: "block",
      },
      {
        _key: "76b0aa6ed603",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "A cookie is a small text file which is downloaded onto your device when you access a website. It allows the website to recognize your device and store some information about your preferences or past actions. Some cookies are essential for the website to function as expected whereas others are optional.",
            _key: "5c6949147b5a",
          },
        ],
        _type: "block",
        style: "normal",
      },
      {
        children: [
          {
            _type: "span",
            marks: [],
            text: "A web beacon, also known as a web bug, pixel tag, or clear GIF, is a clear graphic image (typically one pixel in size) which is delivered through a web browser or HTML e-mail.",
            _key: "d69d0bf30932",
          },
        ],
        _type: "block",
        style: "normal",
        _key: "046692b00499",
        markDefs: [],
      },
      {
        children: [
          {
            _type: "span",
            marks: [],
            text: "How you consent to us placing cookies and how to control them",
            _key: "c24fbcec2ec5",
          },
        ],
        _type: "block",
        style: "h2",
        _key: "4f3aace8a117",
        markDefs: [],
      },
      {
        markDefs: [],
        children: [
          {
            marks: [],
            text: "When you visit our site, you will see a pop-up, which invites users to accept the cookies on our site. You can block cookies by activating the settings on the pop-up that allow you to accept just strictly necessary cookies or customize your choice. However, if you choose to block all except strictly necessary cookies you may not be able to access all or parts of our site and your experience will be limited.",
            _key: "f19e8126f7f1",
            _type: "span",
          },
        ],
        _type: "block",
        style: "normal",
        _key: "74ddad50b32f",
      },
      {
        _type: "block",
        style: "normal",
        _key: "5f7b925ec229",
        markDefs: [],
        children: [
          {
            text: "The cookies placed by our servers cannot access, read or modify any other data on your computer. We may use web beacons alone or in conjunction with cookies to compile information about your usage of our site and interaction with emails from us. For example, we may place web beacons in marketing emails that notify us when you click on a link in the email that directs you to our site, in order to improve our site and email communications. You can manage your cookie settings using the Manage cookie settings link that can be found in the legal section of the website footer on every page.",
            _key: "539a63c71955",
            _type: "span",
            marks: [],
          },
        ],
      },
      {
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "What do we use cookies for?",
            _key: "52ab2b503ca7",
          },
        ],
        _type: "block",
        style: "h2",
        _key: "6ca203cba4e0",
      },
      {
        style: "normal",
        _key: "62cf45577c79",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "We use the following categories of cookies on our site:",
            _key: "ddf15c281e5d",
          },
        ],
        _type: "block",
      },
      {
        style: "h3",
        _key: "70a0b8c1122e",
        markDefs: [],
        children: [
          {
            marks: [],
            text: "Necessary cookies",
            _key: "6167def6aa22",
            _type: "span",
          },
        ],
        _type: "block",
      },
      {
        markDefs: [],
        children: [
          {
            marks: [],
            text: "These are cookies that are essential for the operation of our website. For example, to ensure the security and performance of our website we use Cloudflare services which require a cookie to be stored on your devices. We also use cookies to handle cookie consent, and require cookies to be set for authentication to labs.thenational.academy using our login and authentication tool, Clerk. Your email address may also be sent (via Clerk) to the third-party service PostHog, which we use to ensure our AI features are protected, safe and secure.",
            _key: "3cf8958664cf",
            _type: "span",
          },
        ],
        _type: "block",
        style: "normal",
        _key: "bea0e6958200",
      },
      {
        children: [
          {
            _type: "span",
            marks: [],
            text: "Optional cookies",
            _key: "58a93083bcf0",
          },
        ],
        _type: "block",
        style: "h3",
        _key: "28c8e4682ab8",
        markDefs: [],
      },
      {
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "These can be enabled/disabled using the Manage cookie settings link in the AI Experiments Legal section at the bottom of this page.",
            _key: "d871fac2a1d9",
          },
        ],
        _type: "block",
        style: "normal",
        _key: "2daf2b4df211",
      },
      {
        _type: "block",
        style: "h4",
        _key: "3f07d7f5319c",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Analytical Cookies",
            _key: "57e55c5a8cd0",
          },
        ],
      },
      {
        _key: "7b2020692eec",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "These allow us to gather analytics on your usage of the Oak website. This is important for us as it means we can find and fix bugs or usability issues, improve Oak resources in response to usage data and inform the future services we offer. Typically we collect information such as a device's IP address, device screen size, device type, browser information, approximate geographic location, and the preferred language used to display our website. We use third-party services from PostHog, Sentry and Gleap to enable this part of our website functionality.",
            _key: "bef718ab83f9",
          },
        ],
        _type: "block",
        style: "normal",
      },
      {
        style: "h3",
        _key: "a1c00261cbe8",
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Cookies on the Help Centre",
            _key: "1cd875bcd957",
          },
        ],
        _type: "block",
      },
      {
        markDefs: [
          {
            _type: "link",
            href: "https://support.thenational.academy/",
            _key: "cf43afd9070c",
          },
          {
            _type: "link",
            href: "https://support.thenational.academy/",
            _key: "55157298782b",
          },
          {
            _type: "link",
            href: "https://support.thenational.academy/",
            _key: "8860dba96217",
          },
        ],
        children: [
          {
            _key: "0cf2aa27853b",
            _type: "span",
            marks: [],
            text: "Our Help centre (",
          },
          {
            _type: "span",
            marks: ["cf43afd9070c"],
            text: "support.thenational.academy",
            _key: "6246860655f3",
          },
          {
            _type: "span",
            marks: [],
            text: ") hosted by a third-party provider (Hubspot) allows us to offer users access to support documentation and FAQ articles, and to report an issue or feedback via a form. Cookie settings on ",
            _key: "92fce4018e5e",
          },
          {
            text: "support.thenational.academy",
            _key: "21131787e5fb",
            _type: "span",
            marks: ["55157298782b"],
          },
          {
            _type: "span",
            marks: [],
            text: " and more information about these cookies can be accessed via the cookie banner or the Cookie Settings link near the footer on ",
            _key: "3eae2d126be1",
          },
          {
            _type: "span",
            marks: ["8860dba96217"],
            text: "support.thenational.academy",
            _key: "0262ecc35f15",
          },
          {
            _type: "span",
            marks: [],
            text: " pages.",
            _key: "20533b1c1e46",
          },
        ],
        _type: "block",
        style: "normal",
        _key: "154331911eee",
      },
      {
        markDefs: [],
        children: [
          {
            text: "Third-party cookies",
            _key: "2aee01fdad2a",
            _type: "span",
            marks: [],
          },
        ],
        _type: "block",
        style: "h3",
        _key: "8deee7b0da0b",
      },
      {
        markDefs: [],
        children: [
          {
            _key: "80b11813ef08",
            _type: "span",
            marks: [],
            text: "We are committed to trying to help people we think we can support, find and use our website. Our site and services may contain links to other websites including share and/or “like” buttons. These other websites and services may set their own cookies on your devices, collect data or solicit personal information. You should refer to their cookie and privacy policies to understand how your information may be collected and/or used. Some third party software utilizes its own cookies over which we have little or no control and we cannot be held responsible for the protection of any information you provide when visiting those sites. Any external websites or apps linked to our website are not covered by this policy or our data protection policy or privacy notices. To find out about these cookies, please visit the third party's website.",
          },
        ],
        _type: "block",
        style: "normal",
        _key: "0927f990214a",
      },
      {
        markDefs: [],
        children: [
          {
            _type: "span",
            marks: [],
            text: "Contact Us",
            _key: "f067d98a312a",
          },
        ],
        _type: "block",
        style: "h2",
        _key: "6ebc3b010dd3",
      },
      {
        style: "normal",
        _key: "c76ad1dc59e4",
        markDefs: [
          {
            href: "mailto:privacy@thenational.academy",
            _key: "f4516e1bb571",
            _type: "link",
          },
        ],
        children: [
          {
            _type: "span",
            marks: [],
            text: "If you require any further information or have any questions, comments, or requests regarding this policy and/or our use of Cookies, please contact ",
            _key: "886cf2a0b539",
          },
          {
            _type: "span",
            marks: ["f4516e1bb571"],
            text: "privacy@thenational.academy",
            _key: "9d8151cbab83",
          },
          {
            _type: "span",
            marks: [],
            text: ".",
            _key: "dd3135b7191b",
          },
        ],
        _type: "block",
      },
    ],
  },
};

export const Default: Story = {
  args: fixture,
};
