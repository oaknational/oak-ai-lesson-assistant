"use client";

import { OakBox, OakHeading, OakP, OakLink } from "@oaknational/oak-components";
import Link from "next/link";

import Layout from "@/components/Layout";

export const CookiePolicyContent = (featureFlag) => {
  return (
    <Layout featureFlag={featureFlag}>
      <OakBox $ph="inner-padding-xl">
        <OakHeading tag="h1" $font="heading-4" $mb="space-between-s">
          Cookies Policy
        </OakHeading>
        <OakP $mb="space-between-s">Updated 26 June 2024</OakP>
        <OakP $mb="space-between-s">
          Our website uses cookies to distinguish you from other users of our
          website. This helps us to provide you with a good experience when you
          browse our website and also allows us to improve it. By continuing to
          browse our site, you are agreeing to our use of cookies.
        </OakP>

        <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
          What are cookies and web beacons?
        </OakHeading>
        <OakP $mb="space-between-s">
          A cookie is a small text file which is downloaded onto your device
          when you access a website. It allows the website to recognize your
          device and store some information about your preferences or past
          actions. Some cookies are essential for the website to function as
          expected whereas others are optional.
        </OakP>
        <OakP $mb="space-between-s">
          A web beacon, also known as a web bug, pixel tag, or clear GIF, is a
          clear graphic image (typically one pixel in size) which is delivered
          through a web browser or HTML e-mail.
        </OakP>

        <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
          How you consent to us placing cookies and how to control them
        </OakHeading>
        <OakP $mb="space-between-s">
          When you visit our site, you will see a pop-up, which invites users to
          accept the cookies on our site. You can block cookies by activating
          the settings on the pop-up that allow you to accept just strictly
          necessary cookies or customize your choice. However, if you choose to
          block all except strictly necessary cookies you may not be able to
          access all or parts of our site and your experience will be limited.
        </OakP>
        <OakP $mb="space-between-s">
          The cookies placed by our servers cannot access, read or modify any
          other data on your computer. We may use web beacons alone or in
          conjunction with cookies to compile information about your usage of
          our site and interaction with emails from us. For example, we may
          place web beacons in marketing emails that notify us when you click on
          a link in the email that directs you to our site, in order to improve
          our site and email communications. You can manage your cookie settings
          using the Manage cookie settings link that can be found in the legal
          section of the website footer on every page.
        </OakP>

        <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
          What do we use cookies for?
        </OakHeading>
        <OakP $mb="space-between-s">
          We use the following categories of cookies on our site:
        </OakP>

        <OakHeading tag="h3" $mb="space-between-s" $font="heading-5">
          Necessary cookies
        </OakHeading>
        <OakP $mb="space-between-s">
          These are cookies that are essential for the operation of our website.
          For example, to ensure the security and performance of our website we
          use Cloudflare services which require a cookie to be stored on your
          devices. We also use cookies to handle cookie consent, and require
          cookies to be set for authentication to labs.thenational.academy using
          our login and authentication tool, Clerk. Your email address may also
          be sent (via Clerk) to the third-party service PostHog, which we use
          to ensure our AI features are protected, safe and secure.
        </OakP>

        <OakHeading tag="h3" $mb="space-between-s" $font="heading-5">
          Optional cookies
        </OakHeading>
        <OakP $mb="space-between-s">
          These can be enabled/disabled using the Manage cookie settings link in
          the AI Experiments Legal section at the bottom of this page.
        </OakP>

        <OakHeading tag="h4" $mb="space-between-s" $font="heading-6">
          Analytical Cookies
        </OakHeading>
        <OakP $mb="space-between-s">
          These allow us to gather analytics on your usage of the Oak website.
          This is important for us as it means we can find and fix bugs or
          usability issues, improve Oak resources in response to usage data and
          inform the future services we offer. Typically we collect information
          such as a device&#39;s IP address, device screen size, device type,
          browser information, approximate geographic location, and the
          preferred language used to display our website. We use third-party
          services from PostHog, Sentry and Gleap to enable this part of our
          website functionality.
        </OakP>

        <OakHeading tag="h3" $mb="space-between-s" $font="heading-5">
          Cookies on the Help Centre
        </OakHeading>
        <OakP $mb="space-between-s">
          Our Help centre{" ("}
          <OakLink
            element={Link}
            className="text-blue"
            href="https://support.thenational.academy"
          >
            support.thenational.academy
          </OakLink>
          {") "}hosted by a third-party provider (Hubspot) allows us to offer
          users access to support documentation and FAQ articles, and to report
          an issue or feedback via a form. Cookie settings on{" "}
          <OakLink
            element={Link}
            className="text-blue"
            href="https://support.thenational.academy"
          >
            support.thenational.academy
          </OakLink>{" "}
          and more information about these cookies can be accessed via the
          cookie banner or the Cookie Settings link near the footer on{" "}
          <OakLink
            element={Link}
            className="text-blue"
            href="https://support.thenational.academy"
          >
            support.thenational.academy
          </OakLink>{" "}
          pages.
        </OakP>

        <OakHeading tag="h3" $mb="space-between-s" $font="heading-5">
          Third-party cookies
        </OakHeading>
        <OakP $mb="space-between-s">
          We are committed to trying to help people we think we can support,
          find and use our website. Our site and services may contain links to
          other websites including share and/or “like” buttons. These other
          websites and services may set their own cookies on your devices,
          collect data or solicit personal information. You should refer to
          their cookie and privacy policies to understand how your information
          may be collected and/or used. Some third party software utilizes its
          own cookies over which we have little or no control and we cannot be
          held responsible for the protection of any information you provide
          when visiting those sites. Any external websites or apps linked to our
          website are not covered by this policy or our data protection policy
          or privacy notices. To find out about these cookies, please visit the
          third party&#39;s website.
        </OakP>

        <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
          Contact Us
        </OakHeading>
        <OakP $mb="space-between-s">
          If you require any further information or have any questions,
          comments, or requests regarding this policy and/or our use of Cookies,
          please contact{" "}
          <OakLink
            element={Link}
            className="text-blue"
            href="mailto:privacy@thenational.academy"
          >
            privacy@thenational.academy
          </OakLink>
          {"."}
        </OakP>
      </OakBox>
    </Layout>
  );
};

export default CookiePolicyContent;
