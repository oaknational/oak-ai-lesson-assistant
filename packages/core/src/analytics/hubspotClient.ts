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
  } catch (e) {
    if (e instanceof ApiException && e.code === 404) {
      return;
    }
    throw e;
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
    return await hubspotClient.crm.contacts.basicApi.update(id, {
      properties,
    });
  }

  return await hubspotClient.crm.contacts.basicApi.create({
    properties,
    associations: [],
  });
};
