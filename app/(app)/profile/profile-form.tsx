"use client";

import { useState } from "react";

export default function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    const res = await fetch("/api/profile/update", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold">Редактировать профиль</h2>

      <input
        type="text"
        className="border p-2 rounded w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Сохранить
      </button>

      {status === "saving" && <p className="text-gray-500">Сохраняю...</p>}
      {status === "success" && <p className="text-green-600">Сохранено!</p>}
      {status === "error" && <p className="text-red-600">Ошибка</p>}
    </form>
  );
}