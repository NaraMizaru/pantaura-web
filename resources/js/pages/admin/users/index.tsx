import { Head, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Auth, UserRole } from '@/types/auth';
import type { PaginatedData } from '@/types/siagakita';

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    reports_count: number;
    created_at: string | null;
};

export default function AdminUsersIndex({
    users,
}: {
    users: PaginatedData<UserRow>;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const handleToggleRole = (user: UserRow) => {
        const nextRole: UserRole =
            user.role === 'admin' ? 'citizen' : 'admin';
        router.patch(`/admin/users/${user.id}/role`, { role: nextRole });
    };

    return (
        <>
            <Head title="Manajemen Pengguna" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Manajemen Pengguna
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola peran akun masyarakat dan administrator.
                    </p>
                </div>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Nama & Email
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Peran
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Kontribusi Laporan
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.data.map((user) => {
                                    const isSelf = auth.user.id === user.id;
                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        user.role === 'admin'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {user.role === 'admin'
                                                        ? 'Administrator'
                                                        : 'Masyarakat'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {user.reports_count} laporan
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isSelf}
                                                    onClick={() =>
                                                        handleToggleRole(user)
                                                    }
                                                >
                                                    {user.role === 'admin'
                                                        ? 'Jadikan Warga'
                                                        : 'Jadikan Admin'}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
