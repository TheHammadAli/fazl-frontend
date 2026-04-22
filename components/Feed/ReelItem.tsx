import { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ReelItem as ReelItemType } from "./ReelsFeed";
import catFasionIcon from "@/assets/icons/cat-fashion-image.svg";
import Image from "next/image";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useRouter } from "next/navigation";
export default function ReelItem({
    type,
    item,
    isMuted,
    setIsMuted,
}: {
    type: string;
    item: ReelItemType;
    isMuted: boolean;
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const router = useRouter();
    const { placeholders } = useDictionary();
    type PlaceholderKey = keyof typeof placeholders;
    const ph = (key: PlaceholderKey) => placeholders[key];
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const playRequestIdRef = useRef(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const { ref, inView } = useInView({
        threshold: 0.7, // 70% visible = play
    });

    const playSafely = async () => {
        const video = videoRef.current;
        if (!video) return;
        const requestId = ++playRequestIdRef.current;
        try {
            await video.play();
            if (playRequestIdRef.current === requestId) {
                setIsPlaying(true);
            }
        } catch {
            // play() can be interrupted by pause during fast scroll/snap transitions
        }
    };

    const pauseSafely = () => {
        const video = videoRef.current;
        if (!video) return;
        playRequestIdRef.current += 1;
        if (!video.paused) {
            video.pause();
        }
        setIsPlaying(false);
    };

    useEffect(() => {
        if (inView) {
            playSafely();
        } else {
            pauseSafely();
        }
    }, [inView]);

    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = isMuted;
    }, [isMuted]);

    const togglePlayPause = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            playSafely();
        } else {
            pauseSafely();
        }
    };

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
    };

    const handleSeek = (value: number) => {
        if (!videoRef.current || !Number.isFinite(duration)) return;
        videoRef.current.currentTime = value;
        setCurrentTime(value);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.min(Math.max(x / rect.width, 0), 1);
        handleSeek(ratio * duration);
    };

    return (
        <div
            ref={ref}
            role="button"
            tabIndex={0}
            onClick={togglePlayPause}
            onKeyDown={(e) => {
                if (e.code === "Space" || e.key === " ") {
                    e.preventDefault();
                    togglePlayPause();
                }
            }}
            style={{
                height: "100%",
                position: "relative",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        >
            <video
                ref={videoRef}
                src={item.video}
                muted={isMuted}
                loop
                playsInline
                onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration || 0);
                }}
                onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime || 0);
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />

            <div
                className="flex absolute gap-2 right-0 top-5 ltr:left-5 rtl:right-5"

            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePlayPause();
                    }}
                    className="text-[24px] flex items-center justify-center font-light"
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: "999px",
                        border: "none",
                        background: "rgba(0,0,0,0.33)",
                        color: "white",
                        cursor: "pointer",

                    }}
                >
                    {isPlaying ? "❚❚" : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                    }
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                    }}
                    className="flex items-center justify-center"
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: "999px",
                        border: "none",
                        background: "rgba(0,0,0,0.33)",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    {isMuted ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
                    </svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                        </svg>
                    }
                </button>
            </div>

            <div className="absolute bottom-6 left-0 right-0 px-6 ">
                <div
                    className="text-[14px] font-normal text-white "
                >
                    <div className="flex overflow-hidden   bg-[#4A4A4A3D] w-max rounded-md  border-[0.5px] border-[#74747480]">
                        <div className="py-1 px-2 flex items-center justify-center bg-[#505050C2]"><Image src={catFasionIcon} alt="cat-fasion-icon" /></div>
                        <div className="text-[14px] px-2 py-1 font-light text-white">{item.category}</div></div>
                    <h3 className="text-[16px] font-medium mt-2 ">{item.title}</h3>
                    <p className="mt-1">Rs {item.price}</p>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (type === "products") {
                                router.push(`/buy-product?id=${item.id}`);
                            } else if (type === "services") {
                                router.push(`/book-service?id=${item.id}`);
                            }
                        }}
                        className="bg-green-1 mt-2 h-[38px] w-full cursor-pointer rounded-md px-4  text-white"
                    >
                        {type === "products" ? ph("shop_now") : ph("book_now")}
                    </button>
                </div>
            </div>
            <div
                className="absolute bottom-0 px-1 w-full pb-0.5 "
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 20 }}
            >
                <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="h-[4px] w-full cursor-pointer rounded-full bg-black/40"
                >
                    <div
                        className="h-full rounded-full bg-green-1"
                        style={{
                            width: `${duration ? (Math.min(currentTime, duration) / duration) * 100 : 0}%`,
                        }}
                    />
                </div>
            </div>

        </div >
    );
}