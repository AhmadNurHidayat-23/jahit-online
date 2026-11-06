import { Link, router, usePage } from "@inertiajs/react";
import { Scissors, ArrowUpRight } from "lucide-react";
import Layout from "../components/Layout";
import { money, date, labels, type Order, type User } from "../types";
export default function Orders({
    orders,
    status,
}: {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    status: string;
}) {
    const user = usePage().props.user as User;
    return (
        <Layout title="Riwayat pesanan">
            <section className="workspace">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            {user.role === "staff"
                                ? "RUANG PRODUKSI"
                                : "RUANG PELANGGAN"}
                        </span>
                        <h1>Setiap jahitan, ada ceritanya.</h1>
                        <p>
                            {user.role === "staff"
                                ? "Tinjau kebutuhan, kirim penawaran, dan perbarui proses pengerjaan."
                                : "Riwayat dan perkembangan pakaian yang dibuat untuk Anda."}
                        </p>
                    </div>
                    <label className="filter-label">
                        Status
                        <select
                            aria-label="Filter status"
                            value={status}
                            onChange={(e) =>
                                router.get("/pesanan", {
                                    status: e.target.value,
                                })
                            }
                        >
                            <option value="">Semua status</option>
                            {Object.entries(labels).map(([v, l]) => (
                                <option key={v} value={v}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="order-list">
                    {orders.data.map((o) => (
                        <Link
                            className="order-row"
                            href={"/pesanan/" + o.id}
                            key={o.id}
                        >
                            <div>
                                <span className="eyebrow">
                                    {o.number} / {date(o.created_at)}
                                </span>
                                <h2>{o.service_name}</h2>
                                <p>
                                    {o.user.name} · {o.quantity} pakaian
                                </p>
                            </div>
                            <span className={"badge " + o.status}>
                                {labels[o.status]}
                            </span>
                            <div>
                                <strong>
                                    {money(o.final_price ?? o.estimate)}
                                </strong>
                                <small>
                                    {o.final_price
                                        ? "Penawaran final"
                                        : "Estimasi"}
                                </small>
                            </div>
                            <ArrowUpRight size={22} />
                        </Link>
                    ))}
                </div>
                {!orders.data.length && (
                    <div className="empty">
                        <Scissors size={30} />
                        <h2>Ruang untuk cerita pertama.</h2>
                        <p>Belum ada pesanan pada pilihan status ini.</p>
                        <Link className="btn primary" href="/">
                            Jelajahi layanan
                        </Link>
                    </div>
                )}
                <div className="pager">
                    <span>
                        Halaman {orders.current_page} / {orders.last_page}
                    </span>
                    <div>
                        {orders.prev_page_url && (
                            <Link href={orders.prev_page_url}>Sebelumnya</Link>
                        )}
                        {orders.next_page_url && (
                            <Link href={orders.next_page_url}>Berikutnya</Link>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
