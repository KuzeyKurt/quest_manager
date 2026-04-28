"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfileClient({ user }: { user: any }) {
  const [name, setName] = useState(user.name);

  async function save() {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    alert("Имя обновлено");
  }

  const membership = user.teamMembers?.[0];

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Имя</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-500">Роль в команде</label>
          <div className="border p-2 rounded">
            {membership?.role ?? "—"}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Дата добавления</label>
          <div className="border p-2 rounded">
            {membership?.joinedAt?.split("T")[0]}
          </div>
        </div>

        <Button onClick={save}>Сохранить</Button>
      </div>
    </div>
  );
}