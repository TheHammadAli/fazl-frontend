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
            <div className="shrink-0 border-b border-gray-9">
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden pt-2 lg:pt-4">
                {tabsComponents[activeTab]}
            </div>
        </div>
    );
}

export default Feed