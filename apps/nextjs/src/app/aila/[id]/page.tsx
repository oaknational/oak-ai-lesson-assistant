import { getChatLanguage } from "@/app/actions";

import ChatPageContents from "../page-contents";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: Readonly<ChatPageProps>) {
  const { id } = params;

  const language = (await getChatLanguage(id)) ?? "en";

  // For local development so that we can warm up the server
  if (id === "health") {
    return <>OK</>;
  }

  return <ChatPageContents id={id} language={language} />;
}
