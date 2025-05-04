"use client";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import UserContext from "@/utils/UserContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const statusOptions = [
    "paymentVerificationPending",
    "paymentVerified",
    "startedStichting",
    "onDelivery",
    "delivered",
    "cancelled"
];

const statusFilters = ["All", ...statusOptions];

const statusConfig = {
    paymentVerificationPending: {
        title: "Payment Verification Pending",
        icon: "hourglass-half",
        color: "bg-yellow-500",
        description: "We're verifying your payment details",
    },
    paymentVerified: {
        title: "Payment Verified",
        icon: "check-circle",
        color: "bg-green-500",
        description: "Your payment has been confirmed",
    },
    startedStichting: {
        title: "Stitching Started",
        icon: "cut",
        color: "bg-blue-500",
        description: "Tailor has started working on your order",
    },
    onDelivery: {
        title: "On Delivery",
        icon: "truck",
        color: "bg-purple-500",
        description: "Your order is on its way",
    },
    delivered: {
        title: "Delivered",
        icon: "box-open",
        color: "bg-green-600",
        description: "Order has been delivered",
    },
    cancelled: {
        title: "Cancelled",
        icon: "ban",
        color: "bg-gray-500",
        description: "Order was cancelled",
    }
};

const statusColors = {
    paymentVerificationPending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    paymentVerified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    startedStichting: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    onDelivery: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
};

const formatStatus = (status) => {
    return statusConfig[status]?.title || status;
};

