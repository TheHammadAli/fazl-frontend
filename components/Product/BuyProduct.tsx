"use client";
import React, { useState } from "react";
import Cart from "./Cart";
import { useGetProductDetailQuery } from "@/store/services/homeService";
import { useSearchParams } from "next/navigation";
import { useGetShopDetailQuery } from "@/store/services/sellingService";
import BuyProductDetail from "./BuyProductDetail";

function BuyProduct() {
  const [step, setStep] = useState<"product" | "cart">("product");
  const id = useSearchParams().get("id");

  const {
    data: product,
    isLoading,
    isFetching,
    isSuccess,
  } = useGetProductDetailQuery(id, {
    skip: !id,
  });
  const { data: shopDetail } = useGetShopDetailQuery(product?.data?.shopId, {
    skip: !isSuccess,
  });
  const [selectedVariants, setSelectedVariants] = useState({});

  return (
    <div>
      {step === "product" && (
        <BuyProductDetail
          setStep={setStep}
          selectedVariants={selectedVariants}
          setSelectedVariants={setSelectedVariants}
          product={product}
          shopData={shopDetail?.data}
        />
      )}
      {step === "cart" && (
        <Cart
          product={product}
          selectedVariants={selectedVariants}
          shopData={shopDetail?.data}
        />
      )}
    </div>
  );
}

export default BuyProduct;
