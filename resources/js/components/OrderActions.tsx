import { useState } from "react";
import { router } from "@inertiajs/react";
import { money, labels, type Order } from "../types";
export default function OrderActions({
    order,
    staff,
}: {
    order: Order;
    staff: boolean;
}) {
    const [busy, setBusy] = useState(false);
    const [confirm, setConfirm] = useState<string | null>(null);
    const next: Record<string, string> = {
        confirmed: "cutting",
        cutting: "sewing",
        sewing: "fitting",
        fitting: "completed",
    };
    function action(a: string) {
        setBusy(true);
        router.patch(
            "/pesanan/" + order.id,
            { action: a, quote_revision: order.quote_revision },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBusy(false);
                    setConfirm(null);
                },
            },
        );
    }
    return (
        <div className="actions">
            {!staff && order.status === "quoted" && (
                <>
                    <p>
                        Dengan menyetujui, Anda menerima harga total{" "}
                        {money(order.final_price!)} dan jadwal {order.due_date}.
                    </p>
                    <button
                        className="btn primary"
                        disabled={busy}
                        onClick={() => action("accept")}
                    >
                        Saya setujui penawaran
                    </button>
                </>
            )}
            {!staff && ["submitted", "quoted"].includes(order.status) && (
                <button
                    className="btn secondary"
                    onClick={() => setConfirm("cancel")}
                >
                    Batalkan pesanan
                </button>
            )}
            {staff && next[order.status] && (
                <>
                    <button
                        className="btn primary"
                        disabled={
                            busy ||
                            (order.status === "fitting" && !order.paid_at)
                        }
                        onClick={() => action(next[order.status])}
                    >
                        {busy
                            ? "Menyimpan…"
                            : "Lanjut: " + labels[next[order.status]]}
                    </button>
                    {!order.paid_at && (
                        <button
                            className="btn secondary"
                            onClick={() => setConfirm("paid")}
                        >
                            Konfirmasi pembayaran
                        </button>
                    )}
                </>
            )}
            {confirm && (
                <div className="confirmation" role="alert">
                    <p>
                        {confirm === "paid"
                            ? "Pastikan pembayaran " +
                              money(order.final_price!) +
                              " sudah benar-benar diterima."
                            : "Pesanan akan dibatalkan sebelum produksi. Lanjutkan?"}
                    </p>
                    <button
                        className="btn primary"
                        disabled={busy}
                        onClick={() => action(confirm)}
                    >
                        {confirm === "paid"
                            ? "Ya, pembayaran diterima"
                            : "Ya, batalkan pesanan"}
                    </button>
                    <button
                        className="text-btn"
                        onClick={() => setConfirm(null)}
                    >
                        Kembali
                    </button>
                </div>
            )}
        </div>
    );
}
