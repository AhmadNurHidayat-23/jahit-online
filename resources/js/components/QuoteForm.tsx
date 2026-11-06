import { useForm } from "@inertiajs/react";
import { money, type Order } from "../types";
export default function QuoteForm({ order }: { order: Order }) {
    const f = useForm({
        final_price: order.final_price ?? order.estimate,
        due_date: order.due_date || order.requested_date,
        quote_note: order.quote_note || "",
    });
    return (
        <section className="panel quote-form">
            <span className="eyebrow">
                PENAWARAN UNTUK PERSETUJUAN PELANGGAN
            </span>
            <h2>Tentukan biaya & jadwal.</h2>
            <p>
                Estimasi awal {money(order.estimate)}. Produksi menunggu
                persetujuan pelanggan.
            </p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    f.post("/petugas/penawaran/" + order.id, {
                        preserveScroll: true,
                    });
                }}
            >
                <div className="form-grid">
                    <label>
                        Harga total final (Rp)
                        <input
                            required
                            min={1000}
                            max={100000000}
                            type="number"
                            value={f.data.final_price}
                            onChange={(e) =>
                                f.setData("final_price", Number(e.target.value))
                            }
                        />
                    </label>
                    <label>
                        Jadwal selesai
                        <input
                            required
                            type="date"
                            value={f.data.due_date}
                            onChange={(e) =>
                                f.setData("due_date", e.target.value)
                            }
                        />
                    </label>
                </div>
                <label>
                    Rincian penawaran
                    <textarea
                        required
                        minLength={5}
                        maxLength={500}
                        rows={3}
                        value={f.data.quote_note}
                        onChange={(e) =>
                            f.setData("quote_note", e.target.value)
                        }
                    />
                </label>
                <button className="btn primary" disabled={f.processing}>
                    {f.processing ? "Mengirim…" : "Kirim penawaran final"}
                </button>
            </form>
        </section>
    );
}
