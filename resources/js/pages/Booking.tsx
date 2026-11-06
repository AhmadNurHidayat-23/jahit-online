import { useForm } from "@inertiajs/react";
import { ArrowRight, Upload } from "lucide-react";
import Layout from "../components/Layout";
import { money, dimensions, type Service } from "../types";
export default function Booking({
    service,
    minDate,
}: {
    service: Service;
    minDate: string;
}) {
    const f = useForm({
        quantity: 1,
        fabric: "customer",
        detail: "simple",
        measurements: {
            chest: "",
            waist: "",
            hips: "",
            shoulder: "",
            sleeve: "",
            length: "",
        } as Record<string, string>,
        reference: null as File | null,
        notes: "",
        requested_date: minDate,
    });
    const estimate =
        (service.price +
            (f.data.fabric === "atelier" ? 150000 : 0) +
            (f.data.detail === "detailed" ? 60000 : 0)) *
        f.data.quantity;
    return (
        <Layout title={"Pesan " + service.name}>
            <section className="workspace">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            LANGKAH PERTAMA / UKURAN & KEBUTUHAN
                        </span>
                        <h1>Dimulai dari detail Anda.</h1>
                        <p>
                            Isi ukuran pakaian dalam sentimeter. Tim akan
                            memeriksa kembali sebelum produksi.
                        </p>
                    </div>
                </div>
                <form
                    className="booking-layout"
                    onSubmit={(e) => {
                        e.preventDefault();
                        f.post("/pesan/" + service.id, { forceFormData: true });
                    }}
                >
                    <div>
                        <section className="panel">
                            <h2>01. Pilihan pengerjaan</h2>
                            <div className="form-grid">
                                <label>
                                    Jumlah pakaian
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        required
                                        value={f.data.quantity}
                                        onChange={(e) =>
                                            f.setData(
                                                "quantity",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </label>
                                <label>
                                    Bahan kain
                                    <select
                                        aria-label="Bahan kain"
                                        value={f.data.fabric}
                                        onChange={(e) =>
                                            f.setData("fabric", e.target.value)
                                        }
                                    >
                                        <option value="customer">
                                            Saya menyediakan kain
                                        </option>
                                        <option value="atelier">
                                            Kain dari atelier
                                            (+Rp150.000/pakaian)
                                        </option>
                                    </select>
                                </label>
                                <label>
                                    Detail desain
                                    <select
                                        aria-label="Detail desain"
                                        value={f.data.detail}
                                        onChange={(e) =>
                                            f.setData("detail", e.target.value)
                                        }
                                    >
                                        <option value="simple">
                                            Potongan sederhana
                                        </option>
                                        <option value="detailed">
                                            Detail tambahan (+Rp60.000/pakaian)
                                        </option>
                                    </select>
                                </label>
                                <label>
                                    Tanggal selesai yang diharapkan
                                    <input
                                        type="date"
                                        required
                                        min={minDate}
                                        value={f.data.requested_date}
                                        onChange={(e) =>
                                            f.setData(
                                                "requested_date",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                            </div>
                        </section>
                        <section className="panel">
                            <h2>02. Ukuran personal</h2>
                            <p>
                                Gunakan meteran kain. Jangan menarik terlalu
                                kencang. Ukuran diperiksa pada tahap konsultasi.
                            </p>
                            <div className="form-grid dimensions">
                                {Object.entries(dimensions).map(
                                    ([key, label]) => (
                                        <label key={key}>
                                            {label} (cm)
                                            <input
                                                required
                                                type="number"
                                                step="0.1"
                                                min={
                                                    key === "sleeve"
                                                        ? 5
                                                        : key === "shoulder" ||
                                                            key === "length"
                                                          ? 20
                                                          : 40
                                                }
                                                max={
                                                    key === "shoulder"
                                                        ? 80
                                                        : key === "sleeve"
                                                          ? 100
                                                          : key === "hips"
                                                            ? 220
                                                            : 200
                                                }
                                                value={f.data.measurements[key]}
                                                onChange={(e) =>
                                                    f.setData("measurements", {
                                                        ...f.data.measurements,
                                                        [key]: e.target.value,
                                                    })
                                                }
                                            />
                                        </label>
                                    ),
                                )}
                            </div>
                        </section>
                        <section className="panel">
                            <h2>03. Ceritakan inspirasinya</h2>
                            <label className="upload">
                                <Upload size={21} />
                                Foto referensi desain (opsional)
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        f.setData(
                                            "reference",
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                />
                                <small>
                                    JPG, PNG, atau WebP · Maksimal 3 MB ·
                                    Disimpan privat
                                </small>
                            </label>
                            <label>
                                Catatan desain
                                <textarea
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Warna, potongan, atau kebutuhan khusus Anda"
                                    value={f.data.notes}
                                    onChange={(e) =>
                                        f.setData("notes", e.target.value)
                                    }
                                />
                            </label>
                        </section>
                    </div>
                    <aside className="booking-summary">
                        <img src={service.image} alt={service.name} />
                        <div>
                            <span className="eyebrow">PILIHAN ANDA</span>
                            <h2>{service.name}</h2>
                            <p>{service.description}</p>
                            <dl>
                                <div>
                                    <dt>Jasa per pakaian</dt>
                                    <dd>{money(service.price)}</dd>
                                </div>
                                <div>
                                    <dt>Jumlah</dt>
                                    <dd>{f.data.quantity}</dd>
                                </div>
                                <div>
                                    <dt>Kain</dt>
                                    <dd>
                                        {f.data.fabric === "atelier"
                                            ? "Dari atelier"
                                            : "Dari pelanggan"}
                                    </dd>
                                </div>
                            </dl>
                            <div className="total">
                                <span>Estimasi total</span>
                                <strong>{money(estimate)}</strong>
                            </div>
                            <p className="fineprint">
                                Estimasi belum menjadi tagihan final. Kami
                                mengirim penawaran biaya dan jadwal untuk Anda
                                setujui sebelum produksi.
                            </p>
                            <button
                                className="btn primary full"
                                disabled={f.processing}
                            >
                                {f.processing
                                    ? "Menyimpan…"
                                    : "Kirim permintaan jahit"}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </aside>
                </form>
            </section>
        </Layout>
    );
}
