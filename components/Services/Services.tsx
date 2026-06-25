"use client";
import React from "react";
import CreateService from "./CreateService";
import ServiceDetail from "./ServiceDetail";
import { useGetUserServiceQuery } from "@/store/services/sellingService";
import { getCookie } from "cookies-next";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import ServiceDetailSkeleton from "../Ui/ServiceDetailPageSkelton";

function Services() {
  const id = getCookie("userId");
  const {
    data: service,
    isLoading: serviceLoading,
    isFetching: serviceFetching,
    isError,
  } = useGetUserServiceQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const { error_messages } = useDictionary();
  const loading = serviceLoading || serviceFetching;

  return (
    <div>
      {loading && <ServiceDetailSkeleton />}

      {!loading && service?.data && service?.data?.length > 0 && (
        <ServiceDetail serviceData={service?.data?.[0]} />
      )}

      {!loading &&
        (!service?.data || service?.data?.length === 0) && <CreateService />}

      {isError && (
        <div className="flex h-[80vh] w-full items-center justify-center text-red-1">
          {error_messages.something_went_wrong}
        </div>
      )}
    </div>
  );
}

export default Services;
