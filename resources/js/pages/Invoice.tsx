import { Printer } from "lucide-react";
import Layout from "../components/Layout";
import { money, date, type Order } from "../types";
export default function Invoice({ order: o }: { order: Order }) {
    return (
        <Layout title={"Invoice " + o.number}>
            <section className="invoice">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            SEHELAI / PERSONAL TAILORING
                        </span>
                        <h1>{o.final_price ? "Invoice" : "Estimasi biaya"}</h1>
                    </div>
                    <button
                        className="btn secondary print-hide"
                        onClick={() => window.print()}
                    >
                        <Printer size={16} />
                        Cetak invoice
                    </button>
                </div>
                <div className="invoice-meta">
                    <p>
                        <strong>{o.number}</strong>
                        {date(o.created_at)}
                    </p>
                    <p>
                        <strong>Untuk</strong>
                        {o.user.name}
                        <br />
                        {o.user.email}
                    </p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Layanan</th>
                            <th>Jumlah</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {o.service_name}
                                <small>
                                    Kain{" "}
                                    {o.fabric === "atelier"
                                        ? "dari atelier"
                                        : "dari pelanggan"}{" "}
                                    ·{" "}
                                    {o.detail === "detailed"
                                        ? "Detail tambahan"
                                        : "Sederhana"}
                                </small>
                            </td>
                            <td>{o.quantity}</td>
                            <td>{money(o.final_price ?? o.estimate)}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="invoice-total">
                    <span>
                        Total {o.final_price ? "penawaran" : "estimasi"}
                    </span>
                    <strong>{money(o.final_price ?? o.estimate)}</strong>
                </div>
                <div className="invoice-foot">
                    <p>
                        <strong>Status pembayaran</strong>
                        {o.paid_at
                            ? "Lunas · " + date(o.paid_at)
                            : "Belum dikonfirmasi petugas"}
                    </p>
                    <p>
                        <strong>Jadwal selesai</strong>
                        {o.due_date ? date(o.due_date) : "Belum disepakati"}
                    </p>
                </div>
                <p className="fineprint">
                    {o.final_price
                        ? o.quote_note
                        : "Estimasi ini belum merupakan tagihan final. Penawaran final membutuhkan persetujuan pelanggan."}
                </p>
                <p className="fineprint">
                    Pembayaran manual dicatat setelah diterima petugas. Dokumen
                    ini tidak menyatakan transfer bank otomatis.
                </p>
            </section>
        </Layout>
    );
}
