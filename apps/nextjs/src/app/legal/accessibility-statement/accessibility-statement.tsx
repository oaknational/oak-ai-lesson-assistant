"use client";

import {
  OakBox,
  OakHeading,
  OakLI,
  OakLink,
  OakP,
  OakUL,
} from "@oaknational/oak-components";

import Layout from "@/components/Layout";

export const AccessibilityStatementContent = (featureFlag) => {
  return (
    <Layout featureFlag={featureFlag}>
      <OakBox $pt="inner-padding-l">
        <OakHeading tag="h1" $font="heading-4" $mb="space-between-s">
          Accessibility Statement
        </OakHeading>
        <OakP $mb="space-between-s">
          <strong>Introduction</strong>
        </OakP>
        <OakP $mb="space-between-s">
          This accessibility statement applies to the website at the address
          below, which is owned and operated by Oak National Academy Limited.{" "}
          <OakLink href="https://labs.thenational.academy">
            https://labs.thenational.academy
          </OakLink>
        </OakP>
        <OakP $mb="space-between-s">
          We want as many people as possible to be able to use this website. For
          example, that means you should be able to:
        </OakP>
        <OakUL $ph="inner-padding-xl">
          <OakLI $pv="inner-padding-xs">
            Change colors, contrast levels, and fonts;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Read and use most of the website while zoomed in up to 400%;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Navigate most of the website using just a keyboard;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Navigate most of the website using speech recognition software;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Listen to most of the website using a screen reader (including the
            most recent versions of JAWS, NVDA, and VoiceOver).
          </OakLI>
        </OakUL>
        <OakP $mb="space-between-s">
          We&#39;ve also made the website text as simple as possible to
          understand.
        </OakP>
        <OakP $mb="space-between-s">
          There are many options for you to customize your web browser and
          device to help you navigate this (and other) websites more easily.
          AbilityNet has helpful advice on making your device easier to use if
          you have a disability.
        </OakP>

        <OakP $mb="space-between-s">
          <strong>Feedback and contact information</strong>
        </OakP>
        <OakP $mb="space-between-s">
          We appreciate your feedback and your understanding, particularly if
          you are experiencing a frustrating problem with accessing parts of our
          website, including our lessons. We are keen to offer a service that
          supports as wide a set of needs as possible.
        </OakP>
        <OakP $mb="space-between-s">
          If you need information on this website in a different format, like
          accessible PDF, large print, easy read, audio recording, or braille:
        </OakP>
        <OakUL $ph="inner-padding-xl">
          <OakLI $pv="inner-padding-xs">
            Email{" "}
            <OakLink href="mailto:help@thenational.academy">
              help@thenational.academy
            </OakLink>
            ;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Use our ‘Feedback&#39; widget and provide us with your details.
          </OakLI>
        </OakUL>
        <OakP $mb="space-between-s">
          Report an issue by completing the short form found on our contact-us
          page,{" "}
          <OakLink href="https://www.thenational.academy/contact-us">
            https://www.thenational.academy/contact-us
          </OakLink>
        </OakP>
        <OakP $mb="space-between-s">
          Please also contact us if you find any problems which are not listed
          on this page or think we&#39;re not meeting accessibility
          requirements.
        </OakP>

        <OakP $mb="space-between-s">
          <strong>How accessible is our website?</strong>
        </OakP>
        <OakP $mb="space-between-s">
          We are committed to making this website accessible, in accordance with
          the Public Sector Bodies (Websites and Mobile Applications) (No. 2)
          Accessibility Regulations 2018 (“the accessibility regulations”). We
          build our site to be compliant with the Web Content Accessibility
          Guidelines (WCAG) 2.1 and the Draft Web Content Accessibility
          Guidelines version 2.2. We are compliant with these standards except
          as highlighted below.
        </OakP>

        <OakP $mb="space-between-s">
          <strong>Non-accessible content</strong>
        </OakP>
        <OakP $mb="space-between-s">
          The content listed below is non-accessible for the following reasons:
        </OakP>
        <OakP $mb="space-between-s">
          <strong>Non-compliance with the accessibility regulations</strong>
        </OakP>
        <OakUL $ph="inner-padding-xl">
          <OakLI $pv="inner-padding-xs">
            Controls for a &#39;Feedback&#39; widget component are not keyboard
            accessible;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Skip links are missing which should allow users to bypass repeated
            elements such as the page navigation;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Some form fields are missing required attributes to let users know
            they are needed along with labels stating the fields are also
            required;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Text can be found styled as a heading but does not have the
            appropriate HTML tag along with some pages having illogical heading
            hierarchies;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Several buttons have generic label text which does not specify the
            button&#39;s purpose;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Buttons that control interactive elements are missing appropriate
            attributes or labels;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Content is presented visually as a list, but the HTML structure does
            not reflect this;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Pages contain multiple header elements, but they have no unique
            names or labels to help differentiate them;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            At 400% zoom there are some reflow issues with elements and when
            adjusting the text spacing some content is clipped off the page;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            Error suggestion text is not specific about how to resolve issues.
          </OakLI>
        </OakUL>
        <OakP $mb="space-between-s">
          <strong>Disproportionate burden</strong>
        </OakP>
        <OakP $mb="space-between-s">
          We&#39;ve assessed the cost of fixing the issues listed below with
          navigation and accessing information, and with interactive tools and
          transactions. We believe that doing so now would be a disproportionate
          burden within the meaning of the accessibility regulations.
        </OakP>
        <OakP $mb="space-between-s">
          <strong>Navigation and accessing information</strong>
        </OakP>
        <OakUL $ph="inner-padding-xl">
          <OakLI $pv="inner-padding-xs">
            It&#39;s not always possible to change the device orientation from
            horizontal to vertical without making it more difficult to view the
            content;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            It&#39;s not possible for users to change text size without some of
            the content overlapping in some circumstances.
          </OakLI>
        </OakUL>
        <OakP $mb="space-between-s">
          <strong>Interactive tools and transactions</strong>
        </OakP>
        <OakP $mb="space-between-s">
          We use Hubspot to host a support knowledge base at{" "}
          <OakLink href="https://support.thenational.academy">
            support.thenational.academy
          </OakLink>
          . Some pages on this subdomain fail some automated accessibility
          checks.
        </OakP>

        <OakP $mb="space-between-s">
          <strong>What are we doing to improve accessibility</strong>
        </OakP>
        <OakP $mb="space-between-s">
          As highlighted above, we have work planned to address areas of
          non-compliance (except for cases of disproportionate burden).
        </OakP>
        <OakP $mb="space-between-s">
          The website currently undergoes daily automated quality assurance
          testing during our deployment process. We also do regular manual
          quality checks with Gov.uk&#39;s published list of modern browsers. We
          regularly commission an independent accessibility audit on a sample of
          pages to highlight areas requiring improvement.
        </OakP>

        <OakP $mb="space-between-s">
          <strong>Enforcement procedure</strong>
        </OakP>
        <OakP $mb="space-between-s">
          The Equality and Human Rights Commission (EHRC) is responsible for
          enforcing the Public Sector Bodies (Websites and Mobile Applications)
          (No. 2) Accessibility Regulations 2018 (the ‘accessibility
          regulations&#39;). If you&#39;re not happy with how we respond to your
          complaint,{" "}
          <OakLink href="https://www.equalityadvisoryservice.com/">
            contact the Equality Advisory and Support Service (EASS)
          </OakLink>
          .
        </OakP>

        <OakP $mb="space-between-s">
          <strong>Preparation of this accessibility statement</strong>
        </OakP>
        <OakP $mb="space-between-s">
          This statement was prepared on 27 September 2023 and is amended
          regularly, in line with any changes we make to our website.
        </OakP>
      </OakBox>
    </Layout>
  );
};

export default AccessibilityStatementContent;
