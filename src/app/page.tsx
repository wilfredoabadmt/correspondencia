import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { RoleShowcase } from '@/components/landing/RoleShowcase';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 bg-futuristic-grid selection:bg-cyan-500 selection:text-slate-950">
            {/* Header */}
            <LandingHeader />

            {/* Main Hero */}
            <HeroSection />

            {/* Feature Cards Grid (Inspired by SIGEC Manual capabilities) */}
            <section id="funcionalidades" className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-semibold uppercase tracking-wider">
                        Módulos Principales
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Herramientas Diseñadas para la Máxima Eficiencia
                    </h2>
                    <p className="text-slate-400 text-base sm:text-lg">
                        Estructura organizada en módulos claros de recepción, derivación, consulta gerencial e impresión oficial.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Card 1: Bandejas */}
                    <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📥
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                            Bandejas Multi-Estado
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Organización en cuatro estados clave: <strong>Entrante</strong> (por recibir/rechazar), <strong>Pendientes</strong> (en atención), <strong>Enviados</strong> (derivados) y <strong>Archivados</strong>.
                        </p>
                    </div>

                    {/* Card 2: Hojas de Ruta */}
                    <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📄
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            Hojas de Ruta & CITEs
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Generación de CITEs oficiales (Informe, Nota Interna, Carta, Circular), descarga de plantillas Word automatizadas e impresión con firma y código de verificación.
                        </p>
                    </div>

                    {/* Card 3: Expedientes Virtuales */}
                    <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📁
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                            Expedientes Virtuales
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Agrupación de trámites complejos bajo un mismo expediente (Ej: EXP-2026-0001), consolidando múltiples notas e informes en una carpeta digital única.
                        </p>
                    </div>

                    {/* Card 4: Semáforos de Mora */}
                    <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-rose-500/30 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            ⏱️
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                            Control de Plazos & Mora
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Indicadores visuales de permanencia (&gt;5 días con alerta roja) y registro oficial de justificativos para deslindar responsabilidades.
                        </p>
                    </div>

                    {/* Card 5: Destinatarios Frecuentes */}
                    <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            👤
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                            Destinatarios Frecuentes
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Libreta de contactos directos por usuario para derivación inmediata de trámites con 1-solo clic, reduciendo tiempos de registro.
                        </p>
                    </div>

                    {/* Card 6: Reportes Gerenciales */}
                    <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-purple-500/30 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📊
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            Monitoreo Gerencial
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Informes de correspondencia recibida por oficina, monitoreo de envíos y exportaciones ejecutivas en formatos Excel y PDF.
                        </p>
                    </div>
                </div>
            </section>

            {/* Role Experience Showcase */}
            <RoleShowcase />

            {/* Integrated Login Section on Landing Page */}
            <section id="login-portal" className="py-20 relative z-10 border-t border-slate-800/80 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-6 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-semibold uppercase tracking-wider">
                                Acceso Inmediato
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                Inicie Sesión para Comenzar a Operar
                            </h2>
                            <p className="text-slate-300 text-base leading-relaxed">
                                Acceda a sus bandejas de correspondencia, genere nuevos CITEs o supervise el estado de los trámites institucionales con autenticación segura y selección directa de roles.
                            </p>

                            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Demostración Rápida por Roles</div>
                                <div className="text-xs text-slate-300">
                                    Puede probar el sistema instantáneamente seleccionando una de las cuentas de demostración pre-configuradas para <strong>OPERADOR</strong> o <strong>ADMINISTRADOR</strong>.
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <LoginForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-12 bg-slate-950 text-slate-400 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            GD
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm">GestorDoc SIGEC Pro</div>
                            <div className="text-slate-500 text-[11px]">Sistema de Gestión de Correspondencia Institucional</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-slate-400">
                        <a href="#funcionalidades" className="hover:text-cyan-400 transition-colors">Funcionalidades</a>
                        <a href="#roles" className="hover:text-cyan-400 transition-colors">Roles de Usuario</a>
                        <Link href="/login" className="hover:text-cyan-400 transition-colors">Portal de Acceso</Link>
                    </div>

                    <div className="text-slate-500 text-center md:text-right font-mono">
                        © 2026 GestorDoc • Todos los derechos reservados
                    </div>
                </div>
            </footer>
        </div>
    );
}
