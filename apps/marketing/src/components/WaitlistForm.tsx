import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { joinWaitlist } from "../utils/waitlist";

export const WaitlistForm = () => {
  const submitWaitlist = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await submitWaitlist({ data: { email } });
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <div
      id="waitlist"
      className="mt-14 scroll-mt-24 rounded-2xl border-4 border-black bg-neutral-900 p-8 sm:p-10 text-white"
    >
      <div className="mx-auto max-w-3xl">
        <h3 className="mb-3 text-2xl font-black tracking-tight sm:text-5xl">
          Get notified about new features
        </h3>
        <p className="mb-6 text-sm text-neutral-300 sm:text-base">
          Drop your email to get notified about new features. You'll{" "}
          <span className="font-semibold text-zinc-100">never</span> recieve any
          spam or marketing emails.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border-2 border-emerald-400 bg-emerald-950/60 p-4 text-emerald-300">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
            <span className="font-bold sm:text-lg">
              You're part of the community now! We'll keep you updated.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email address..."
                className="w-full flex-1 rounded-xl border-2 border-black bg-white px-4 py-3.5 text-black placeholder:text-neutral-500 font-medium focus:outline-none focus:ring-4 focus:ring-amber-400 text-base"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-amber-400 px-6 py-3.5 font-black text-black hover:bg-amber-300 transition-colors disabled:opacity-70 text-base cursor-pointer shrink-0"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Notify Me</span>
                    <ArrowRight className="h-5 w-5 stroke-3" />
                  </>
                )}
              </button>
            </div>
            {status === "error" && (
              <p className="text-left text-sm font-bold text-rose-400">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
