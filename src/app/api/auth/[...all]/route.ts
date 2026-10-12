import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth";

// Every Better Auth URL (/api/auth/...) is handled here, e.g. the page
// GitHub/Google send the user back to after they approve the sign-in.
export const { GET, POST } = toNextJsHandler(auth);
