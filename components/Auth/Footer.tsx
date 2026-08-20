import React from 'react'
import FazaLogo from '@/assets/icons/fazal-logo.svg'
import WhatsAppIcon from '@/assets/icons/whatsapp-icon.svg'
import Image from 'next/image'
import { useDictionary } from '@/dictionaries/DictionaryProvider'
import { getSupportWhatsAppUrl, PRIVACY_POLICY_URL, TERMS_AND_CONDITIONS_URL } from '@/assets/content/constants'
function Footer() {
    const { placeholders } = useDictionary();
    return (
        <div className=' w-full flex flex-col gap-2 justify-center items-center'>
            <Image src={FazaLogo} alt='faza-logo' />
            <div className="flex w-full max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <div
                    onClick={() =>
                        window.open(getSupportWhatsAppUrl(), "_blank", "noopener,noreferrer")
                    }
                    className='inline-flex items-center gap-1 text-green-1 cursor-pointer hover:underline text-[12px] font-normal'
                >
                    <Image src={WhatsAppIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
                    {placeholders.report_a_problem}
                </div>
                <div className='h-1 w-1 bg-green-1 rounded-full'></div>
                <div onClick={() =>
                    window.open(TERMS_AND_CONDITIONS_URL, "_blank", "noopener,noreferrer")
                } className=' cursor-pointer hover:underline text-green-1 text-[12px] font-normal'>{placeholders["terms_condition" as keyof typeof placeholders] ?? "Terms and Conditions"}</div>
                <div className='h-1 w-1 bg-green-1 rounded-full'></div>
                <div onClick={() =>
                    window.open(PRIVACY_POLICY_URL, "_blank", "noopener,noreferrer")
                } className=' cursor-pointer hover:underline text-green-1 text-[12px] font-normal'>{placeholders["privacy_policy" as keyof typeof placeholders] ?? "Privacy Policy"}</div>
            </div>
        </div>
    )
}

export default Footer