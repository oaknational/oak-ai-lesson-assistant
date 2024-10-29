import arrowDownWhite from "@/assets/svg/Arrow-down-white.svg";
import arrowDown from "@/assets/svg/Arrow-down.svg";
import arrowLeftWhite from "@/assets/svg/Arrow-left-white.svg";
import arrowLeft from "@/assets/svg/Arrow-left.svg";
import arrowRightWhite from "@/assets/svg/Arrow-right-white.svg";
import arrowRight from "@/assets/svg/Arrow-right.svg";
import arrowUpWhite from "@/assets/svg/Arrow-up-white.svg";
import arrowUp from "@/assets/svg/Arrow-up.svg";
import bellWhite from "@/assets/svg/Bell-white.svg";
import bell from "@/assets/svg/Bell.svg";
import chevronDownWhite from "@/assets/svg/Chevron-down-white.svg";
import chevronDown from "@/assets/svg/Chevron-down.svg";
import chevronLeftWhite from "@/assets/svg/Chevron-left-white.svg";
import chevronLeft from "@/assets/svg/Chevron-left.svg";
import chevronRightWhite from "@/assets/svg/Chevron-right-white.svg";
import chevronRight from "@/assets/svg/Chevron-right.svg";
import chevronUpWhite from "@/assets/svg/Chevron-up-white.svg";
import chevronUp from "@/assets/svg/Chevron-up.svg";
import copyWhite from "@/assets/svg/Copy-white.svg";
import copy from "@/assets/svg/Copy.svg";
import crossWhite from "@/assets/svg/Cross-white.svg";
import cross from "@/assets/svg/Cross.svg";
import downloadWhite from "@/assets/svg/Download-white.svg";
import download from "@/assets/svg/Download.svg";
import equipmentWhite from "@/assets/svg/Equipment-white.svg";
import equipment from "@/assets/svg/Equipment.svg";
import externalWhite from "@/assets/svg/External-white.svg";
import external from "@/assets/svg/External.svg";
import facebookWhite from "@/assets/svg/Facebook-white.svg";
import facebook from "@/assets/svg/Facebook.svg";
import globeWhite from "@/assets/svg/Globe-white.svg";
import globe from "@/assets/svg/Globe.svg";
import hamburgerWhite from "@/assets/svg/Hamburger-white.svg";
import hamburger from "@/assets/svg/Hamburger.svg";
import homeWhite from "@/assets/svg/Home-white.svg";
import home from "@/assets/svg/Home.svg";
import instagramWhite from "@/assets/svg/Instagram-white.svg";
import instagram from "@/assets/svg/Instagram.svg";
import linkedinWhite from "@/assets/svg/LinkedIn-white.svg";
import linkedin from "@/assets/svg/LinkedIn.svg";
import miniMenuWhite from "@/assets/svg/Mini-menu-white.svg";
import miniMenu from "@/assets/svg/Mini-menu.svg";
import padlock from "@/assets/svg/Padlock.svg";
import printWhite from "@/assets/svg/Print-white.svg";
import print from "@/assets/svg/Print.svg";
import questionMarkWhite from "@/assets/svg/Question-mark-white.svg";
import questionMark from "@/assets/svg/Question-mark.svg";
import saveWhite from "@/assets/svg/Save-white.svg";
import save from "@/assets/svg/Save.svg";
import searchWhite from "@/assets/svg/Search-white.svg";
import search from "@/assets/svg/Search.svg";
import sendWhite from "@/assets/svg/Send-white.svg";
import send from "@/assets/svg/Send.svg";
import shareWhite from "@/assets/svg/Share-white.svg";
import share from "@/assets/svg/Share.svg";
import sidebarWhite from "@/assets/svg/Sidebar-white.svg";
import sidebar from "@/assets/svg/Sidebar.svg";
import starWhite from "@/assets/svg/Star-filled-white.svg";
import star from "@/assets/svg/Star-filled.svg";
import tickWhite from "@/assets/svg/Tick-white.svg";
import tick from "@/assets/svg/Tick.svg";
import twitterWhite from "@/assets/svg/Twitter-white.svg";
import twitter from "@/assets/svg/Twitter.svg";
import warningWhite from "@/assets/svg/Warning-white.svg";
import warning from "@/assets/svg/Warning.svg";
import acornWhite from "@/assets/svg/acorn-white.svg";
import acorn from "@/assets/svg/acorn.svg";
import aiLesson from "@/assets/svg/ai-lesson.svg";
import reloadWhite from "@/assets/svg/reload-white.svg";
import reload from "@/assets/svg/reload.svg";
import uploadWhite from "@/assets/svg/upload-white.svg";
import upload from "@/assets/svg/upload.svg";

