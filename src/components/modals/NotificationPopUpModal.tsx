/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactDOM from "react-dom";

import { motion } from "framer-motion";
import { setNotification } from "../../global-state-context/commonPopUpSlice";

const NotificationPopUp: React.FC = () => {
  const dispatch = useDispatch();
  const notificationState: {isVisible: boolean, message: string, type: string} = useSelector((state: any) => state.popUps.notification);

  const onClose = () => {
    dispatch(setNotification({
      isVisible: false,
      message: '',
      type: 'info'
    }));
  }

  if (!notificationState.isVisible) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed z-60 inset-0 flex items-center justify-center font-sans"
      style={{ backgroundColor: "rgba(42, 157, 143, 0.2)" }}
      onClick={onClose} // Close modal when clicking outside
    >
      {/* Modal Animation */}
      <motion.div
        className="p-5 bg-section rounded-md shadow-lg md:w-120 text-center theme-outline border-3"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <p className="text-lg theme-text-teal">{notificationState.message}</p>
        <button
          className="px-4 py-2 mt-4 theme-btn-teal rounded"
          onClick={onClose}
        >
          Close
        </button>
      </motion.div>
    </div>
  , document.body);
};

export default NotificationPopUp;
