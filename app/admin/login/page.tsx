"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await res.json();

      if (!res.ok || !result?.ok) {
        setError(result?.error || "Ошибка входа");
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Не удалось выполнить вход");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-16">
      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-10">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Admin
        </p>
        <h1 className="mb-5 text-4xl font-bold text-white">Вход</h1>
        <p className="mb-8 text-sm leading-7 text-gray-400">
          Введите пароль администратора, чтобы открыть панель управления.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-gray-500"
            autoComplete="current-password"
            required
          />

          {error ? <div className="text-sm text-red-400">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-70"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </section>
    </div>
  );
}
