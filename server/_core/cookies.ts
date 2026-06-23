import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    // Do NOT set domain — let the browser scope the cookie to the exact hostname.
    // Setting an explicit domain (e.g. .arqueoplanejamentoestrategico.manus.space)
    // causes browsers to reject or not send back the cookie on multi-level subdomains.
    httpOnly: true,
    path: "/",
    // Frontend e API sao servidos no MESMO dominio (self-host), entao "lax" e
    // mais robusto que "none": nao depende do flag Secure pra ser aceito e
    // protege melhor contra CSRF. "none" exigia HTTPS perfeito e causava loops.
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
