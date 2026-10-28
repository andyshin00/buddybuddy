// " the front door (server). It doesn't create endpoints. It connects URLs to the brain.
// Its one line, toNextJsHandler(auth), means: "Next.js, any GET or POST request to /api/auth/<anything>: give it to auth and send back whatever it returns.""
import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
