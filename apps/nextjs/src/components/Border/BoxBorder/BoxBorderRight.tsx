import type { BorderProps } from "../";

function BoxBorderRight({ className = "" }: Readonly<BorderProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2.89"
      height="330.09"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 2.89 330.09"
      className={className}
    >
      <path
        fill="currentColor"
        d="M2.7 2.21c-.12-.76.36-2.63-1.15-2.13C.77.03-.13.13.01.85c.18 14.09.05 309.32.1 328.06 0 .15.3 1.07.28 1.18h2.5C2.85 303.49 2.6 17.84 2.7 2.21z"
      ></path>
      <path
        fill="currentColor"
        d="M1.87 1.07s.09.4.09 1.21c.11 3.3-.51-1.31-.09-1.21zm-.62 42.98c-.47-.05-.49-1.38-.04-1.78.85-.76.2 1.8.04 1.78zM.91 1.65c.08 2.14.7 4.95-.31 2.59-.13-.84.18-5.42.31-2.59zm.14 64.13c-.47-.05.11-8.31.56-9.46.4-1.07-.4 9.48-.56 9.46zm.71-11.38c-.47-.05-.76-.69.03-.65 1.14.07.13.67-.03.65z"
      ></path>
    </svg>
  );
}

export default BoxBorderRight;
