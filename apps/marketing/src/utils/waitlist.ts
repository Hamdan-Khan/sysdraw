import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { z } from "zod";

const WaitlistSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export const joinWaitlist = createServerFn({ method: "POST" })
  .validator(WaitlistSchema)
  .handler(async ({ data }) => {
    const key = data.email.toLowerCase();
    const payload = JSON.stringify({
      email: key,
      submittedAt: new Date().toISOString(),
    });

    await env.KV.put(key, payload);

    return { success: true, message: "You're on the waitlist!" };
  });
