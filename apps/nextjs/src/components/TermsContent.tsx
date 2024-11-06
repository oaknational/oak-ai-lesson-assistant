import {
  OakBox,
  OakHeading,
  OakLI,
  OakLink,
  OakP,
  OakUL,
} from "@oaknational/oak-components";
import Link from "next/link";

const TermsContent = () => {
  return (
    <OakBox $pt="inner-padding-l">
      <OakHeading tag="h1" $font="heading-4" $mb="space-between-s">
        Terms and Conditions
      </OakHeading>
      <OakP $mb="space-between-s">
        If you continue to browse or use this website and the services offered,
        you are agreeing to comply with and be bound by the following terms and
        conditions of use.
      </OakP>

      <OakP $mb="space-between-s">
        The terms “Oak”, “us” and “we” refer to the owner of the website, Oak
        National Academy Limited. The term “you” refers to the user or viewer of
        our website.
      </OakP>

      <OakP $mb="space-between-s">
        The use of this website is subject to the following terms and
        conditions, which we can update at any time without notice:
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Registration and access
      </OakHeading>
      <OakP $mb="space-between-s">
        This service is intended to be used by teachers and educators. To use
        this website, you must register for an account. Please see our{" "}
        <OakLink element={Link} className="text-blue" href="/legal/privacy">
          Privacy Policy
        </OakLink>{" "}
        for details of how we handle your personal data.
      </OakP>
      <OakP $mb="space-between-s">
        You must provide accurate and complete information to register for an
        account. You are responsible for all activities which occur using your
        account and you must not make it available to others.
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Using our website
      </OakHeading>
      <OakP $mb="space-between-s">
        We are continually striving to improve our website and it is being
        updated all the time. We can change or remove material from our website
        at any time without notice.
      </OakP>
      <OakP $mb="space-between-s">
        We grant you a non-exclusive right to use our website and the services
        offered in accordance with these Terms and Conditions.
      </OakP>
      <OakP $mb="space-between-s">
        We own all rights, title, and interest in and to the website and the
        services offered.
      </OakP>
      <OakP className="mb-4">You agree: </OakP>
      <OakUL $ph="inner-padding-xl">
        <OakLI $pv="inner-padding-xs">
          to use our website and services for lawful purposes only;
        </OakLI>
        <OakLI $pv="inner-padding-xs">
          to use our website and services in a way which does not infringe the
          rights of, or restrict or inhibit the use and enjoyment of it by
          anyone else;
        </OakLI>
        <OakLI $pv="inner-padding-xs">
          not to include any information which could identify an individual into
          any of your inputs (which is defined below);
        </OakLI>
        <OakLI $pv="inner-padding-xs">
          not to engage in any malicious activities, when using our website and
          services, including but not limited to:
          <OakUL $ph="inner-padding-xl">
            <OakLI $pv="inner-padding-xs">
              unauthorised access to the website’s systems and data;
            </OakLI>
            <OakLI $pv="inner-padding-xs">
              distribution of malware, viruses or any other malicious code;
            </OakLI>
            <OakLI $pv="inner-padding-xs">
              attempting to disrupt or impair the functionality or availability
              of the website and services;
            </OakLI>
            <OakLI $pv="inner-padding-xs">
              engaging in any activities which violate the privacy or security
              of users of the website.
            </OakLI>
          </OakUL>
        </OakLI>
      </OakUL>
      <OakP $mb="space-between-s">
        We reserve the right to remove or modify your rights to use this website
        and our services if your use does not comply with these terms and
        conditions.
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Content
      </OakHeading>
      <OakP $mb="space-between-s">
        You may provide input to our website (“input”) and receive “output”
        generated and returned by the website based on the input. Input and
        output are collectively referred to as content.
      </OakP>
      <OakP $mb="space-between-s">
        As between you and Oak and to the extent permitted by law, you own all
        input.
      </OakP>
      <OakP $mb="space-between-s">
        Subject to your compliance with these Terms and Conditions, we assign to
        you all rights, title and interest in and to output. This means that you
        can use content for any purpose, including commercial purposes, such as
        sale or publication, if you comply with these Terms and Conditions.
      </OakP>
      <OakP $mb="space-between-s">
        You assign to us the right to use any inputs and outputs generated by
        you and we may use content to:
        <OakUL $ph="inner-padding-xl">
          <OakLI $pv="inner-padding-xs">
            develop and improve our website and services. We wish to
            continuously improve the quality of the outputs and by sharing your
            inputs with us, we can work to fine-tune the Large Language Models
            we work with in order to make them more accurate and better at
            providing content which is helpful to you. We store inputs you
            provide only for this purpose (see our{" "}
            <OakLink element={Link} className="text-blue" href="/legal/privacy">
              Privacy Policy
            </OakLink>{" "}
            for further details);
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            provide and maintain our website and services;
          </OakLI>
          <OakLI $pv="inner-padding-xs">comply with applicable laws; and</OakLI>
          <OakLI $pv="inner-padding-xs">
            enforce these Terms and Conditions and our policies.
          </OakLI>
        </OakUL>
      </OakP>
      <OakP $mb="space-between-s">
        Generative AI is a rapidly evolving area. We are constantly working to
        improve our website and services to make them more accurate, reliable,
        safe and beneficial to all of our users. You should be aware that use of
        our services may in some situations result in incorrect output which
        does not accurately reflect real people, places or facts. Before using
        the output, you must evaluate its accuracy and determine whether it is
        appropriate for your use case. We recommend that a human should always
        review outputs, to ensure that they are accurate and appropriate for
        your needs.
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Disclaimer
      </OakHeading>
      <OakP $mb="space-between-s">
        The contents of the pages of this website are for your general
        information and use only.
      </OakP>
      <OakP $mb="space-between-s">
        The information is licensed “as is” and we exclude all representations,
        warranties, obligations and liabilities in relation to the information
        to the maximum extent permitted by law.
      </OakP>
      <OakP $mb="space-between-s">
        Whilst we make every effort to ensure the content of our website (and
        any content generated by AI from it) is:
        <OakUL $ph="inner-padding-xl">
          <OakLI $pv="inner-padding-xs">current</OakLI>
          <OakLI $pv="inner-padding-xs">secure</OakLI>
          <OakLI $pv="inner-padding-xs">accurate</OakLI>
          <OakLI $pv="inner-padding-xs">complete</OakLI>
          <OakLI $pv="inner-padding-xs">free from bugs or viruses;</OakLI>
        </OakUL>
      </OakP>
      <OakP $mb="space-between-s">
        neither we nor any third parties provide any warranty or guarantee as to
        the accuracy, timeliness, performance, completeness or suitability of
        the information and materials found or offered on this website for any
        particular purpose. You acknowledge that such information and materials
        may contain omissions, inaccuracies or errors and we expressly exclude
        liability for any such omissions, inaccuracies or errors and we shall
        not be liable for any loss, injury or damage of any kind caused by its
        use.
      </OakP>
      <OakP $mb="space-between-s">
        Your use of any information or materials on this website or any content
        generated using AI is entirely at your own risk, for which we shall not
        be liable. It shall be your own responsibility to ensure that any
        products, services or information made available through this website
        meet your specific requirements. We are not responsible for any
        decisions or actions taken based on any AI-generated content, and we
        disclaim any liability for damages or losses resulting from your
        reliance on the AI-generated content.
      </OakP>
      <OakP $mb="space-between-s">
        Unauthorised use of this website may lead to a claim for damages and/or
        be a criminal offence.
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Intellectual property rights
      </OakHeading>
      <OakP $mb="space-between-s">
        We are and will remain the exclusive owners of this website and its
        original content, features and functionality. It is protected by
        copyright, trademark and other laws of England and Wales. Our trademarks
        may not be used in connection with any product or service without our
        prior written consent.
      </OakP>
      <OakP $mb="space-between-s">
        We have used our best endeavors to remove information which could
        identify an individual and/or content which is owned by third parties,
        including that which is subject to copyright.
      </OakP>
      <OakP $mb="space-between-s">
        You can ask for content to be removed from our website, which we will
        do:
        <OakUL $ph="inner-padding-xl">
          <OakLI $pv="inner-padding-xs">
            In order to comply with data protection legislation, covering the
            rights and freedoms of individuals;
          </OakLI>
          <OakLI $pv="inner-padding-xs">
            If it breaches copyright laws, contains sensitive personal data or
            material which may be considered obscene, defamatory or otherwise
            inappropriate content for our website.
          </OakLI>
        </OakUL>
      </OakP>
      <OakP $mb="space-between-s">
        Contact us using the details below with details of the content you are
        asking to have removed and the reason(s) why. We will reply to you to
        let you know whether we’ll remove it.
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Virus protection
      </OakHeading>
      <OakP $mb="space-between-s">
        We make every effort to check and test our website for viruses at every
        stage of production.
      </OakP>
      <OakP $mb="space-between-s">
        You must ensure that the way you use our website does not expose you to
        the risk of viruses, malicious computer code or other forms of
        interference which may damage your computer system.
      </OakP>
      <OakP $mb="space-between-s">
        We are not responsible for any loss, disruption or damage to your data
        or computer system which might happen when you use our website.
      </OakP>
      <OakP $mb="space-between-s">
        You must not introduce viruses, trojans, worms, logic bombs or any other
        material which is malicious or technologically harmful to our website.
      </OakP>
      <OakP $mb="space-between-s">
        You must not attack or try to gain unauthorised access to our website or
        any server, computer or database connected to it. We will report any
        attacks or attempts to the relevant law enforcement authorities.
      </OakP>
      <OakP $mb="space-between-s">
        We welcome investigative work into security vulnerabilities in
        accordance with our{" "}
        <OakLink
          element={Link}
          className="text-blue"
          href="https://www.thenational.academy/legal/security-disclosure-policy"
        >
          Security Disclosure Policy
        </OakLink>
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Governing law and disputes
      </OakHeading>
      <OakP $mb="space-between-s">
        These terms and conditions are governed by and construed in accordance
        with the laws of England and Wales.
      </OakP>
      <OakP $mb="space-between-s">
        Any dispute relating to these terms and conditions, or your use of our
        website (whether it be contractual or non-contractual) will be subject
        to the exclusive jurisdiction of the courts of England and Wales.
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        These terms and conditions
      </OakHeading>
      <OakP $mb="space-between-s">
        We are not liable if we fail to comply with these terms and conditions
        because of circumstances beyond our control.
      </OakP>
      <OakP $mb="space-between-s">
        We may decide not to exercise or enforce any right available to us under
        these terms and conditions. We may decide to exercise or enforce that
        right at a later date. Doing this once does not mean that we
        automatically waive the right on any other occasion.
      </OakP>
      <OakP $mb="space-between-s">
        If any of these terms and conditions is held to be invalid,
        unenforceable or illegal for any reason, the remaining terms and
        conditions will still apply.
      </OakP>
      <OakP $mb="space-between-s">
        Changes to these terms and conditions may be made at any time, so please
        check them regularly.
      </OakP>
      <OakP $mb="space-between-s">
        By continuing to use our website after the terms and conditions have
        been updated, you agree to any changes.
      </OakP>

      <OakHeading tag="h2" $mb="space-between-s" $font="heading-6">
        Contact us
      </OakHeading>
      <OakP $mb="space-between-s">
        If you have any questions, comments or requests or require further
        information, please contact{" "}
        <OakLink
          element={Link}
          className="text-blue"
          href="mailto:help@thenational.academy"
        >
          help@thenational.academy
        </OakLink>
      </OakP>
    </OakBox>
  );
};

export default TermsContent;
