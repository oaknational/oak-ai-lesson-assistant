import { IconName } from "@/components/Icon";

interface SocialItem {
  icon: IconName;
  href: string;
  id: string;
}

export interface MenuItem {
  title: string;
  href: string;
  id: string;
  target?: string;
  behindFeatureFlag?: boolean;
  external?: boolean;
}

export const menuItems: MenuItem[] = [];

export const socialMenuItems: SocialItem[] = [
  {
    icon: "twitter",
    href: "https://twitter.com/oaknational",
    id: "twitter",
  },
  {
    icon: "facebook",
    href: "https://facebook.com/oaknationalacademy",
    id: "facebook",
  },
  {
    icon: "instagram",
    href: "https://instagram.com/oaknational",
    id: "instagram",
  },
  {
    icon: "linkedin",
    href: "https://www.linkedin.com/company/oak-national-academy",
    id: "linkedin",
  },
];

export const legalMenuItems: MenuItem[] = [
  {
    title: "Terms & conditions",
    href: "https://www.thenational.academy/legal/terms-and-conditions",
    id: "terms",
    target: "_blank",
  },
  {
    title: "Privacy policy",
    href: "https://www.thenational.academy/legal/privacy-policy",
    id: "privacy",
    target: "_blank",
  },
  {
    title: "Cookie policy",
    href: "/legal/cookies",
    id: "cookies",
  },
  {
    title: "Manage cookie settings",
    href: "#",
    id: "manage-cookies",
  },
  {
    title: "Copyright notice",
    href: "https://www.thenational.academy/legal/copyright-notice",
    id: "copyright",
    target: "_blank",
  },
  {
    title: "Accessibility Statement",
    href: "/legal/accessibility-statement",
    id: "accessibility-statement",
  },
  {
    title: "Safeguarding statement",
    href: "https://www.thenational.academy/legal/safeguarding-statement",
    id: "safeguarding-statement",
    target: "_blank",
  },
  {
    title: "Physical activity disclaimer",
    href: "https://www.thenational.academy/legal/physical-activity-disclaimer",
    id: "physical-activity-disclaimer",
    target: "_blank",
  },
  {
    title: "Complaints",
    href: "https://www.thenational.academy/legal/complaints",
    id: "complaints",
    target: "_blank",
  },
  {
    title: "Freedom of information requests",
    href: "https://www.thenational.academy/legal/freedom-of-information-requests",
    id: "freedom-of-information-requests",
    target: "_blank",
  },
];
