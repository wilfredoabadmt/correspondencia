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
import { SystemShell } from '~/components/layout/SystemShell';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        redirect('/login');
    }

    const user = session.user;
    const favoritesUseCase = container.resolve<ManageFavoritesUseCase>(
        InjectionTokens.ManageFavoritesUseCase
    );
    const listAreasUseCase = container.resolve<ListAreasUseCase>(
        InjectionTokens.ListAreasUseCase
    );

    const [favorites, areas] = await Promise.all([
        favoritesUseCase.getFavorites(user.id, user.organizationId).catch(() => []),
        listAreasUseCase.execute({ organizationId: user.organizationId }).catch(() => []),
    ]);

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={user.organizationId}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Perfil de Usuario</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                        Gestiona tus datos personales, contraseña y destinatarios frecuentes para derivación rápida.
                    </p>
                </div>

                {/* Datos Personales */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Información del Usuario</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <span className="text-slate-400">Nombre Completo</span>
                            <p className="text-sm font-bold text-white mt-0.5">{user.name || 'Sin Nombre'}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Correo Electrónico</span>
                            <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{user.email}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Rol de Usuario</span>
                            <p className="text-sm font-bold text-indigo-300 mt-0.5">{user.role || 'Usuario'}</p>
                        </div>
                    </div>
                </div>

                {/* Cambio de Contraseña */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Seguridad y Contraseña</h2>
                    <form action={changePasswordAction} className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                            <Label htmlFor="currentPassword" className="text-xs text-slate-300">Contraseña Actual</Label>
                            <Input id="currentPassword" name="currentPassword" type="password" required className="bg-slate-950 border-slate-700 text-white text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="newPassword" className="text-xs text-slate-300">Nueva Contraseña</Label>
                            <Input id="newPassword" name="newPassword" type="password" required minLength={6} className="bg-slate-950 border-slate-700 text-white text-xs" />
                        </div>
                        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">
                            Actualizar Contraseña
                        </Button>
                    </form>
                </div>

                {/* Destinatarios Frecuentes */}
                <div className="glass-panel-glow p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">⭐ Destinatarios Frecuentes</h2>
                    <p className="text-xs text-slate-300">
                        Agrega las áreas a las que derivas trámites frecuentemente para autoseleccionarlas en 1 clic.
                    </p>

                    <form action={addFavoriteAction} className="flex flex-wrap items-end gap-3 max-w-lg">
                        <div className="flex-1 min-w-[200px] space-y-1">
                            <Label htmlFor="targetAreaId" className="text-xs text-slate-300">Seleccionar Área</Label>
                            <select id="targetAreaId" name="targetAreaId" required className="w-full h-9 px-3 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white outline-none">
                                <option value="">Seleccione un área...</option>
                                {areas.map((a: { id: string; name: string }) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-32 space-y-1">
                            <Label htmlFor="alias" className="text-xs text-slate-300">Alias (Opcional)</Label>
                            <Input id="alias" name="alias" placeholder="Ej. Jefatura" className="bg-slate-950 border-slate-700 text-white text-xs" />
                        </div>
                        <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">
                            Agregar a Frecuentes
                        </Button>
                    </form>

                    <div className="pt-2 divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden">
                        {favorites.length === 0 ? (
                            <p className="p-4 text-center text-xs text-slate-400">No tienes destinatarios frecuentes configurados.</p>
                        ) : (
                            favorites.map((fav: { id: string; targetAreaName: string; alias?: string | null }) => (
                                <div key={fav.id} className="p-3.5 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-xs text-white">{fav.targetAreaName}</p>
                                        {fav.alias && <p className="text-[10px] text-slate-400">Alias: {fav.alias}</p>}
                                    </div>
                                    <form action={removeFavoriteAction.bind(null, fav.id)}>
                                        <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 text-xs">
                                            Eliminar
                                        </Button>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </SystemShell>
    );
}
