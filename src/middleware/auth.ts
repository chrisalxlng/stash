import type { GetVerificationKey } from "express-jwt";
import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

const keycloakRealmUrl = `${process.env.KEYCLOAK_DOMAIN}/realms/${process.env.KEYCLOAK_APPS_REALM}`;
if (!keycloakRealmUrl)
	throw new Error("KEYCLOAK_DOMAIN and/or KEYCLOAK_APPS_REALM is not set");

const keycloakAudience = process.env.CLHUB_STORAGE_KEYCLOAK_AUDIENCE;
if (!keycloakAudience)
	throw new Error("CLHUB_STORAGE_KEYCLOAK_AUDIENCE is not set");

const secret: GetVerificationKey = jwksRsa.expressJwtSecret({
	cache: true,
	rateLimit: true,
	jwksUri: `${keycloakRealmUrl}/protocol/openid-connect/certs`,
});

export const authenticate = jwt({
	secret,
	audience: keycloakAudience,
	issuer: `${keycloakRealmUrl}`,
	algorithms: ["RS256"],
});
