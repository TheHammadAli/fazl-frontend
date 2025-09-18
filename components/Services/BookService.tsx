"use client";
import React, { useState } from "react";
import { useGetProductDetailQuery } from "@/store/services/homeService";
import { useSearchParams } from "next/navigation";
import {
  useGetServiceDetailQuery,
  useGetShopDetailQuery,
} from "@/store/services/sellingService";
import BuyServiceDetail from "./BuyServiceDetail";
import ServiceCart from "./ServiceCart";

function BookService() {
  const [step, setStep] = useState<"service" | "cart">("service");
  const id = useSearchParams().get("id");

  const {
    data: service,
    isLoading,
    isFetching,
    isSuccess,
  } = useGetServiceDetailQuery(id, {
    skip: !id,
  });

  const [selectedVariants, setSelectedVariants] = useState({});

  return (
    <div>
      {step === "service" && (
        <BuyServiceDetail
          setStep={setStep}
          selectedVariants={selectedVariants}
          setSelectedVariants={setSelectedVariants}
          service={service}
        />
      )}
      {step === "cart" && (
        <ServiceCart service={service} selectedVariants={selectedVariants} />
      )}
    </div>
  );
}

export default BookService;
