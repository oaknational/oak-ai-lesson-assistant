import type { Responsive } from "@radix-ui/themes";
import { Box } from "@radix-ui/themes";

type ErrorBoxProps = {
  message: string | JSX.Element;
  error?: string | Error;
  p?: Responsive<"4" | "0" | "1" | "2" | "3" | "5" | "6" | "7" | "8" | "9">;
  mt?: Responsive<
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "auto"
    | "-1"
    | "-2"
    | "-3"
    | "-4"
    | "-5"
    | "-6"
    | "-7"
    | "-8"
    | "-9"
  >;
};

const ErrorBox = ({
  message,
  error,
  p = "2",
  mt = "2",
}: Readonly<ErrorBoxProps>) => {
  const errorText = typeof error === "string" ? error : error?.message;

  return (
    <Box className="border-2 border-black bg-warning" p={p} mt={mt}>
      <p className="text-sm">{message}</p>
      {error && <p className="text-sm">{errorText}</p>}
    </Box>
  );
};

type GenerationErrorBoxProps = {
  error: Error;
  p?: Responsive<"4" | "0" | "1" | "2" | "3" | "5" | "6" | "7" | "8" | "9">;
  mt?: Responsive<
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "auto"
    | "-1"
    | "-2"
    | "-3"
    | "-4"
    | "-5"
    | "-6"
    | "-7"
    | "-8"
    | "-9"
  >;
};
export const GenerationErrorBox = ({
  p = "2",
  mt = "2",
  error,
}: Readonly<GenerationErrorBoxProps>) => {
  return (
    <ErrorBox
      message={
        <>Sorry, there was an error generating the answer. Please try again.</>
      }
      error={error}
      p={p}
      mt={mt}
    />
  );
};

export default ErrorBox;
