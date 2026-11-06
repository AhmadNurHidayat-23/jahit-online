import { Link, usePage, usePoll } from "@inertiajs/react";
import { ReceiptText, Clock } from "lucide-react";
import Layout from "../components/Layout";
import QuoteForm from "../components/QuoteForm";
import OrderActions from "../components/OrderActions";
import {
    money,
    date,
    labels,
    dimensions,
    type Order,
    type User,
} from "../types";
export default function Detail({ order: o }: { order: Order }) {
    usePoll(5000, { only: ["order"] });
    const staff = (usePage().props.user as User).role === "staff";
    return (
        <Layout title={o.number}>
            <section className="workspace">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            {o.number} / {date(o.created_at)}
                        </span>
                        <h1>{o.service_name}</h1>
                        <p>
                            {o.user.name} · {o.quantity} pakaian · Status
                            diperbarui otomatis setiap 5 detik.
                        </p>
                    </div>
                    <span className={"badge " + o.status}>
                        {labels[o.status]}
                    </span>
                </div>
                <div className="detail-layout">
                    <div>
                        {staff &&
                            ["submitted", "quoted"].includes(o.status) && (
                                <QuoteForm order={o} />
                            )}
                        <section className="panel">
                            <h2>Ukuran & detail pesanan</h2>
                            <dl className="measurement-list">
                                {Object.entries(o.measurements).map(
                                    ([k, v]) => (
                                        <div key={k}>
                                            <dt>{dimensions[k]}</dt>
                                            <dd>{v} cm</dd>
                                        </div>
                                    ),
                                )}
                            </dl>
                            <div className="info-grid">
                                <p>
                                    <strong>Kain</strong>
                                    {o.fabric === "atelier"
                                        ? "Disediakan atelier"
                                        : "Disediakan pelanggan"}
                                </p>
                                <p>
                                    <strong>Detail</strong>
                                    {o.detail === "detailed"
                                        ? "Detail tambahan"
                                        : "Potongan sederhana"}
                                </p>
                                <p>
                                    <strong>Tanggal yang diharapkan</strong>
                                    {date(o.requested_date)}
                                </p>
                                <p>
                                    <strong>Catatan pelanggan</strong>
                                    {o.notes || "Tidak ada catatan tambahan."}
                                </p>
                            </div>
                            {o.has_reference && (
                                <div className="reference">
                                    <span className="eyebrow">
                                        FOTO REFERENSI / PRIVAT
                                    </span>
                                    <img
                                        src={"/pesanan/" + o.id + "/referensi"}
                                        alt="Foto referensi desain pelanggan"
                                    />
                                </div>
                            )}
                        </section>
                        <section className="timeline">
                            <h2>
                                <Clock size={19} /> Perjalanan pesanan
                            </h2>
                            {o.events?.map((e) => (
                                <article key={e.id}>
                                    <p>{e.description}</p>
                                    <small>{date(e.created_at)}</small>
                                </article>
                            ))}
                        </section>
                    </div>
                    <aside className="panel price-summary">
                        <span className="eyebrow">BIAYA & JADWAL</span>
                        <h2>
                            {o.final_price
                                ? "Penawaran final"
                                : "Estimasi awal"}
                        </h2>
                        <strong className="price">
                            {money(o.final_price ?? o.estimate)}
                        </strong>
                        <p>
                            {o.quote_note ||
                                "Tim sedang meninjau kebutuhan Anda. Harga dan jadwal final akan dikirim untuk persetujuan."}
                        </p>
                        <dl>
                            <div>
                                <dt>Target selesai</dt>
                                <dd>
                                    {o.due_date
                                        ? date(o.due_date)
                                        : "Menunggu konfirmasi"}
                                </dd>
                            </div>
                            <div>
                                <dt>Pembayaran</dt>
                                <dd>
                                    {o.paid_at ? "Lunas" : "Belum dikonfirmasi"}
                                </dd>
                            </div>
                        </dl>
                        <OrderActions order={o} staff={staff} />
                        <Link
                            className="btn secondary full"
                            href={"/pesanan/" + o.id + "/invoice"}
                        >
                            <ReceiptText size={16} />
                            Lihat invoice
                        </Link>
                        <p className="fineprint">
                            Pembayaran dikonfirmasi manual oleh petugas. Tidak
                            ada transaksi bank otomatis.
                        </p>
                    </aside>
                </div>
            </section>
        </Layout>
    );
}
