/** Define process.env to contain `TrustificationEnvType` */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends Partial<Readonly<TrustificationEnvType>> {}
  }
}

/**
 * The set of environment variables used by `@trustify-ui` packages.
 */
export type TrustificationEnvType = {
  NODE_ENV: "development" | "production" | "test";
  VERSION: string;

  /** Controls how mock data is injected on the client */
  MOCK: string;

  /** Enable RBAC authentication/authorization */
  AUTH_REQUIRED: "true" | "false";

  /** SSO / Oidc client id */
  OIDC_CLIENT_ID?: string;

  /** SSO / Oidc scope */
  OIDC_SCOPE?: string;

  /** UI upload file size limit in megabytes (MB), suffixed with "m" */
  UI_INGRESS_PROXY_BODY_SIZE: string;

  /** The listen port for the UI's server */
  PORT?: string;

  /** Target URL for the UI server's `/auth` proxy */
  OIDC_SERVER_URL?: string;

  /** Whether or not `/auth` proxy will be enabled */
  OIDC_SERVER_IS_EMBEDDED?: "true" | "false";

  /** The Keycloak Realm */
  OIDC_SERVER_EMBEDDED_PATH?: string;

  /** Target URL for the UI server's `/api` proxy */
  TRUSTIFY_API_URL?: string;

  /** Location of branding files (relative paths computed from the project source root) */
  BRANDING?: string;
};

/**
 * Keys in `TrustificationEnv` that are only used on the server and therefore do not
 * need to be sent to the client.
 */
export const SERVER_ENV_KEYS = ["PORT", "TRUSTIFY_API_URL", "BRANDING"];

/**
 * Create a `TrustificationEnv` from a partial `TrustificationEnv` with a set of default values.
 */
export const buildTrustificationEnv = ({
  NODE_ENV = "production",
  PORT,
  VERSION = "99.0.0",
  MOCK = "off",

  OIDC_SERVER_URL,
  OIDC_SERVER_IS_EMBEDDED = "false",
  OIDC_SERVER_EMBEDDED_PATH,
  AUTH_REQUIRED = "true",
  OIDC_CLIENT_ID,
  OIDC_SCOPE,

  UI_INGRESS_PROXY_BODY_SIZE = "500m",
  TRUSTIFY_API_URL,
  BRANDING,
}: Partial<TrustificationEnvType> = {}): TrustificationEnvType => ({
  NODE_ENV,
  PORT,
  VERSION,
  MOCK,

  OIDC_SERVER_URL,
  OIDC_SERVER_IS_EMBEDDED,
  OIDC_SERVER_EMBEDDED_PATH,
  AUTH_REQUIRED,
  OIDC_CLIENT_ID,
  OIDC_SCOPE,

  UI_INGRESS_PROXY_BODY_SIZE,
  TRUSTIFY_API_URL,
  BRANDING,
});

/**
 * Default values for `TrustificationEnvType`.
 */
export const TRUSTIFICATION_ENV_DEFAULTS = buildTrustificationEnv();

/**
 * Current `@trustify-ui` environment configurations from `process.env`.
 */
export const TRUSTIFICATION_ENV = buildTrustificationEnv(process.env);
