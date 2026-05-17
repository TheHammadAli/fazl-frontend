"use client";
import { getUserId } from '@/utils/getUserId';
import React from 'react'
import { useGetBookedServicesQuery, useGetUserServiceQuery } from '@/store/services/sellingService';

function BookedServices() {
    const userId = getUserId();
    const { data: bookedServices, isLoading, isError } = useGetBookedServicesQuery({
        customerId: userId,
        page: 1,
        limit: 10,
        status: 'accepted',
        jobStatus: 'completed',

    },
        {
            skip: !userId,
        }
    );
    console.log(bookedServices)
    return (
        <div>BookedServices</div>
    )
};

export default BookedServices