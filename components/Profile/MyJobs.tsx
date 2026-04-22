"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import chevronIcon from "@/assets/icons/chevron.svg";
import infoCircleIcon from "@/assets/icons/info-circle.svg";
import { useGetServicesRequestsQuery, useStartJobMutation } from "@/store/services/sellingService";
import { getCookie } from "cookies-next";
import { formatRequestedDateTime } from "@/utils/formatRequestedDateTime";
import { toast } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { parsePositiveInt } from "../Updates/Notifications";

type RequestFilterKey = "sent" | "new_offer" | "accepted" | "rejected";

type RequestCard = {
  _id: string;
  title: string;
  customer: { id: string, name: string };
  price: string;
  requestedDateTime: string;
  status: "pending" | "accepted" | "rejected";
  filter: RequestFilterKey;
  jobStatus: "in_progress" | "completed" | "cancelled" | "not_started";
};

function MyJobs() {
  const limit = 10;
  const [page, setPage] = useState(1);
  const shouldStickToBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const jobsContainerRef = useRef<HTMLDivElement>(null);
  const { currentLanguage } = useDictionary();
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const userId = getCookie("userId") ?? "";
  const [filteredRequests, setFilteredRequests] = useState<RequestCard[]>([]);
  const [action, setAction] = useState<string>("");
  const { data: servicesRequests, isLoading, isFetching } = useGetServicesRequestsQuery({ id: userId, page: page, limit: limit }, { skip: !userId });
  console.log(servicesRequests, "servicesRequests");
  const [startJob, { isLoading: isJobActionLoading }] = useStartJobMutation();
  const [updateReqId, setUpdateReqId] = useState<string>("");
  const totalPages = parsePositiveInt(servicesRequests?.meta?.totalPages);
  const canLoadMore =
    totalPages != null ? page < totalPages : servicesRequests?.meta?.total >= limit;
  function handleScrollNearBottom(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    shouldStickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 120;
    if (!userId || isFetching || !canLoadMore) return;
    const nearTop = el.scrollTop <= 80;
    if (!nearTop) return;
    prevScrollHeightRef.current = el.scrollHeight;
    setPage((p) => p + 1);
  }
  const handleJobAction = (id: string, action: string) => {
    setAction(action);
    setUpdateReqId(id);
    startJob({
      requestId: id,
      action: action,
    }).unwrap().then((res) => {
      toast.success(res.message);
      setAction("");
      setUpdateReqId("");
    }).catch((err) => {
      toast.error(err.data.message);
      setAction("");
      setUpdateReqId("");
    });
  };


  useEffect(() => {
    if (!servicesRequests) return;
    const acceptedRequests = servicesRequests.data.filter(
      (item: { status: string; customer: { id: string; name: string } }) =>
        item.status === "accepted" && item.customer?.id !== userId
    );

    if (page === 1) {
      setFilteredRequests(acceptedRequests);
    } else {
      setFilteredRequests((prev) => [...prev, ...acceptedRequests]);
    }
  }, [servicesRequests, userId, page]);

  const ph = (key: PlaceholderKey) => placeholders[key];
  return (
    <div className=" h-screen ">
      <div>
        <div className="border-b border-gray-9 flex items-center justify-center">
          <div className="h-[72px]   w-[522px]  flex items-center gap-2 text-[14px]">
            <span className="text-gray-11">{ph("profile")}</span>
            <Image src={chevronIcon} alt="chevron" className="ltr:rotate-180" />
            <span className="text-green-2">{ph("my_jobs")}</span>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-[522px] pt-5">
            <div className="flex items-center justify-between border-b-1 border-[#E5E5E5] pb-3 px-4">
              <span className="text-[#4B514F] text-[14px] font-normal">{ph("start_timer_when_service_begins")}</span>
              <Image src={infoCircleIcon} alt="plus" />
            </div>


            <div ref={jobsContainerRef} onScroll={handleScrollNearBottom} className="mt-4 max-w-[760px] bg-white overflow-y-auto h-[calc(100dvh-10rem)]">
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse py-4 border-b border-gray-9">
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                    <div className="mt-3 flex justify-end">
                      <div className="h-[38px] w-[222px] rounded-[6px] bg-gray-200" />
                    </div>
                  </div>
                ))
              ) : filteredRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[14px] font-normal text-[#4B514F]">{ph("no_jobs_available")}</p>
                </div>
              ) : (
                filteredRequests.map((item: RequestCard, index: number) => (
                  <div key={index} className="py-4 border-b border-gray-9">
                    <p className="text-[15px] text-[#3C9197] font-medium leading-none first-letter:capitalize">
                      {ph("booked_your_service").replace("{name}", item?.customer?.name ?? "")}
                    </p>

                    <p className="text-[15px] font-medium mt-2 leading-none text-black-1">
                      {formatRequestedDateTime(item.requestedDateTime, currentLanguage)}
                    </p>
                    {item.jobStatus === "in_progress" && (
                      <p className="text-[14px] font-normal text-[#FF9500] mt-2 leading-none">
                        {ph("service_in_progress")}
                      </p>
                    )}

                    {item.jobStatus === "completed" && (
                      <p className="text-[14px] font-normal text-[#007781] mt-2 leading-none">
                        {ph("service_completed")}
                      </p>
                    )}


                    <div className="flex justify-end rtl:pl-3 ltr:pr-2">
                      {item.jobStatus === "in_progress" && (
                        <button onClick={() => handleJobAction(item._id, "complete_job")} className="text-[14px] min-h-[38px] font-normal w-[222px] py-[8px] rounded-[6px] cursor-pointer bg-[#E92440] text-white">
                          {isJobActionLoading && updateReqId === item._id && action === "complete_job" ? <div className="flex items-center justify-center"><BeatLoader color="#fff" size={6} /></div> : ph("end_service")}
                        </button>
                      )}
                      {item.jobStatus === "not_started" && (
                        <button onClick={() => handleJobAction(item._id, "start_job")} className="text-[14px] min-h-[38px] font-normal w-[222px] py-[8px] rounded-[6px] cursor-pointer bg-green-1 text-white">
                          {isJobActionLoading && updateReqId === item._id && action === "start_job" ? <div className="flex items-center justify-center"><BeatLoader color="#fff" size={6} /></div> : ph("start_timer")}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default MyJobs;
