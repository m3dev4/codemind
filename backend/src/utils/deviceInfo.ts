import type { Request } from "express";

/**
 * Extrait les informations du device depuis le User-Agent
 */
export const extractDeviceInfo = (req: Request) => {
  const userAgent = req.headers["user-agent"] || "Unknown";
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "Unknown";

  // Parse user agent (simpliste, utiliser ua-parser-js pour plus de précision)
  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? "Mobile" : "Desktop";
  const os = getOS(userAgent);
  const browser = getBrowser(userAgent);
  const platform = getPlatform(userAgent);

  return {
    userAgent,
    ip,
    device,
    os,
    browser,
    platform,
    location: "Unknown", // Peut être enrichi avec une API de géolocalisation
  };
};

function getOS(userAgent: string): string {
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac OS/i.test(userAgent)) return "MacOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iOS|iPhone|iPad/i.test(userAgent)) return "iOS";
  return "Unknown";
}

function getBrowser(userAgent: string): string {
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) return "Chrome";
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return "Safari";
  if (/Firefox/i.test(userAgent)) return "Firefox";
  if (/Edg/i.test(userAgent)) return "Edge";
  if (/Opera|OPR/i.test(userAgent)) return "Opera";
  return "Unknown";
}

function getPlatform(userAgent: string): string {
  if (/Win64|Win32/i.test(userAgent)) return "x64";
  if (/ARM/i.test(userAgent)) return "ARM";
  return "x86";
}
