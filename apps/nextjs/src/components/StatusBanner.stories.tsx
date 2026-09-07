import type { Meta, StoryObj } from "@storybook/nextjs";

import { FeatureFlagProvider } from "@/components/ContextProviders/FeatureFlagProvider";
import {
  DEFAULT_STATUS_BANNER_PAYLOAD,
  STATUS_BANNER_FLAG,
} from "@/lib/feature-flags/statusBanner";
import { chromaticParams } from "@/storybook/chromatic";

import { StatusBanner } from "./StatusBanner";

const meta = {
  title: "Components/Layout/StatusBanner",
  component: StatusBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
  },
} satisfies Meta<typeof StatusBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The banner takes no props, it reads everything from the feature flag. So these
 * stories wrap it in a provider with the flag switched on, rather than using args.
 */
const withPayload = (payload: unknown) => () => (
  <FeatureFlagProvider
    bootstrappedFeatures={{ [STATUS_BANNER_FLAG]: true }}
    bootstrappedPayloads={{ [STATUS_BANNER_FLAG]: payload }}
  >
    <StatusBanner />
  </FeatureFlagProvider>
);

export const Default: Story = {
  render: withPayload(DEFAULT_STATUS_BANNER_PAYLOAD),
};

export const CustomMessage: Story = {
  render: withPayload({
    messageBefore: "Aila is unavailable while we investigate an issue, see",
    linkText: "our status page",
    href: "https://status.thenational.academy/",
    messageAfter: "for updates.",
  }),
};

/** A payload with a mistake in it still shows the default message, not nothing. */
export const MalformedPayload: Story = {
  render: withPayload({ messageBefore: "", href: "not-a-url" }),
};

export const FlagOff: Story = {
  render: () => (
    <FeatureFlagProvider
      bootstrappedFeatures={{ [STATUS_BANNER_FLAG]: false }}
      bootstrappedPayloads={{}}
    >
      <StatusBanner />
    </FeatureFlagProvider>
  ),
};
