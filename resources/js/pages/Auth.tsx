import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
export default function Auth() {
    const [register, setRegister] = useState(false);
    const f = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    return (
        <Layout title="Ruang pelanggan">
            <section className="auth-layout">
                <div>
                    <span className="eyebrow">SEBUAH AWAL YANG PERSONAL</span>
                    <h1>
                        Cerita Anda,
                        <br />
                        <em>jahitan kami.</em>
                    </h1>
                    <p>
                        Simpan ukuran, ikuti proses pengerjaan, dan lihat setiap
                        detail pesanan dalam ruang pribadi Anda.
                    </p>
                    <img
                        src="/images/shirt.jpg"
                        alt="Kemeja dengan potongan yang rapi"
                    />
                </div>
                <div className="auth-panel">
                    <span className="eyebrow">RUANG PELANGGAN & TIM</span>
                    <h2>
                        {register
                            ? "Mari berkenalan."
                            : "Selamat datang kembali."}
                    </h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            f.post(register ? "/daftar" : "/masuk", {
                                onFinish: () =>
                                    f.reset(
                                        "password",
                                        "password_confirmation",
                                    ),
                            });
                        }}
                    >
                        {register && (
                            <label>
                                Nama lengkap
                                <input
                                    required
                                    maxLength={80}
                                    autoComplete="name"
                                    value={f.data.name}
                                    onChange={(e) =>
                                        f.setData("name", e.target.value)
                                    }
                                />
                            </label>
                        )}
                        <label>
                            Email
                            <input
                                required
                                type="email"
                                autoComplete="username"
                                value={f.data.email}
                                onChange={(e) =>
                                    f.setData("email", e.target.value)
                                }
                            />
                        </label>
                        <label>
                            Kata sandi
                            <input
                                required
                                type="password"
                                minLength={register ? 12 : 1}
                                autoComplete={
                                    register
                                        ? "new-password"
                                        : "current-password"
                                }
                                value={f.data.password}
                                onChange={(e) =>
                                    f.setData("password", e.target.value)
                                }
                            />
                        </label>
                        {register && (
                            <label>
                                Ulangi kata sandi
                                <input
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    value={f.data.password_confirmation}
                                    onChange={(e) =>
                                        f.setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                />
                            </label>
                        )}
                        <button
                            className="btn primary full"
                            disabled={f.processing}
                        >
                            {f.processing
                                ? "Memproses…"
                                : register
                                  ? "Buat akun pelanggan"
                                  : "Masuk"}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                    <button
                        className="text-btn"
                        onClick={() => {
                            setRegister(!register);
                            f.clearErrors();
                        }}
                    >
                        {register
                            ? "Sudah punya akun? Masuk"
                            : "Belum punya akun? Daftar"}
                    </button>
                    <small>
                        Ukuran dan foto referensi hanya tersedia bagi Anda dan
                        tim penjahit.
                    </small>
                </div>
            </section>
        </Layout>
    );
}
