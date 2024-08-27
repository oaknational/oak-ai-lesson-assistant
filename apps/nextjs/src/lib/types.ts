import { z } from "zod";

export const sideBarChatItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    isShared: z.boolean().nullish(),
  })
  .passthrough();

export type SideBarChatItem = z.infer<typeof sideBarChatItemSchema>;
