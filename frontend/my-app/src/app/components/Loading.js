// app/components/Loading.js
'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white  z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F38B1E]"></div>
    </div>
  );
}