"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetServiceDetailQuery } from "@/store/services/sellingService";
import BuyServiceDetail from "./BuyServiceDetail";
import ServiceCart from "./ServiceCart";
import Modal from "../Ui/Modals/Modal";
import DateTimePickerModal from "./DateTimePickerModal";
import ServiceDetailSkeleton from "../Ui/ServiceDetailPageSkelton";

function BookService() {
  const [step, setStep] = useState<"service" | "request">("service");
  const id = useSearchParams().get("id");
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [openPciker, setOpenPciker] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const {
    data: service,
    isLoading,
    isFetching,
  } = useGetServiceDetailQuery(id, {
    skip: !id,
  });

  const [selectedVariants, setSelectedVariants] = useState({});
  return (
    <div>

      <Modal
        editModalRef={modalRef}
        open={openPciker}
        setOpen={setOpenPciker}
        centered={true}
      >
        <DateTimePickerModal
          setOpenPciker={setOpenPciker}
          setStep={setStep}
          date={date}
          setDate={setDate}
        />
      </Modal>

      {step === "service" &&
        (isLoading || isFetching ? (
          <ServiceDetailSkeleton />
        ) : (
          <BuyServiceDetail
            setStep={setStep}
            selectedVariants={selectedVariants}
            setSelectedVariants={setSelectedVariants}
            service={service}
            setOpenPciker={setOpenPciker}
          />
        ))}

      {step === "request" &&
        <ServiceCart service={service} date={date} />
      }
    </div>
  );
}

export default BookService;
