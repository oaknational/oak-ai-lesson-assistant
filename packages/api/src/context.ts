import {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/backend/internal";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { type inferAsyncReturnType } from "@trpc/server";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { NextRequest, NextResponse } from "next/server";

import { RateLimitInfo } from "./types";

type ClerkAuthSig = typeof getAuth;
type ClerkAuthReturn = inferAsyncReturnType<ClerkAuthSig>;

// Overload ctx.auth to allow authenticating via internal API key without
// all of the session logic that comes along with clerk auth
export type APIKeyAuthObject = { userId: string };

type AuthContextProps = {
  auth: SignedInAuthObject | SignedOutAuthObject | APIKeyAuthObject;
};

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
export const createContextInner = async ({
  auth,
}: Readonly<AuthContextProps>) => {
  return {
    auth,
    prisma,
  };
};

type GetAuth = (req: NextRequest) => Promise<APIKeyAuthObject>;

type CreateNextAppRouterContextOptions = NodeHTTPCreateContextFnOptions<
  NextRequest,
  NextResponse
>;

export const createContextWithAuth = async (
  opts: CreateNextAppRouterContextOptions,
  getAuth: GetAuth | ((req: NextRequest) => ClerkAuthReturn),
) => {
  const auth = await getAuth(opts.req);
  const contextInner = await createContextInner({
    auth,
  } as AuthContextProps);
  return {
    ...contextInner,
    req: opts.req,
    res: opts.res,
    rateLimit: undefined as RateLimitInfo | undefined,
  };
};

export const createContextWithCustomAuth =
  (getAuth: GetAuth) => async (opts: CreateNextAppRouterContextOptions) => {
    return createContextWithAuth(opts, getAuth);
  };

export const createContext = async (
  opts: CreateNextAppRouterContextOptions,
) => {
  return createContextWithAuth(opts, getAuth);
};

export type Context = inferAsyncReturnType<typeof createContext>;
