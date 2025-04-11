import { aiLogger } from "@oakai/logger";

import { Client } from "@hubspot/api-client";
import { ApiException } from "@hubspot/api-client/lib/codegen/crm/contacts/apis/exception";
import type { SimplePublicObject } from "@hubspot/api-client/lib/codegen/crm/contacts/models/SimplePublicObject";

const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("Missing HUBSPOT_ACCESS_TOKEN");
}

const hubspotClient = new Client({ accessToken });
const log = aiLogger("analytics");

interface CreateHubspotCustomerInput {
  email: string;
  firstName: string | null;
  lastName: string | null;
  marketingAccepted: boolean;
}
// New function to get HubSpot contact by email
export const getHubspotContactByEmail = async (email: string) => {
  try {
    const result = await hubspotClient.crm.contacts.basicApi.getById(
      email,
      undefined,
      undefined,
      undefined,
      undefined,
      "email",
    );
    return result;
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
}: CreateHubspotCustomerInput): Promise<SimplePublicObject> => {
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
    log.info("********record", result);
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
    const response = await hubspotClient.crm.contacts.basicApi.update(id, {
      properties,
    });
    log.info("********record", response);
    return response;
  }

  const response = await hubspotClient.crm.contacts.basicApi.create({
    properties,
    associations: [],
  });
  log.info("********record", response);
  return response;
};
