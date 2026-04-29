const ChatPanelDisclaimer = ({
  size,
}: {
  readonly size: "sm" | "md" | "lg";
}) => {
  return (
    <p className={` text-${size}`}>
      Aila can make mistakes. Check your lesson before use.{" "}
      <a
        href="https://www.thenational.academy/legal/terms-and-conditions"
        className="text-blue underline"
        target="_blank"
      >
        Oak terms and conditions
      </a>
      {"."}
    </p>
  );
};

export default ChatPanelDisclaimer;
