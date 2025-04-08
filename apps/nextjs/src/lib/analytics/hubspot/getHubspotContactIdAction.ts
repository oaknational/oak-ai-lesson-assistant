"use server";

import { getHubspotContactIdByEmail } from "@oakai/core/src/analytics/hubspotClient";

/**
 * Server action to get the HubSpot contact ID for a given email
 * This is useful when the client-side HubSpot tracking code doesn't provide the contact ID
 */
export async function getHubspotContactIdAction(
  email: string,
): Promise<string | null> {
  try {
    if (!email) {
      console.log("No email provided to getHubspotContactIdAction");
      return null;
    }

    console.log("Getting HubSpot contact ID for email:", email);
    const contactId = await getHubspotContactIdByEmail(email);

    if (contactId) {
      console.log("Retrieved HubSpot contact_id from API:", contactId);
      return contactId;
    } else {
      console.log("No HubSpot contact found for email:", email);
      return null;
    }
  } catch (error) {
    console.error("Error fetching HubSpot contact ID:", error);
    return null;
  }
}
