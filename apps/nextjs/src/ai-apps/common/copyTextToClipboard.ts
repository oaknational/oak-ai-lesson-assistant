export const copyTextToClipboard = () => {
  const elementsToCopy =
    document.querySelectorAll<HTMLElement>(".copy-to-clipboard");
  const textToCopy = Array.from(elementsToCopy)
    .map((element) => element.innerText)
    .join("\n");

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("Text copied to clipboard!");
  });
};