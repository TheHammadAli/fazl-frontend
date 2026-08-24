"use client";

import React, { useState } from "react";
import Image from "next/image";
import crossIcon from "@/assets/icons/cross-icon.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { BeatLoader } from "react-spinners";
import DoodleButton from "@/components/Ui/DoodleButton";
import noImageAvtar from "@/assets/images/no-image-av.png";

const STAR_COUNT = 5;
const COMMENT_MAX_LENGTH = 1000;

export type AddReviewModalProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Called when the user taps Submit; close the modal yourself on success. */
  onSubmit?: (payload: { rating: number; comment: string }) => void | Promise<void>;
  loading?: boolean;
  /** Shown as a "You booked — <name>" context card when this modal can appear away from the
   *  item's own page (e.g. the auto review prompt) — omit when context is already obvious
   *  (e.g. opened from the item's own detail page). */
  itemName?: string;
  itemImage?: string;
};

function AddReviewModal({ setOpen, onSubmit, loading, itemName, itemImage }: AddReviewModalProps) {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const ph = (key: PlaceholderKey) => placeholders[key];

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const displayRating = hoverRating || rating;
  const ratingLabels: Record<number, PlaceholderKey> = {
    1: "rating_poor",
    2: "rating_fair",
    3: "rating_good",
    4: "rating_very_good",
    5: "rating_excellent",
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (rating < 1) return;
    try {
      await onSubmit?.({ rating, comment: comment.trim() });
    } catch {
      // Caller handles errors (e.g. toast); keep modal open
    }
  };

  return (
    <div className="hide-scrollbar w-screen max-w-[496px] overflow-hidden rounded-[18px] bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-[#E3EDF3] px-5 pb-4 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            {ph("write_a_review")}
          </h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            {ph("review_modal_subtitle")}
          </p>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          onClick={handleClose}
          aria-label={ph("cancel")}
        >
          <Image src={crossIcon} alt="" className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        {itemName && (
          <div className="flex items-center gap-3 rounded-[12px] bg-[#F6F8FA] p-3">
            <Image
              src={itemImage || noImageAvtar}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 shrink-0 rounded-[8px] object-cover"
            />
            <div className="min-w-0">
              <p className="text-[12px] text-[#64748B]">{ph("you_booked_label")}</p>
              <p className="truncate text-[14px] font-semibold text-[#0F172A]">{itemName}</p>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2.5 text-[14px] font-medium text-[#0F172A]">
            {ph("your_rating")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: STAR_COUNT }, (_, i) => {
                const value = i + 1;
                const active = value <= displayRating;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} / ${STAR_COUNT}`}
                    aria-pressed={rating >= value}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(value)}
                    className="cursor-pointer rounded-md p-0.5 transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="5 0 22 22"
                      className="h-9 w-10"
                      aria-hidden
                    >
                      <path
                        fill={active ? "#007781" : "none"}
                        stroke="#007781"
                        strokeWidth={1}
                        strokeLinejoin="round"
                        className={active ? "text-[#007781]" : "text-[#787880]/30"}
                        d="M12 3.09l2.35 4.76 5.26.77-3.8 3.7.9 5.24L12 14.9l-4.71 2.47.9-5.24-3.8-3.7 5.26-.77L12 3.09z"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
            <span
              className={`text-[13px] font-medium transition-opacity duration-150 ${
                displayRating > 0 ? "opacity-100 text-[#007781]" : "opacity-0"
              }`}
            >
              {ph(ratingLabels[displayRating] ?? "rating_good")}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="review-comment"
              className="text-[14px] font-medium text-[#0F172A]"
            >
              {ph("review_comment_label")}
            </label>
            <span className="text-[12px] text-[#94A3B8]">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="review-comment"
            rows={4}
            value={comment}
            maxLength={COMMENT_MAX_LENGTH}
            onChange={(e) => setComment(e.target.value)}
            placeholder={ph("review_comment_placeholder")}
            className="min-h-[120px] w-full resize-none rounded-[12px] border border-[#E3EDF3] p-3 text-[14px] text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-green-1"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E3EDF3] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          disabled={loading}
          onClick={handleClose}
          className="h-[46px] cursor-pointer rounded-[8px] border border-green-1 text-[15px] font-medium text-green-1 transition-colors hover:bg-green-1/10 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[110px]"
        >
          {ph("cancel")}
        </button>
        <DoodleButton
          type="button"
          disabled={rating < 1 || comment.trim().length === 0 || loading}
          onClick={() => void handleSubmit()}
          className="h-[46px] cursor-pointer rounded-[8px] border border-green-1 bg-green-1 text-[15px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[110px]"
        >
          {loading ? <BeatLoader color="white" size={8} /> : ph("submit")}
        </DoodleButton>
      </div>
    </div>
  );
}

export default AddReviewModal;
