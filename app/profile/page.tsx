import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const userId = await getSessionUserId();

  // Текущий пользователь
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teamMembers: {
        include: {
          team: true,
        },
      },
    },
  });

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  // Берём информацию о членстве в команде (если есть)
  const teamMember = user.teamMembers[0] ?? null;

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Профиль</h1>

      <div className="p-4 border rounded-lg space-y-2">
        <p><b>Email:</b> {user.email}</p>
        <p><b>Имя:</b> {user.name}</p>
        {teamMember && (
          <>
            <p><b>Роль в команде:</b> {teamMember.role}</p>
            <p><b>Дата добавления:</b> {teamMember.joinedAt.toLocaleDateString()}</p>
            <p><b>Команда:</b> {teamMember.team.name}</p>
          </>
        )}
      </div>

      <ProfileForm initialName={user.name} />
    </div>
  );
}