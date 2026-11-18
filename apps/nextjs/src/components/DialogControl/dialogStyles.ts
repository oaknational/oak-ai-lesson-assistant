import { cva } from "class-variance-authority";

export const dialogContent = cva([
  "relative z-50 flex items-center justify-center",
  "data-[state=open]:animate-contentShow z-50",
]);
export const dialogContentInner = cva([
  "h-screen overflow-y-scroll",
  "sm:mx-20 sm:border-2 sm:border-black",
  "max-h-screen w-full sm:h-full sm:w-[80%] md:w-[680px]",
  "flex w-full flex-col items-center justify-between",
  "data-[state=open]:animate-contentShow bg-white p-10 pb-24 focus:outline-hidden md:p-22",
]);

export const dialogOverlay = cva(
  ["fixed inset-0 z-50 flex items-center justify-center duration-300"],
  {
    variants: {
      opacity: {
        true: "bg-white sm:bg-lavender30/80", // Adjust opacity class as needed
        false: "bg-white sm:bg-lavender30/90",
      },
    },
    defaultVariants: {
      opacity: false,
    },
  },
);
