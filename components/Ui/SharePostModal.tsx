'use client'
import React from 'react'
import Image from 'next/image'
import crossIcon from '@/assets/icons/cross-icon.svg'
import { useDictionary } from '@/dictionaries/DictionaryProvider'
import copyImg from '@/assets/icons/copy-link-icon.svg'

import {
    FacebookShareButton,
    FacebookIcon,
    WhatsappShareButton,
    WhatsappIcon,
    TwitterShareButton,
    XIcon,
    FacebookMessengerShareButton,
    FacebookMessengerIcon,
    EmailShareButton,
    EmailIcon,
    LinkedinShareButton,
    LinkedinIcon,
    InstapaperShareButton,
    InstapaperIcon,
    TelegramShareButton,
    TelegramIcon
} from 'react-share'
import toast from 'react-hot-toast'
import { useTrackShareMutation } from '@/store/services/feedService'
type Props = {
    setShareModal: (sharePost: boolean) => void
    shareUrl: string
    shareService?: boolean
    type: string
    itemId?: string
    itemType?: 'product' | 'service'
}
const SharePostModal = (props: Props) => {
    const { setShareModal, shareUrl, shareService, itemId, itemType } = props
    const { placeholders, share_post } = useDictionary()
    type PlaceholderKey = keyof typeof placeholders
    const ph = (key: PlaceholderKey) => placeholders[key]
    const { copy, text_copied, share_service } = share_post
    const appId = ''
    const [trackShare] = useTrackShareMutation()
    const trackedShare = React.useRef(false)
    const recordShare = () => {
        if (trackedShare.current || !itemId || !itemType) return
        trackedShare.current = true
        trackShare({ itemId, itemType })
    }
    const handleCopy = async () => {
        try {
            const textToCopy = shareUrl
            await navigator.clipboard.writeText(textToCopy)
            toast.success(text_copied)
            recordShare()
        } catch (err) { }
    }
    return (
        <div className='text-black  space-y-4 z-50 bg-white h-max p-4 w-screen sm:w-[400px] rounded-lg '>
            <div className='flex items-center pb-2 justify-between border-b-2 border-gray-200  '>
                <h1 className='text-[18px] font-semibold'>
                    {shareService ? share_service : `${ph("share")} ${props.type}`}
                </h1>
                <Image
                    onClick={() => {
                        setShareModal(false)
                    }}
                    src={crossIcon}
                    alt='icon'
                    className='cursor-pointer  h-4 w-4'
                />
            </div>
            <div className='flex items-center  gap-3  overflow-x-scroll hide-scrollbar  w-full'>
                <FacebookShareButton url={shareUrl} beforeOnClick={recordShare}>
                    <FacebookIcon size={42} round />
                </FacebookShareButton>

                <WhatsappShareButton url={shareUrl} beforeOnClick={recordShare}>
                    <WhatsappIcon size={42} round />
                </WhatsappShareButton>
                <TwitterShareButton url={shareUrl} beforeOnClick={recordShare}>
                    <XIcon size={42} round />
                </TwitterShareButton>
                <FacebookMessengerShareButton appId={appId} url={shareUrl} beforeOnClick={recordShare}>
                    <FacebookMessengerIcon size={42} round />
                </FacebookMessengerShareButton>
                <EmailShareButton url={shareUrl} beforeOnClick={recordShare}>
                    <EmailIcon size={42} round />
                </EmailShareButton>
                <LinkedinShareButton url={shareUrl} beforeOnClick={recordShare}>
                    <LinkedinIcon size={42} round />
                </LinkedinShareButton>
                <TelegramShareButton url={shareUrl} beforeOnClick={recordShare}>
                    <TelegramIcon size={42} round />
                </TelegramShareButton>
            </div>
            <div className=' border-2 border-gray-200 text-black flex items-center  text-[16px] font-medium rounded-lg '>
                <div className='w-[80%] whitespace-nowrap overflow-hidden p-2 '>
                    {shareUrl}
                </div>
                <div
                    onClick={handleCopy}
                    className='ltr:border-l-2 border-gray-200 rtl:border-r-2 p-2 ltr:pl-2 rtl:pr-2 ltr:ml-2 rtl:mr-2 flex items-center gap-2 cursor-pointer'>
                    <Image
                        className=' w-[20px] h-[20px] '
                        alt='courseImage'
                        src={copyImg}
                        width={0}
                        height={0}
                    />
                    {copy}
                </div>
            </div>
        </div>
    )
}

export default SharePostModal
