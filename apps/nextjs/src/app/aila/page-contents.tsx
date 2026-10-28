"use client";

import React from "react";

import { AiSdk } from "@/components/AppComponents/Chat/AiSdk";
import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import Layout from "@/components/AppComponents/Layout";
import { OakMathJaxContext } from "@/components/MathJax";
import { AilaStoresProvider } from "@/stores/AilaStoresProvider";

const ChatPageContents = ({ id }: { readonly id: string }) => {
  return (
    <Layout feature="aila">
      <OakMathJaxContext>
        <AilaStoresProvider id={id}>
          <AiSdk id={id} />
          <Chat />
        </AilaStoresProvider>
      </OakMathJaxContext>
    </Layout>
  );
};

export default ChatPageContents;
