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
      className="fixed z-60 inset-0 flex items-center justify-center bg-gray-300/20 font-sans"
      onClick={onClose} // Close modal when clicking outside
    >
      {/* Modal Animation */}
      <motion.div
        className="p-5 rounded-md shadow-lg md:w-120 text-center border-3 border-gray-600"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <p className="text-lg text-green-300">{notificationState.message}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-400 text-white rounded hover:bg-red-300"
          onClick={onClose}
        >
          Close
        </button>
      </motion.div>
    </div>
  , document.body);
};

export default NotificationPopUp;
