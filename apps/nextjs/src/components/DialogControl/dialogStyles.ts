import { cva } from "class-variance-authority";

export const dialogContent = cva([
  "relative z-50 flex items-center justify-center ",
  "data-[state=open]:animate-contentShow z-50",
]);
export const dialogContentInner = cva([
  "mx-20 border-2 border-black",
  "h-full w-full  sm:w-[80%] md:w-[680px]",
  "flex w-full flex-col items-center justify-between",
  "data-[state=open]:animate-contentShow bg-white p-10 pb-24 focus:outline-none md:p-22",
]);

export const dialogOverlay = cva(
  ["fixed inset-0 z-40 flex items-center justify-center duration-300 "],
  {
    variants: {
      opacity: {
        true: "bg-lavender30/80 bg-opacity-90", // Adjust opacity class as needed
        false: "bg-lavender30 bg-opacity-90",
      },
    },
    defaultVariants: {
      opacity: false,
    },
  },
);
