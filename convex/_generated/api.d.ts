/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_access from "../admin/access.js";
import type * as admin_authorization from "../admin/authorization.js";
import type * as admin_dashboard from "../admin/dashboard.js";
import type * as admin_eventSettings from "../admin/eventSettings.js";
import type * as admin_gifts from "../admin/gifts.js";
import type * as admin_reservations from "../admin/reservations.js";
import type * as admin_rsvps from "../admin/rsvps.js";
import type * as auth from "../auth.js";
import type * as eventSettings from "../eventSettings.js";
import type * as gifts from "../gifts.js";
import type * as http from "../http.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as reservations from "../reservations.js";
import type * as rsvps from "../rsvps.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/access": typeof admin_access;
  "admin/authorization": typeof admin_authorization;
  "admin/dashboard": typeof admin_dashboard;
  "admin/eventSettings": typeof admin_eventSettings;
  "admin/gifts": typeof admin_gifts;
  "admin/reservations": typeof admin_reservations;
  "admin/rsvps": typeof admin_rsvps;
  auth: typeof auth;
  eventSettings: typeof eventSettings;
  gifts: typeof gifts;
  http: typeof http;
  "lib/rateLimit": typeof lib_rateLimit;
  reservations: typeof reservations;
  rsvps: typeof rsvps;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
