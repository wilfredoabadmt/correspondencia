import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ManageFavoritesUseCase } from '~/modules/users/application/manage-favorites.use-case';
import type { ListAreasUseCase } from '~/modules/gestion-documental/application/list-areas.use-case.impl';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { changePasswordAction, addFavoriteAction, removeFavoriteAction } from './_actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        redirect('/login');
    }

    const favoritesUseCase = container.resolve<ManageFavoritesUseCase>(
        InjectionTokens.ManageFavoritesUseCase
    );
    const listAreasUseCase = container.resolve<ListAreasUseCase>(
        InjectionTokens.ListAreasUseCase
    );

    const [favorites, areas] = await Promise.all([
        favoritesUseCase.getFavorites(session.user.id, session.user.organizationId),
        listAreasUseCase.execute({ organizationId: session.user.organizationId }),
    ]);

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Gestiona tus datos personales, contraseña y destinatarios frecuentes para derivación rápida.
                </p>
            </div>

            {/* Datos Personales */}
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Información del Usuario</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
                        <p className="text-base font-medium">{session.user.name || 'Sin Nombre'}</p>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Correo Electrónico</Label>
                        <p className="text-base font-medium">{session.user.email}</p>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Rol</Label>
                        <p className="text-base font-medium">{(session.user as any).role || 'Usuario'}</p>
                    </div>
                </div>
            </div>

            {/* Cambio de Contraseña */}
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Seguridad y Contraseña</h2>
                <form action={changePasswordAction} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input id="currentPassword" name="currentPassword" type="password" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
                    </div>
                    <Button type="submit" size="sm">
                        Actualizar Contraseña
                    </Button>
                </form>
            </div>

            {/* Destinatarios Frecuentes */}
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">⭐ Destinatarios Frecuentes</h2>
                <p className="text-xs text-muted-foreground">
                    Agrega las áreas a las que derivas trámites frecuentemente para autoseleccionarlas en 1 clic.
                </p>

                <form action={addFavoriteAction} className="flex flex-wrap items-end gap-3 max-w-lg">
                    <div className="flex-1 min-w-[200px] space-y-1">
                        <Label htmlFor="targetAreaId" className="text-xs">Seleccionar Área</Label>
                        <select id="targetAreaId" name="targetAreaId" required className="w-full h-9 px-3 text-sm rounded-md border bg-background">
                            <option value="">Seleccione un área...</option>
                            {areas.map((a: { id: string; name: string }) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32 space-y-1">
                        <Label htmlFor="alias" className="text-xs">Alias (Opcional)</Label>
                        <Input id="alias" name="alias" placeholder="Ej. Jefatura" />
                    </div>
                    <Button type="submit" size="sm" variant="secondary">
                        Agregar a Frecuentes
                    </Button>
                </form>

                <div className="pt-2 divide-y border rounded-md">
                    {favorites.length === 0 ? (
                        <p className="p-4 text-center text-sm text-muted-foreground">No tienes destinatarios frecuentes configurados.</p>
                    ) : (
                        favorites.map((fav: { id: string; targetAreaName: string; alias?: string | null }) => (
                            <div key={fav.id} className="p-3 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm">{fav.targetAreaName}</p>
                                    {fav.alias && <p className="text-xs text-muted-foreground">Alias: {fav.alias}</p>}
                                </div>
                                <form action={async () => {
                                    'use server';
                                    await removeFavoriteAction(fav.id);
                                }}>
                                    <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700">
                                        Eliminar
                                    </Button>
                                </form>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
