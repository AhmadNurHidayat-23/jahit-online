import { Link } from "@inertiajs/react";
import { ArrowRight, ArrowDown, MoveUpRight } from "lucide-react";
import Layout from "../components/Layout";
import { money, type Service } from "../types";
export default function Home({ services }: { services: Service[] }) {
    return (
        <Layout title="Pakaian yang mengenal Anda">
            <section className="hero">
                <div>
                    <span className="eyebrow">
                        SEHELAI / DIBUAT SECARA PERSONAL
                    </span>
                    <h1>
                        Pas di tubuh.
                        <br />
                        Dekat di <em>hati.</em>
                    </h1>
                    <p>
                        Pakaian yang baik berawal dari mendengarkan. Ceritakan
                        kebutuhan Anda, kami wujudkan lewat ukuran dan detail
                        yang diperhatikan.
                    </p>
                    <a className="btn primary" href="#layanan">
                        Temukan potongan Anda <ArrowDown size={16} />
                    </a>
                    <div className="hero-note">
                        <span>UKURAN PERSONAL</span>
                        <span>PROSES TERPANTAU</span>
                        <span>DETAIL PILIHAN ANDA</span>
                    </div>
                </div>
                <figure>
                    <img
                        src="/images/hero.jpg"
                        alt="Detail busana tailored yang dikerjakan dengan cermat"
                    />
                    <figcaption>
                        01 / POTONGAN YANG PUNYA KARAKTER{" "}
                        <MoveUpRight size={19} />
                    </figcaption>
                </figure>
            </section>
            <section id="layanan" className="services-section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">LAYANAN PILIHAN</span>
                        <h2>Sesuai gaya. Sesuai Anda.</h2>
                    </div>
                    <p>
                        Estimasi transparan, penawaran final sebelum produksi.
                    </p>
                </div>
                <div className="services">
                    {services.map((s, i) => (
                        <article key={s.id}>
                            <Link href={"/pesan/" + s.id}>
                                <img src={s.image} alt={s.name} />
                            </Link>
                            <span className="eyebrow">
                                0{i + 1} / MADE TO MEASURE
                            </span>
                            <h3>{s.name}</h3>
                            <p>{s.description}</p>
                            <div className="service-meta">
                                <strong>Mulai {money(s.price)}</strong>
                                <small>Waktu mulai {s.lead_days} hari</small>
                            </div>
                            <Link
                                className="btn secondary full"
                                href={"/pesan/" + s.id}
                            >
                                Pesan layanan <ArrowRight size={16} />
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
            <section className="craft">
                <div>
                    <span className="eyebrow">
                        DARI IDE HINGGA SIAP DIKENAKAN
                    </span>
                    <h2>
                        Setiap tahap,
                        <br />
                        Anda ikut di dalamnya.
                    </h2>
                </div>
                <ol>
                    <li>
                        <strong>Ceritakan & ukur</strong>
                        <p>
                            Pilih layanan, isi ukuran dalam sentimeter, dan
                            sertakan foto referensi bila ada.
                        </p>
                    </li>
                    <li>
                        <strong>Sepakati penawaran</strong>
                        <p>
                            Periksa harga final dan jadwal dari penjahit.
                            Produksi dimulai setelah persetujuan Anda.
                        </p>
                    </li>
                    <li>
                        <strong>Ikuti prosesnya</strong>
                        <p>
                            Pantau pemotongan kain, penjahitan, fitting, hingga
                            pakaian siap diambil.
                        </p>
                    </li>
                </ol>
            </section>
        </Layout>
    );
}
