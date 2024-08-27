require("@testing-library/jest-dom");

console.log("Use Testing library jest-dom/extend-expect");

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props) {
    return {
      $$typeof: Symbol.for("react.element"),
      type: "img",
      props: Object.assign({}, props, { src: props.src || "" }),
      ref: null,
      key: null,
    };
  },
}));

// Mock Icon component
jest.mock("@/components/Icon", () => ({
  Icon: function MockIcon(props) {
    return {
      $$typeof: Symbol.for("react.element"),
      type: "img",
      props: { src: "", alt: props.icon },
      ref: null,
      key: null,
    };
  },
}));
