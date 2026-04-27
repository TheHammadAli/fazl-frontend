"use client";
import React, { useState } from "react";
import Cart from "./Cart";
import { useGetProductDetailQuery } from "@/store/services/homeService";
import { useSearchParams } from "next/navigation";
import { useGetShopDetailQuery } from "@/store/services/sellingService";
import BuyProductDetail from "./BuyProductDetail";
import ChooseDateModal from "../Services/ChooseDate";
import { useGetProductOwnerDetailQuery } from "@/store/services/authService";

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
  const { data: ownerDetail } = useGetProductOwnerDetailQuery(
    product?.data?.ownerId,
    {
      skip: !product?.data?.ownerId,
    },
  );
  return (
    <div>
      {step === "product" && (
        <BuyProductDetail
          setStep={setStep}
          selectedVariants={selectedVariants}
          setSelectedVariants={setSelectedVariants}
          product={product}
          shopData={shopDetail?.data}
          ownerDetail={ownerDetail}
        />
      )}
      {step === "cart" && (
        <Cart
          ownerDetail={ownerDetail}

          product={product}
          selectedVariants={selectedVariants}
          shopData={shopDetail?.data}
        />
      )}
    </div>
  );
}

export default BuyProduct;
