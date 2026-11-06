import { Link } from "@inertiajs/react";
import Layout from "../components/Layout";
export default function Error({ status }: { status: number }) {
    return (
        <Layout title={String(status)}>
            <section className="empty">
                <span className="eyebrow">{status}</span>
                <h1>
                    {status === 403
                        ? "Ruang ini bersifat pribadi."
                        : status === 419
                          ? "Sesi Anda telah berakhir."
                          : status === 429
                            ? "Tunggu sebentar."
                            : "Halaman belum tersedia."}
                </h1>
                <p>
                    Periksa tautan atau masuk kembali untuk mengakses pesanan
                    Anda.
                </p>
                <Link href="/" className="btn primary">
                    Kembali ke layanan
                </Link>
            </section>
        </Layout>
    );
}
