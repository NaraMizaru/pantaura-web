import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { MediaItem } from '@/types/pantaura';

export function MediaGallery({ media }: { media: MediaItem[] }) {
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    if (media.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Tidak ada lampiran media.
            </p>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((item) =>
                    item.file_type === 'video' ? (
                        <div
                            key={item.id}
                            className="overflow-hidden rounded-md border bg-muted"
                        >
                            <video
                                src={item.url}
                                controls
                                preload="metadata"
                                className="aspect-video h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveMedia(item)}
                            className="group relative overflow-hidden rounded-md border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label={`Perbesar foto ${item.original_filename}`}
                        >
                            <img
                                src={item.url}
                                alt={item.original_filename}
                                loading="lazy"
                                className="aspect-video h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                            />
                        </button>
                    ),
                )}
            </div>

            <Dialog
                open={activeMedia !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveMedia(null);
                    }
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="truncate text-sm font-medium">
                            {activeMedia?.original_filename ?? 'Bukti Foto'}
                        </DialogTitle>
                    </DialogHeader>
                    {activeMedia && (
                        <div className="overflow-hidden rounded-md bg-muted">
                            <img
                                src={activeMedia.url}
                                alt={activeMedia.original_filename}
                                className="max-h-[75vh] w-full object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
