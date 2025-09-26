// convex/http.ts
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Register all Convex Auth HTTP routes (e.g., /auth and preflight)
auth.addHttpRoutes(http);

export default http;