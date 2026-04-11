"use client";

type ServiceRequestSkeletonProps = {
    count?: number;
};

function ServiceRequestSkeleton({ count = 4 }: ServiceRequestSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={`service-request-skeleton-${index}`}
                    className="py-4 border-b border-gray-9 animate-pulse"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-[60px] h-[60px] rounded-[8px] bg-gray-4" />
                        <div className="flex-1 min-w-0">
                            <div className="h-4 w-2/3 rounded bg-gray-4" />
                            <div className="h-4 w-1/2 rounded bg-gray-4 mt-2" />
                            <div className="h-4 w-1/3 rounded bg-gray-4 mt-2" />
                        </div>
                    </div>
                    <div className="h-4 w-1/2 rounded bg-gray-4 mt-4" />
                    <div className="h-4 w-1/4 rounded bg-gray-4 mt-2" />
                    <div className="mt-3 flex items-center gap-[9px]">
                        <div className="h-[42px] w-full rounded-[6px] bg-gray-4" />
                    </div>
                </div>
            ))}
        </>
    );
}

export default ServiceRequestSkeleton;
