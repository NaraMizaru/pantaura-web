import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function ReportInfoDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="bg-white text-[#0b1c30] shadow-xl ring-[#cfe6f7] sm:max-w-md"
            >
                <DialogHeader>
                    <DialogTitle>Cara melapor bencana</DialogTitle>
                    <DialogDescription className="text-[#3f4850]">
                        Pelaporan warga dilakukan melalui aplikasi mobile
                        Pantaura. Web publik ini hanya untuk memantau insiden,
                        sedangkan login di sini khusus admin.
                    </DialogDescription>
                </DialogHeader>

                <ol className="space-y-2.5 text-sm text-[#3f4850]">
                    <li className="flex gap-2.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                            1
                        </span>
                        Buka aplikasi mobile Pantaura di ponsel Anda.
                    </li>
                    <li className="flex gap-2.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                            2
                        </span>
                        Daftar akun warga atau masuk dengan email dan kata sandi
                        Anda.
                    </li>
                    <li className="flex gap-2.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                            3
                        </span>
                        Pilih buat laporan, tentukan jenis bencana dan lokasi
                        GPS kejadian.
                    </li>
                    <li className="flex gap-2.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                            4
                        </span>
                        Lampirkan foto/video bukti, lalu kirim laporan.
                    </li>
                    <li className="flex gap-2.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                            5
                        </span>
                        Pantau status verifikasi laporan di aplikasi atau pada
                        peta publik ini.
                    </li>
                </ol>

                <div className="rounded-lg bg-[#eff4ff] px-3 py-2.5 text-xs text-[#3f4850]">
                    Bukti bahwa kondisi sudah pulih juga diajukan melalui
                    aplikasi mobile, bukan dari halaman web ini.
                </div>

                <DialogFooter className="border-[#cfe6f7] bg-[#eff4ff]">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className="bg-[#006194] text-white hover:bg-[#004b73]"
                        >
                            Mengerti
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
