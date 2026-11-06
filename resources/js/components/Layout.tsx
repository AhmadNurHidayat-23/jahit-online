import { Head, Link, router, usePage } from "@inertiajs/react";
import { Scissors, ArrowUpRight, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import type { User } from "../types";
export default function Layout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    const p = usePage().props;
    const user = p.user as User | null;
    const errors = p.errors as Record<string, string>;
    const flash = p.flash as { success?: string };
    return (
        <>
            <Head title={title} />
            <header>
                <Link href="/" className="brand">
                    <Scissors size={25} />
                    <span>
                        sehelai<span>PERSONAL TAILORING</span>
                    </span>
                </Link>
                <nav>
                    <Link href="/">Layanan kami</Link>
                    {user ? (
                        <>
                            <Link href="/pesanan">
                                {user.role === "staff"
                                    ? "Ruang produksi"
                                    : "Pesanan saya"}
                            </Link>
                            <button
                                className="icon"
                                aria-label="Keluar"
                                onClick={() => router.post("/keluar")}
                            >
                                <LogOut size={17} />
                            </button>
                        </>
                    ) : (
                        <Link href="/masuk">
                            Masuk <ArrowUpRight size={16} />
                        </Link>
                    )}
                </nav>
            </header>
            {flash?.success && (
                <div role="status" className="notice success">
                    {flash.success}
                </div>
            )}
            {Object.values(errors || {}).length > 0 && (
                <div role="alert" className="notice error">
                    {Object.values(errors).map((e, i) => (
                        <p key={i}>{e}</p>
                    ))}
                </div>
            )}
            <main>{children}</main>
            <footer>
                <strong>sehelai.</strong>
                <span>Dibuat untuk Anda. Dikerjakan dengan perhatian.</span>
                <small>
                    Jahit Online · Konsultasi, ukuran, dan proses yang terbuka.
                </small>
            </footer>
        </>
    );
}
