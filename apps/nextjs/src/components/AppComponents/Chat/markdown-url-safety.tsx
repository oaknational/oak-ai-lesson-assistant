import type { ComponentProps, ComponentType } from "react";
import type { Components } from "react-markdown";

import { sanitiseUrl } from "./url-safety";

export function wrapWithUrlSafety(
  components: Partial<Components>,
): Partial<Components> {
  const A = components.a as ComponentType<ComponentProps<"a">> | undefined;
  const Img = components.img as
    | ComponentType<ComponentProps<"img">>
    | undefined;

  return {
    ...components,
    a: (props) => {
      const safeHref = sanitiseUrl(props.href);
      if (!safeHref) {
        return <span>{props.children}</span>;
      }
      if (A) {
        return <A {...props} href={safeHref} />;
      }
      return <a href={safeHref}>{props.children}</a>;
    },
    img: (props) => {
      const src = typeof props.src === "string" ? props.src : undefined;
      const safeSrc = sanitiseUrl(src);
      if (!safeSrc) {
        return <span>{props.alt ?? ""}</span>;
      }
      if (Img) {
        return <Img {...props} src={safeSrc} />;
      }
      return <img src={safeSrc} alt={props.alt} title={props.title} />;
    },
  };
}
