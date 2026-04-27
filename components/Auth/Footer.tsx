import React from 'react'
import FazaLogo from '@/assets/icons/fazal-logo.svg'
import Image from 'next/image'
import Link from 'next/link'
function Footer() {
    return (
        <div className=' w-full flex flex-col gap-2 justify-center items-center'>
            <Image src={FazaLogo} alt='faza-logo' />
            <div className='flex items-center gap-2'>
                <Link href='/contact-us' className='text-green-1 text-[12px] font-normal'>Contact</Link>
                <div className='h-1 w-1 bg-green-1 rounded-full'></div>
                <Link href='/terms-conditions' className='text-green-1 text-[12px] font-normal'>Terms and Conditions</Link>
                <div className='h-1 w-1 bg-green-1 rounded-full'></div>
                <Link href='/privacy-policy' className='text-green-1 text-[12px] font-normal'>Privacy Policy</Link>
            </div>
        </div>
    )
}

export default Footer