import { Client } from "@hubspot/api-client";
import { ApiException } from "@hubspot/api-client/lib/codegen/crm/contacts/apis/exception";

const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("Missing HUBSPOT_ACCESS_TOKEN");
}

const hubspotClient = new Client({ accessToken });

interface CreateHubspotCustomerInput {
  email: string;
  firstName: string | null;
  lastName: string | null;
  marketingAccepted: boolean;
}

/**
 * Get HubSpot contact ID by email
 * @param email The email address to look up
 * @returns The HubSpot contact ID, or null if not found
 */
export const getHubspotContactIdByEmail = async (
  email: string,
): Promise<string | null> => {
  try {
    const result = await hubspotClient.crm.contacts.basicApi.getById(
      email,
      undefined,
      undefined,
      undefined,
      undefined,
      "email",
    );
    return result.id;
  } catch (e) {
    const isNotFoundError = e instanceof ApiException && e.code === 404;
    if (isNotFoundError) {
      return null;
    }
    throw e;
  }
};

export const createHubspotCustomer = async ({
  email,
  firstName,
  lastName,
  marketingAccepted,
}: CreateHubspotCustomerInput) => {
  let id: string | undefined;
  try {
    const result = await hubspotClient.crm.contacts.basicApi.getById(
      email,
      undefined,
      undefined,
      undefined,
      undefined,
      "email",
    );
    id = result.id;
    console.log("Existing HubSpot contact_id:", id);
  } catch (e) {
    const isNotFoundError = e instanceof ApiException && e.code === 404;
    if (!isNotFoundError) {
      throw e;
    }
  }

  const properties = {
    email,
    ...(firstName && {
      firstname: firstName,
    }),
    ...(lastName && {
      lastname: lastName,
    }),
    email_consent_on_ai_account_creation: marketingAccepted ? "true" : "false",
  };

  if (id) {
    const updatedContact = await hubspotClient.crm.contacts.basicApi.update(
      id,
      {
        properties,
      },
    );
    console.log("Updated HubSpot contact_id:", id);
    return {
      ...updatedContact,
      id,
    };
  }

  const newContact = await hubspotClient.crm.contacts.basicApi.create({
    properties,
    associations: [],
  });
  console.log("New HubSpot contact_id:", newContact.id);

  return {
    ...newContact,
    id: newContact.id,
  };
};
