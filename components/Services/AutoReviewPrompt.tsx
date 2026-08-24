"use client";

import React, { useEffect, useRef, useState } from "react";
import { getUserId } from "@/utils/getUserId";
import { useGetBookedServicesQuery } from "@/store/services/sellingService";
import { useWriteReviewMutation } from "@/store/services/reviewService";
import Modal from "@/components/Ui/Modals/Modal";
import AddReviewModal from "@/components/Ui/AddReviewModal";
import toast from "react-hot-toast";

const REVIEW_FEEDBACK_TOAST_MS = 2500;
const SCAN_LIMIT = 20;
const POLL_INTERVAL_MS = 60000;
const DISMISSED_STORAGE_KEY = "reviewPromptDismissedIds";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

type BookedServiceRequest = {
    _id?: string;
    id?: string;
    status?: string;
    alreadyReviewed?: boolean;
    createdAt?: string;
    service?: { _id?: string; title?: string; images?: string[] };
};

function getRequestId(request: BookedServiceRequest): string {
    return String(request._id ?? request.id ?? "");
}

function readDismissedIds(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = window.localStorage.getItem(DISMISSED_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
        return new Set();
    }
}

function persistDismissedId(id: string) {
    if (typeof window === "undefined" || !id) return;
    const current = readDismissedIds();
    current.add(id);
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...current]));
}

/** App-wide: shows the post-booking review prompt on whatever page the customer is currently
 *  on (mounted once in the dashboard Layout, not scoped to the Booked Services tab). Each
 *  booking is only ever prompted once: submitting a review marks it reviewed server-side, so it
 *  never matches again; closing the modal any other way (X, Cancel, click-outside) permanently
 *  dismisses it for this browser via localStorage, so it never reappears either way. Only shows
 *  for logged-in users, since it lives under the authenticated dashboard layout. */
function AutoReviewPrompt() {
    const userId = getUserId();
    const modalRef = useRef<HTMLDivElement>(null);
    const promptedIdsRef = useRef<Set<string>>(new Set());
    const justSubmittedRef = useRef(false);

    const [target, setTarget] = useState<BookedServiceRequest | null>(null);
    const [open, setOpen] = useState(false);
    const [writeReview, { isLoading: isSubmitting }] = useWriteReviewMutation();

    const { data } = useGetBookedServicesQuery(
        { customerId: userId, page: 1, limit: SCAN_LIMIT, status: "accepted,confirmed" },
        { skip: !userId, pollingInterval: POLL_INTERVAL_MS },
    );

    useEffect(() => {
        if (open || !userId) return;
        const items = (data?.data as BookedServiceRequest[] | undefined) ?? [];
        const dismissed = readDismissedIds();

        const eligible = items.find((item) => {
            const id = getRequestId(item);
            if (!id) return false;
            if (promptedIdsRef.current.has(id) || dismissed.has(id)) return false;
            if (item.alreadyReviewed !== false) return false;
            if (item.status !== "accepted" && item.status !== "confirmed") return false;
            if (!item.createdAt) return false;
            return Date.now() - new Date(item.createdAt).getTime() >= TWENTY_FOUR_HOURS_MS;
        });

        if (!eligible) return;
        const id = getRequestId(eligible);
        promptedIdsRef.current.add(id);
        justSubmittedRef.current = false;
        setTarget(eligible);
        setOpen(true);
    }, [data, open, userId]);

    function closeModal(wasSubmitted: boolean) {
        if (!wasSubmitted && target) {
            persistDismissedId(getRequestId(target));
        }
        setOpen(false);
    }

    function handleModalSetOpen(next: React.SetStateAction<boolean>) {
        const resolved = typeof next === "function" ? (next as (prev: boolean) => boolean)(open) : next;
        if (!resolved) {
            closeModal(justSubmittedRef.current);
            return;
        }
        setOpen(true);
    }

    function handleSubmit({ rating, comment }: { rating: number; comment: string }) {
        if (!target?.service?._id) return;
        writeReview({
            userId: userId ?? "",
            itemId: target.service._id,
            itemType: "service",
            rating,
            comment,
            requestId: getRequestId(target),
        })
            .unwrap()
            .then((res) => {
                toast.success(res.message, { duration: REVIEW_FEEDBACK_TOAST_MS });
                justSubmittedRef.current = true;
                window.setTimeout(() => closeModal(true), REVIEW_FEEDBACK_TOAST_MS);
            })
            .catch((err: { data?: { message?: string } }) => {
                toast.error(err.data?.message ?? "", { duration: REVIEW_FEEDBACK_TOAST_MS });
            });
    }

    if (!userId) return null;

    return (
        <Modal editModalRef={modalRef} open={open} setOpen={handleModalSetOpen} centered>
            <AddReviewModal
                setOpen={handleModalSetOpen}
                onSubmit={handleSubmit}
                loading={isSubmitting}
                itemName={target?.service?.title}
                itemImage={target?.service?.images?.[0]}
            />
        </Modal>
    );
}

export default AutoReviewPrompt;
