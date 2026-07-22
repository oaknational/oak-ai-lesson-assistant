import { date, z } from "zod/v3";

export const sideBarChatItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    isShared: z.boolean().nullish(),
    updatedAt: date(),
  })
  .passthrough();

export type SideBarChatItem = z.infer<typeof sideBarChatItemSchema>;
