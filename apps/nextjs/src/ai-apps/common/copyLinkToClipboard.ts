export const copyLinkToClipboard = () => {
  const currentURL = window.location.href;
  navigator.clipboard.writeText(currentURL).then(() => {
    alert("Link copied to clipboard!");
  });
};
