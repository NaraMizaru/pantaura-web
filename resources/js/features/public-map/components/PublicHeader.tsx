import { Link } from '@inertiajs/react';
import { Droplets, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Auth } from '@/types/auth';

export function PublicHeader({ auth }: { auth?: Auth }) {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8f9ff]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#0284c7] focus-visible:outline-none"
                >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-[#006194] text-white shadow-xs">
                        <Droplets className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                        <span className="block text-base font-bold tracking-tight text-[#006194]">
                            SiagaKita
                        </span>
                        <span className="hidden text-xs text-[#3f4850] sm:block">
                            Pantauan Bencana &amp; Tanggap Darurat Publik
                        </span>
                    </div>
                </Link>

                <nav
                    aria-label="Navigasi utama"
                    className="hidden items-center gap-1 md:flex"
                >
                    <a
                        href="#peta-pantauan"
                        className="rounded-lg bg-[#007bb9] px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
                    >
                        Peta Pantauan
                    </a>
                    <a
                        href="#daftar-kejadian"
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#3f4850] transition-colors hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                    >
                        Daftar Kejadian
                    </a>
                </nav>

                <div className="flex items-center gap-2">
                    {auth?.user?.role === 'admin' ? (
                        <Button
                            asChild
                            size="sm"
                            className="bg-[#006194] text-white hover:bg-[#004b73]"
                        >
                            <Link href="/admin">
                                <ShieldCheck
                                    className="mr-1.5 size-4"
                                    aria-hidden="true"
                                />
                                Dashboard Admin
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-slate-300 bg-white text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#0b1c30] dark:border-slate-300 dark:bg-white dark:text-[#0b1c30] dark:hover:bg-[#eff4ff] dark:hover:text-[#0b1c30]"
                        >
                            <Link href="/login">Masuk Admin</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
