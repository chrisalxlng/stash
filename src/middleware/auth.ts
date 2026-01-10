import type { GetVerificationKey } from "express-jwt";
import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

const keycloakIssuerRealmUrl = `${process.env.KEYCLOAK_ISSUER_URL}/realms/${process.env.KEYCLOAK_REALM}`;
if (!keycloakIssuerRealmUrl)
	throw new Error("KEYCLOAK_ISSUER_URL and/or KEYCLOAK_REALM is not set");

const keycloakJwksRealmUrl = `${process.env.KEYCLOAK_JWKS_URL}/realms/${process.env.KEYCLOAK_REALM}`;
if (!keycloakJwksRealmUrl)
	throw new Error("KEYCLOAK_JWKS_URL and/or KEYCLOAK_REALM is not set");

const keycloakAudience = process.env.KEYCLOAK_AUDIENCE;
if (!keycloakAudience) throw new Error("KEYCLOAK_AUDIENCE is not set");

const secret: GetVerificationKey = jwksRsa.expressJwtSecret({
	cache: true,
	rateLimit: true,
	jwksUri: `${keycloakJwksRealmUrl}/protocol/openid-connect/certs`,
});

export const authenticate = jwt({
	secret,
	audience: keycloakAudience,
	issuer: `${keycloakIssuerRealmUrl}`,
	algorithms: ["RS256"],
	credentialsRequired: false,
});
