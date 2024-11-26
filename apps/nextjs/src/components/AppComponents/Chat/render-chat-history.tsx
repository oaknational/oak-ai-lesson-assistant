import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
import { motion } from "framer-motion";

import type { SideBarChatItem } from "@/lib/types";

import { SidebarItem } from "./sidebar-item";

const RenderChats = (title: string, chats: SideBarChatItem[]) => (
  <OakBox $ml="space-between-s">
    <OakP $font="body-2-bold" $mb="space-between-s">
      {title}
    </OakP>
    <OakFlex $mb="space-between-s" $flexDirection="column" $gap="all-spacing-2">
      {chats.map((chat) => (
        <motion.div key={chat.id} exit={{ opacity: 0, height: 0 }}>
          <SidebarItem chat={chat} />
        </motion.div>
      ))}
    </OakFlex>
  </OakBox>
);

export default RenderChats;
