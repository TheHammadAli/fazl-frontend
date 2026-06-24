"use client";
import React, { useState } from 'react'
import Tabs from '../Ui/Tabs';
import ServiceFeeds from './ServiceFeeds';
import ProductFeeds from './ProductFeeds';

function Feed() {
    const tabs = ["products", "services"];
    const [activeTab, setActiveTab] = useState<string>(tabs[0]);
    const tabsComponents: { [key: string]: React.ReactNode } = {
        products: <ProductFeeds />,
        services: <ServiceFeeds />,
    };
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {/* <div className="shrink-0 border-b border-gray-9">
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div> */}
            <div className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden pt-2 lg:pt-4">
                <div className='absolute flex items-center gap-[2px] p-[2px] z-50 top-15 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[37px] w-[204px] bg-[#E2E8F080]/50 rounded-xl'>
                    <div className={`h-full w-[50%] bg-white rounded-xl cursor-pointer`}>Products</div>
                    <div className={`h-full w-[50%] bg-white rounded-xl cursor-pointer`}>Services</div>
                </div>
                {tabsComponents[activeTab]}
            </div>
        </div>
    );
}

export default Feed