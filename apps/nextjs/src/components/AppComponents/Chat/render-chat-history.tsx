import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
import { motion } from "framer-motion";

import type { SideBarChatItem } from "@/lib/types";

import { SidebarItem } from "./sidebar-item";

const RenderChats = (title: string, chats: SideBarChatItem[]) => (
  <OakBox $ml="spacing-16">
    <OakP $font="body-2-bold" $mb="spacing-16">
      {title}
    </OakP>
    <OakFlex $mb="spacing-16" $flexDirection="column" $gap="spacing-8">
      {chats.map((chat) => (
        <motion.div key={chat.id} exit={{ opacity: 0, height: 0 }}>
          <SidebarItem chat={chat} />
        </motion.div>
      ))}
    </OakFlex>
  </OakBox>
);

export default RenderChats;