import type { IconName } from "./types";

type SVGComponent = React.FC<React.SVGProps<SVGElement>>;

export const svgs: Record<IconName, SVGComponent> = {
  "arrow-left": arrowLeft as unknown as SVGComponent,
  "arrow-right": arrowRight as unknown as SVGComponent,
  "arrow-up": arrowUp as unknown as SVGComponent,
  "arrow-down": arrowDown as unknown as SVGComponent,
  bell: bell as unknown as SVGComponent,
  "chevron-left": chevronLeft as unknown as SVGComponent,
  "chevron-right": chevronRight as unknown as SVGComponent,
  "chevron-up": chevronUp as unknown as SVGComponent,
  "chevron-down": chevronDown as unknown as SVGComponent,
  cross: cross as unknown as SVGComponent,
  copy: copy as unknown as SVGComponent,
  download: download as unknown as SVGComponent,
  upload: upload as unknown as SVGComponent,
  "upload-white": uploadWhite as unknown as SVGComponent,
  external: external as unknown as SVGComponent,
  globe: globe as unknown as SVGComponent,
  hamburger: hamburger as unknown as SVGComponent,
  home: home as unknown as SVGComponent,
  "mini-menu": miniMenu as unknown as SVGComponent,
  print: print as unknown as SVGComponent,
  save: save as unknown as SVGComponent,
  search: search as unknown as SVGComponent,
  send: send as unknown as SVGComponent,
  share: share as unknown as SVGComponent,
  star: star as unknown as SVGComponent,
  tick: tick as unknown as SVGComponent,
  warning: warning as unknown as SVGComponent,
  facebook: facebook as unknown as SVGComponent,
  twitter: twitter as unknown as SVGComponent,
  linkedin: linkedin as unknown as SVGComponent,
  instagram: instagram as unknown as SVGComponent,
  reload: reload as unknown as SVGComponent,
  equipment: equipment as unknown as SVGComponent,
  "equipment-white": equipmentWhite as unknown as SVGComponent,
  "reload-white": reloadWhite as unknown as SVGComponent,
  "arrow-left-white": arrowLeftWhite as unknown as SVGComponent,
  "arrow-right-white": arrowRightWhite as unknown as SVGComponent,
  "arrow-up-white": arrowUpWhite as unknown as SVGComponent,
  "arrow-down-white": arrowDownWhite as unknown as SVGComponent,
  "bell-white": bellWhite as unknown as SVGComponent,
  "chevron-left-white": chevronLeftWhite as unknown as SVGComponent,
  "chevron-right-white": chevronRightWhite as unknown as SVGComponent,
  "chevron-up-white": chevronUpWhite as unknown as SVGComponent,
  "chevron-down-white": chevronDownWhite as unknown as SVGComponent,
  "cross-white": crossWhite as unknown as SVGComponent,
  "copy-white": copyWhite as unknown as SVGComponent,
  "download-white": downloadWhite as unknown as SVGComponent,
  "external-white": externalWhite as unknown as SVGComponent,
  "globe-white": globeWhite as unknown as SVGComponent,
  "hamburger-white": hamburgerWhite as unknown as SVGComponent,
  "home-white": homeWhite as unknown as SVGComponent,
  "mini-menu-white": miniMenuWhite as unknown as SVGComponent,
  "print-white": printWhite as unknown as SVGComponent,
  "save-white": saveWhite as unknown as SVGComponent,
  "search-white": searchWhite as unknown as SVGComponent,
  "send-white": sendWhite as unknown as SVGComponent,
  "share-white": shareWhite as unknown as SVGComponent,
  "star-white": starWhite as unknown as SVGComponent,
  "tick-white": tickWhite as unknown as SVGComponent,
  "warning-white": warningWhite as unknown as SVGComponent,
  "facebook-white": facebookWhite as unknown as SVGComponent,
  "twitter-white": twitterWhite as unknown as SVGComponent,
  "linkedin-white": linkedinWhite as unknown as SVGComponent,
  "instagram-white": instagramWhite as unknown as SVGComponent,
  "question-mark": questionMark as unknown as SVGComponent,
  "question-mark-white": questionMarkWhite as unknown as SVGComponent,
  sidebar: sidebar as unknown as SVGComponent,
  "sidebar-white": sidebarWhite as unknown as SVGComponent,
  acorn: acorn as unknown as SVGComponent,
  "acorn-white": acornWhite as unknown as SVGComponent,
  padlock: padlock as unknown as SVGComponent,
  "ai-lesson": aiLesson as unknown as SVGComponent,
};
