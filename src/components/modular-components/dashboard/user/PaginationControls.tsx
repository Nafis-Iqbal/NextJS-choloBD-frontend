import React from "react";

// Pagination component
export const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, onPageChange, className }) => (
  <div className={`flex items-center justify-center gap-2 mt-4 ${className || ''}`}>
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      style={{
        backgroundColor: currentPage === 1 ? 'var(--theme-border-subtle)' : 'var(--theme-teal)',
        color: currentPage === 1 ? 'var(--theme-text-subtle)' : 'white',
        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
      }}
      className="px-3 py-1 rounded-lg transition-colors duration-150"
      onMouseEnter={(e) => {
        if (currentPage > 1) {
          e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (currentPage > 1) {
          e.currentTarget.style.backgroundColor = 'var(--theme-teal)';
        }
      }}
    >
      Previous
    </button>
    <span className="text-sm theme-text-subtle">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      style={{
        backgroundColor: currentPage === totalPages ? 'var(--theme-border-subtle)' : 'var(--theme-teal)',
        color: currentPage === totalPages ? 'var(--theme-text-subtle)' : 'white',
        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
      }}
      className="px-3 py-1 rounded-lg transition-colors duration-150"
      onMouseEnter={(e) => {
        if (currentPage < totalPages) {
          e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (currentPage < totalPages) {
          e.currentTarget.style.backgroundColor = 'var(--theme-teal)';
        }
      }}
    >
      Next
    </button>
  </div>
);
