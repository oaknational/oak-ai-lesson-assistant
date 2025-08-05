const ChatPanelDisclaimer = ({
  size,
}: {
  readonly size: "sm" | "md" | "lg";
}) => {
  return (
    <p className={`my-12 text-${size}`}>
      Aila can make mistakes. Check your lesson before use. See our{" "}
      <a
        href="https://www.thenational.academy/legal/terms-and-conditions"
        className="text-blue underline"
        target="_blank"
      >
        terms and conditions
      </a>
      {"."}
    </p>
  );
};

export default ChatPanelDisclaimer;
