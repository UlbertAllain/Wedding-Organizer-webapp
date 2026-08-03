import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors";

export function apiSuccess<T>(data: T, status = 200) {
  const response = NextResponse.json({ data }, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function apiError(message: string, status = 500, details?: unknown) {
  const response = NextResponse.json({ error: { message, details } }, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiError(error.message, error.status, error.details);
  }

  if (error instanceof ZodError) {
    return apiError("Validation failed", 400, error.flatten());
  }

  console.error(error);
  return apiError("Internal server error", 500);
}

export function assertSameOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    throw new AppError("Cross-site request is not allowed", 403);
  }

  const origin = request.headers.get("origin");
  if (!origin) return;

  const expectedOrigin = new URL(request.url).origin;
  if (origin !== expectedOrigin) {
    throw new AppError("Invalid request origin", 403);
  }
}