const ProductStackDisplay = ({ products, theme }) => {
    return (
        <div className="flex items-center mb-3">
            <div className="flex -space-x-3 mr-3">
                {products.slice(0, 5).map((product, index) => (
                    <div 
                        key={index}
                        className="relative w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-md hover:z-20 hover:scale-110 transition-transform duration-200"
                        style={{ 
                            zIndex: 5 - index,
                            marginLeft: index > 0 ? '-0.75rem' : '0'
                        }}
                    >
                        <Image
                            src={product?.image || "/images/default-product.png"}
                            alt={product?.name || "Product"}
                            fill
                            className="object-cover rounded-full"
                            sizes="(max-width: 768px) 50px, 50px"
                        />
                        {index === 4 && products.length > 5 && (
                            <div className={`absolute inset-0 rounded-full flex items-center justify-center text-xs font-bold ${theme.colorBg} ${theme.colorText} bg-opacity-90 backdrop-blur-sm`}>
                                +{products.length - 5}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex-1">
                {products.length === 1 ? (
                    <p className={`text-sm font-medium ${theme.colorText} line-clamp-2 text-left`}>
                        {products[0].name}
                    </p>
                ) : (
                    <div className="space-y-1">
                        <p className={`text-sm font-medium ${theme.colorText} text-left`}>
                            {products.length} products in order
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-left line-clamp-1">
                            {products.slice(0, 3).map(p => p.name).join(", ")}
                            {products.length > 3 && "..."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function OrdersPage() {
    const { theme, userData } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [tailorName, setTailorName] = useState("");

    // Fetch tailor name
    useEffect(() => {
        if (userData?.bId) {
            const fetchTailorName = async () => {
                try {
                    const tailorDoc = await getDoc(doc(db, "tailors", userData.bId));
                    if (tailorDoc.exists()) {
                        setTailorName(tailorDoc.data().businessName || tailorDoc.data().name || "Tailor");
                    }
                } catch (error) {
                    console.error("Error fetching tailor name:", error);
                }
            };
            fetchTailorName();
        }
    }, [userData?.bId]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const ordersQuery = query(
                collection(db, "OrdersManagement"),
                where("orderStatus", "!=", "inCart")
            );
            
            const ordersSnapshot = await getDocs(ordersQuery);
            
            if (ordersSnapshot.empty) {
                setOrders([]);
                return;
            }

            const ordersData = ordersSnapshot.docs.map(orderDoc => {
                const orderData = orderDoc.data();
                
                const deliveryAddress = orderData.deliveryAddress || {};
                const customerInfo = {
                    name: deliveryAddress.name || "Customer",
                    phone: deliveryAddress.phone || "Not available",
                    address: `${deliveryAddress.streetAddress || ''}, ${deliveryAddress.city || ''}`,
                    email: deliveryAddress.email || "Not provided"
                };

                return {
                    id: orderDoc.id,
                    ...orderData,
                    customerInfo,
                    placedOnDate: orderData.placedOnDate,
                    products: orderData.products || [],
                    paymentDetails: orderData.paymentDetails || {}
                };
            });

            const filteredOrders = ordersData.filter(order => 
                (activeFilter === "All" || order.orderStatus === activeFilter) &&
                order.products?.some(product => product.tailorId === userData?.bId)
            );

            setOrders(filteredOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [userData?.bId, activeFilter]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, "OrdersManagement", orderId);
            await updateDoc(orderRef, {
                orderStatus: newStatus,
                updatedAt: new Date().toISOString()
            });
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, orderStatus: newStatus } : order
            ));
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp?.seconds) return "N/A";
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="flex flex-col h-full">
            <div className={`p-6 rounded-lg ${theme.mainTheme} flex flex-col h-full overflow-hidden`}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${theme.colorText}`}>
                        Orders ({orders.length})
                    </h1>
                    <div className="flex items-center gap-2">
                        <SimpleButton
                            btnText="Refresh"
                            onClick={fetchOrders}
                            icon={<i className="fas fa-sync-alt mr-2"/>}
                        />
                        <div className={`text-sm px-3 py-1 rounded-full ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder}`}>
                            {tailorName}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className={`text-sm ${theme.colorText}`}>
                        <i className="fas fa-filter mr-1"></i>
                        Filter by status:
                    </span>
                    {statusFilters.map(filter => (
                        <motion.button
                            key={filter}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFilterChange(filter)}
                            className={`px-3 py-1 rounded-full text-xs flex items-center ${
                                activeFilter === filter
                                    ? `${theme.hoverBg} bg-opacity-50 font-semibold`
                                    : `${theme.colorBg}`
                            } ${theme.colorText} border ${theme.colorBorder}`}
                        >
                            {filter === "All" ? (
                                <>
                                    <i className="fas fa-list mr-1"></i>
                                    All Orders
                                </>
                            ) : (
                                <>
                                    <i className={`fas fa-${statusConfig[filter]?.icon} mr-1`}></i>
                                    {formatStatus(filter)}
                                </>
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <LoadingSpinner size={48} />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className={`text-center py-12 ${theme.colorText}`}>
                            <p>No orders found for your business</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                            {orders.map(order => (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`p-4 rounded-lg border ${theme.colorBorder} ${theme.colorBgSecondary}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className={`text-sm font-medium ${theme.subTextColor}`}>
                                            Order #{order.id.slice(0, 8).toUpperCase()}
                                        </h3>
                                        <div className={`px-2 py-1 rounded-full text-xs ${statusColors[order.orderStatus]}`}>
                                            <i className={`fas fa-${statusConfig[order.orderStatus]?.icon} mr-1`}></i>
                                            {formatStatus(order.orderStatus)}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className={`text-sm font-medium ${theme.colorText}`}>
                                            {order.customerInfo.name}
                                        </p>
                                        <p className={`text-xs ${theme.subTextColor} flex items-center mt-1`}>
                                            <i className="fas fa-phone-alt mr-1"></i>
                                            {order.customerInfo.phone}
                                        </p>
                                        <p className={`text-xs ${theme.subTextColor} flex items-center mt-1`}>
                                            <i className="far fa-calendar-alt mr-1"></i>
                                            {formatDate(order.placedOnDate)}
                                        </p>
                                        {order.paymentDetails?.paymentMethod && (
                                            <p className={`text-xs ${theme.subTextColor} flex items-center mt-1`}>
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                {order.paymentDetails.paymentMethod}
                                            </p>
                                        )}
                                    </div>

                                    {/* Enhanced Product Stack Display */}
                                    <ProductStackDisplay products={order.products} theme={theme} />

                                    {/* Order Summary */}
                                    <div className="flex justify-between items-center mt-3">
                                        <div>
                                            <p className={`text-sm font-medium ${theme.colorText}`}>
                                                Rs. {order.products.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0).toLocaleString()}
                                            </p>
                                            <p className={`text-xs ${theme.subTextColor}`}>
                                                {order.products.reduce((sum, p) => sum + (p.quantity || 1), 0)} {order.products.length === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className={`text-xs p-2 rounded ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder}`}
                                            >
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>
                                                        {formatStatus(status)}
                                                    </option>
                                                ))}
                                            </select>
                                            <Link href={`/business-dashboard/orders/${order.id}`}>
                                                <SimpleButton
                                                    btnText="Details"
                                                    type="simple"
                                                    size="small"
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}