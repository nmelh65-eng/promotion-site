"use client";

import { useState } from "react";

interface NewsletterSignupFormProps {
  source?: string;
}

type FormState = "idle" | "saving" | "success" | "duplicate" | "error";

export default function NewsletterSignupForm({
  source = "homepage",
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setState("saving");
      setMessage("");

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source,
          website,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result?.ok) {
        setState("error");
        setMessage(result?.error || "Не удалось оформить подписку");
        return;
      }

      if (result?.data?.status === "duplicate") {
        setState("duplicate");
        setMessage("Этот email уже подписан на обновления");
        return;
      }

      setState("success");
      setMessage("Спасибо! Подписка оформлена");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Ошибка отправки формы");
    }
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
        Newsletter
      </p>

      <h2 className="text-3xl font-semibold text-white">
        Подписка на обновления
      </h2>

      <p className="mt-3 text-sm leading-7 text-gray-400">
        Получай новые публикации, свежие подборки и важные обновления проекта
        на email.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
          />
        </div>

        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-70"
        >
          {state === "saving" ? "Отправка..." : "Подписаться"}
        </button>
      </form>

      {state === "success" ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      {state === "duplicate" ? (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {message}
        </div>
      ) : null}

      {state === "error" ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {message}
        </div>
      ) : null}
    </section>
  );
}
