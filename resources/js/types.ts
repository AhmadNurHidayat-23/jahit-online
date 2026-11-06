export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}
export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    lead_days: number;
    image: string;
}
export interface Order {
    id: number;
    number: string;
    user: User;
    service_name: string;
    quantity: number;
    fabric: string;
    detail: string;
    measurements: Record<string, number>;
    has_reference: boolean;
    notes: string | null;
    estimate: number;
    final_price: number | null;
    quote_revision: number;
    requested_date: string;
    due_date: string | null;
    quote_note: string | null;
    status: string;
    paid_at: string | null;
    created_at: string;
    events?: { id: number; description: string; created_at: string }[];
}
export const money = (n: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);
export const date = (s: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
        new Date(s),
    );
export const labels: Record<string, string> = {
    submitted: "Diterima",
    quoted: "Menunggu persetujuan",
    confirmed: "Disepakati",
    cutting: "Pemotongan kain",
    sewing: "Penjahitan",
    fitting: "Fitting akhir",
    completed: "Selesai",
    cancelled: "Dibatalkan",
};
export const dimensions: Record<string, string> = {
    chest: "Lingkar dada",
    waist: "Lingkar pinggang",
    hips: "Lingkar pinggul",
    shoulder: "Lebar bahu",
    sleeve: "Panjang lengan",
    length: "Panjang pakaian",
};
