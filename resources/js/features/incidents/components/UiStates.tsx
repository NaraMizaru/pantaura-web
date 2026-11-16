import { usePage } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
            <Inbox
                className="mb-3 size-8 text-muted-foreground"
                aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

export function FlashListener() {
    const { flash } = usePage<{
        flash?: { success?: string | null; error?: string | null };
    }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    return null;
}
