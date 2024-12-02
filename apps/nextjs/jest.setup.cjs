require("@testing-library/jest-dom");

process.env.NEXT_PUBLIC_DEBUG = process.env.DEBUG;

// // Mock Next.js Image component
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: function MockImage(props) {
//     return {
//       $$typeof: Symbol.for("react.element"),
//       type: "img",
//       props: Object.assign({}, props, { src: props.src || "" }),
//       ref: null,
//       key: null,
//     };
//   },
// }));

// // Mock Icon component
// jest.mock("@/components/Icon", () => ({
//   Icon: function MockIcon(props) {
//     return {
//       $$typeof: Symbol.for("react.element"),
//       type: "img",
//       props: { src: "", alt: props.icon },
//       ref: null,
//       key: null,
//     };
//   },
// }));
