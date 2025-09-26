// convex/auth.ts

import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

// This is a placeholder. You must implement a real email sending function.
const sendVerificationRequest = async (params: { identifier: string; url: string; }) => {
  console.log("Sending verification email to:", params.identifier);
  console.log("Verification URL:", params.url);
  // In production, you would use a service like Resend or Postmark here.
  // Example: await resend.emails.send({...});
  return;
};

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Email({ sendVerificationRequest })
  ],
});