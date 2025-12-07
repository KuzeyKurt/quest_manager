"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileClient({ user }: { user: any }) {
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  }

  const membership = user.teamMembers?.[0];

  return (
    <div className="p-10 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Профиль</h1>

      <div className="p-4 border rounded-lg space-y-2">
        <p><b>Email:</b> {user.email}</p>
        <p><b>Имя:</b> {user.name}</p>
        {membership && (
          <>
            <p><b>Роль в команде:</b> {membership.role}</p>
            <p><b>Дата добавления:</b> {new Date(membership.joinedAt).toLocaleDateString()}</p>
            <p><b>Команда:</b> {membership.team?.name ?? "—"}</p>
          </>
        )}
      </div>

      <div className="p-4 border rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Редактировать профиль</h2>

        <div className="space-y-2">
          <Label htmlFor="name">Имя</Label>
          <Input 
            id="name"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            disabled={status === "saving"}
          />
        </div>

        <Button 
          onClick={save}
          disabled={status === "saving" || name === user.name}
        >
          {status === "saving" ? "Сохранение..." : "Сохранить"}
        </Button>

        {status === "success" && (
          <p className="text-green-600 text-sm">Имя успешно обновлено!</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm">Ошибка при сохранении</p>
        )}
      </div>
    </div>
  );
}