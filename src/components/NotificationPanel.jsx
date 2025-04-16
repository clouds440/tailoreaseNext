"use client";
import React, { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserContext from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import { db } from "@/utils/firebaseConfig";
import {
  doc,
  collection,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import SimpleButton from "./SimpleButton";

const NotificationPanel = () => {
  const { theme, userData, userLoggedIn } = useContext(UserContext);
  const router = useRouter();
  const panelRef = useRef();

  const [notifications, setNotifications] = useState([]);
  // activeTab will be either "user" or "business"
  const [activeTab, setActiveTab] = useState("user");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all notifications (both read and unread)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(
          db,
          "notifications",
          userData.uid,
          "userNotifications"
        );
        const querySnapshot = await getDocs(notificationsRef);
        const allNotifications = [];
        querySnapshot.forEach((doc) => {
          allNotifications.push({ id: doc.id, ...doc.data() });
        });
        // Sort notifications by createdAt (newest first)
        allNotifications.sort((a, b) => {
          const timeA = a.createdAt ? a.createdAt.seconds : 0;
          const timeB = b.createdAt ? b.createdAt.seconds : 0;
          return timeB - timeA;
        });
        setNotifications(allNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (userData?.uid) {
      fetchNotifications();
    }
  }, [userData?.uid]);

  // Split notifications by type
  const userNotifications = notifications.filter((n) => n.type === "user");
  const businessNotifications = notifications.filter(
    (n) => n.type === "business"
  );

  // Total unread count (for main bell)
  const totalUnreadCount = notifications.filter((n) => !n.read).length;
  // Unread count for each category
  const userUnreadCount = userNotifications.filter((n) => !n.read).length;
  const businessUnreadCount = businessNotifications.filter(
    (n) => !n.read
  ).length;

  // Handle notification click: mark as read and redirect if needed
  const handleNotificationClick = async (id) => {
    const clickedNotification = notifications.find((n) => n.id === id);
    if (!clickedNotification) return;

    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      const docRef = doc(
        db,
        "notifications",
        userData.uid,
        "userNotifications",
        id
      );
      await updateDoc(docRef, {
        read: true,
      });
      if (clickedNotification.redirect) {
        router.push(clickedNotification.redirect);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  // Handle mark all as read for current category
  const handleMarkAllRead = async () => {
    try {
      const notificationsRef = collection(
        db,
        "notifications",
        userData.uid,
        "userNotifications"
      );
      const querySnapshot = await getDocs(notificationsRef);
      const batch = writeBatch(db);

      querySnapshot.forEach((docSnap) => {
        const docRef = docSnap.ref;
        batch.update(docRef, { read: true });
      });

      await batch.commit();

      // Update state locally
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Close panel when clicking outside
  const handleClickOutside = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  // Panel animation variants using Framer Motion
  const panelVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Determine notifications to display based on active tab
  const notificationsToDisplay =
    activeTab === "user" ? userNotifications : businessNotifications;

  return (
    <>
      {/* Floating Notification Button */}
      {userLoggedIn && (
        <div
          className={`fixed bottom-2 sm:bottom-8 right-16 sm:right-24 w-14 h-14 flex items-center justify-center rounded-full border-2 shadow-lg cursor-pointer hover:scale-105 z-[9999] ${theme.mainTheme}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="relative">
            <i className={`fas fa-bell text-2xl ${theme.iconColor}`}></i>
            {totalUnreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-[6rem] right-2 sm:right-8 max-w-full w-[300px] h-[70%] sm:w-[400px] sm:h-[75%] rounded-lg shadow-lg flex flex-col z-[99999] ${theme.colorBg} ${theme.mainTheme} ${theme.colorBorder}`}
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`flex items-center justify-between p-4 border-b select-none ${theme.colorBorder}`}
            >
              <div className="flex items-center space-x-2">
                <i className={`fas fa-bell text-2xl ${theme.iconColor}`}></i>
                <h3 className={`text-lg font-bold ${theme.colorText}`}>
                  Notifications
                </h3>
              </div>
              <i
                className="fas fa-times cursor-pointer text-xl"
                onClick={() => setIsOpen(false)}
              ></i>
            </div>

            {/* Notification Tabs with badges */}
            <div className="flex">
              <div
                className="flex-1 relative"
                onClick={() => setActiveTab("user")}
              >
                <SimpleButton
                  btnText="User"
                  type={activeTab === "user" ? "default" : "primary"}
                  extraclasses="w-full rounded-none"
                  onClick={() => setActiveTab("user")}
                />
                {userUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full z-20">
                    {userUnreadCount}
                  </span>
                )}
              </div>
              <div
                className="flex-1 relative"
                onClick={() => setActiveTab("business")}
              >
                <SimpleButton
                  btnText="Business"
                  type={activeTab === "business" ? "default" : "primary"}
                  extraclasses="w-full rounded-none"
                  onClick={() => setActiveTab("business")}
                />
                {businessUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {businessUnreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notificationsToDisplay.length === 0 ? (
                <p className={`${theme.colorText} text-sm text-center`}>
                  No notifications
                </p>
              ) : (
                notificationsToDisplay.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg cursor-pointer ring-2 ${
                      notif.read ? theme.colorBg : theme.mainTheme
                    } ${theme.hoverBg}`}
                    onClick={() => handleNotificationClick(notif.id)}
                  >
                    <p className={`${theme.colorText} text-sm`}>
                      {notif.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {notif.createdAt &&
                        formatDistanceToNow(
                          new Date(notif.createdAt.seconds * 1000),
                          {
                            addSuffix: true,
                          }
                        )}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Mark All as Read Button */}
            <div className="p-3 border-t border-t-gray-200">
              <SimpleButton
                btnText={"Mark All as Read"}
                type={"primary"}
                onClick={handleMarkAllRead}
                extraclasses="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationPanel;
