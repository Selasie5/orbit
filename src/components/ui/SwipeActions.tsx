import React from "react";
import { XMarkIcon, HeartIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

interface SwipeActionsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onUndo: () => void;
  canSwipe: boolean;
  canUndo: boolean;
}

const SwipeActions = ({
  onSwipeLeft,
  onSwipeRight,
  onUndo,
  canSwipe,
  canUndo,
}: SwipeActionsProps) => {
  return (
    <div className="flex items-center gap-6">
      <button
        onClick={onSwipeLeft}
        disabled={!canSwipe}
        className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        <XMarkIcon className="w-7 h-7 text-white" />
      </button>
      
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        <ArrowUturnLeftIcon className="w-5 h-5 text-white" />
      </button>
      
      <button
        onClick={onSwipeRight}
        disabled={!canSwipe}
        className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        <HeartIcon className="w-7 h-7 text-white" />
      </button>
    </div>
  );
};

export default SwipeActions;
