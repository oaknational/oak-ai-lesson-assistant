import { useEffect, useState } from "react";

export function useCopyToClipboard(text: string) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        console.log("Link copied to clipboard!");
      },
      (err) => {
        console.log("Unable to copy to clipboard", err);
      },
    );
  };

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess, setCopySuccess]);

  return { copySuccess, handleCopyToClipboard };
}
