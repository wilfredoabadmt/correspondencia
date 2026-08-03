'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function RoleShowcase() {
    const [activeRole, setActiveRole] = useState<'ADMINISTRADOR' | 'OPERADOR'>('OPERADOR');

    return (
        <section id="roles" className="py-20 relative border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 text-xs font-mono font-semibold uppercase tracking-wider">
                        Experiencia Basada en Roles
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Aislamiento Estricto y Permisos Granulares
                    </h2>
                    <p className="text-base sm:text-lg text-slate-400">
                        Cada perfil accede exclusivamente a las herramientas necesarias para su nivel de responsabilidad institucional, garantizando la seguridad y fluidez del trámite.
                    </p>
                </div>

                {/* Role Toggle Tabs */}
                <div className="mt-10 flex justify-center">
                    <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 backdrop-blur-xl">
                        <button
                            onClick={() => setActiveRole('OPERADOR')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                activeRole === 'OPERADOR'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Rol OPERADOR (Servidor Público)</span>
                        </button>

                        <button
                            onClick={() => setActiveRole('ADMINISTRADOR')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                activeRole === 'ADMINISTRADOR'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Rol ADMINISTRADOR (Gerencia / TI)</span>
                        </button>
                    </div>
                </div>

                {/* Role Content Preview */}
                <div className="mt-10">
                    {activeRole === 'OPERADOR' ? (
                        <div className="glass-panel-glow rounded-3xl p-8 sm:p-10 border border-cyan-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-6 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold">
                                    Módulo de Operación Diaria
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                                    Bandeja Unificada y Derivación en 1-Clic
                                </h3>
                                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                                    Diseñado para servidores públicos y personal de ventanilla. Permite la recepción, atención inmediata, respuesta formal (Informes, Notas Internas, Cartas) y derivación transparente de trámites hacia dependientes u otras unidades organizacionales.
                                </p>

                                <ul className="space-y-3 font-medium text-slate-300 text-sm">
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <span><strong>Bandeja de Pendientes</strong>: Recepción, rechazo motivado o justificación de demoras con registro visible en el historial.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <span><strong>Generación con Hoja de Ruta</strong>: Asignación automática de CITEs oficiales y descarga de plantillas Word pre-llenadas.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <span><strong>Destinatarios Frecuentes</strong>: Agiliza derivaciones reiteradas con accesos directos personalizados.</span>
                                    </li>
                                </ul>

                                <div className="pt-4">
                                    <Link
                                        href="/login?role=OPERADOR"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
                                    >
                                        <span>Probar como Operador (Demo)</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* UI Card Mockup for Operador */}
                            <div className="lg:col-span-6">
                                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                            <span className="text-xs font-mono text-slate-400 ml-2">Vista Operativa • SIGEC</span>
                                        </div>
                                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">3 Pendientes</span>
                                    </div>

                                    {/* Mock Document Item 1 */}
                                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-mono font-bold text-cyan-400">E-2026-00558</span>
                                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">Con Retraso (&gt;5 días)</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white">REITERACIÓN DE PAGO DE INSPECTOR DE OBRA DE VIVIENDA</h4>
                                        <p className="text-xs text-slate-400">Remitente: <span className="text-slate-300">Juan José Espejo (Director General)</span></p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <span className="text-[11px] px-2.5 py-1 rounded bg-blue-600 text-white font-medium">Derivar (1-Clic)</span>
                                            <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">Responder con Informe</span>
                                        </div>
                                    </div>

                                    {/* Mock Document Item 2 */}
                                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-mono font-bold text-cyan-400">I-2026-00684</span>
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">A Tiempo</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white">SOLICITUD DE ELABORACIÓN DE INFORME TÉCNICO SIPAGO</h4>
                                        <p className="text-xs text-slate-400">Remitente: <span className="text-slate-300">Edwin Yujra (Jefe de Unidad TIC)</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel-glow rounded-3xl p-8 sm:p-10 border border-indigo-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-6 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-semibold">
                                    Módulo de Gestión Gerencial y TI
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                                    Monitoreo Gerencial y Administración de Roles
                                </h3>
                                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                                    Diseñado para directores, jefes de unidad y administradores de sistema. Otorga control completo sobre la estructura organizacional, asignación de permisos personalizados y reportes de eficiencia operativa.
                                </p>

                                <ul className="space-y-3 font-medium text-slate-300 text-sm">
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <span><strong>Gestión de Roles y Permisos</strong>: Creación de roles dinámicos por Organización con permisos finos por módulo.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <span><strong>Monitoreo de Envíos y Pendientes</strong>: Reporte estadístico por unidad, mora acumulada y exportaciones Excel/PDF.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                        <span><strong>Jerarquías de Área</strong>: Configuración de organigrama multinivel para enrutamiento oficial.</span>
                                    </li>
                                </ul>

                                <div className="pt-4">
                                    <Link
                                        href="/login?role=ADMINISTRADOR"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                                    >
                                        <span>Probar como Administrador (Demo)</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* UI Card Mockup for Administrador */}
                            <div className="lg:col-span-6">
                                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                            <span className="text-xs font-mono text-slate-400 ml-2">Panel Gerencial • SIGEC</span>
                                        </div>
                                        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">Control Institucional</span>
                                    </div>

                                    {/* Stat Widgets */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                            <div className="text-xs text-slate-400">Total Trámites Activos</div>
                                            <div className="text-xl font-bold text-white font-mono mt-1">1,248</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                            <div className="text-xs text-slate-400">Índice de Atención A Tiempo</div>
                                            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">94.2%</div>
                                        </div>
                                    </div>

                                    {/* Permission Checklist */}
                                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                                        <div className="text-xs font-semibold text-slate-300">Permisos Activos del Rol Administrador</div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                            <div className="flex items-center gap-1.5 text-emerald-400"><span>•</span> user.manage</div>
                                            <div className="flex items-center gap-1.5 text-emerald-400"><span>•</span> role.manage</div>
                                            <div className="flex items-center gap-1.5 text-emerald-400"><span>•</span> document.view.all</div>
                                            <div className="flex items-center gap-1.5 text-emerald-400"><span>•</span> area.manage</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
