import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { cn } from "@/utils";

interface PaginationRowProps {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

const PaginationRow: React.FC<PaginationRowProps> = ({
  currentPage,
  pageSize,
  totalRecords,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-typo-900">
        Showing {startRecord} to {endRecord} of {totalRecords} records
      </span>
      <Pagination className="mx-0 w-fit">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => onPageChange(currentPage - 1)}
              className={cn(
                currentPage === 1 && "pointer-events-none opacity-50"
              )}
            />
          </PaginationItem>

          {/* First page */}
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={() => onPageChange(1)}
              isActive={currentPage === 1}
            >
              1
            </PaginationLink>
          </PaginationItem>

          {/* Show ellipsis if there are many pages before current */}
          {currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Current page and surrounding pages */}
          {currentPage > 2 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => onPageChange(currentPage - 1)}
              >
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {currentPage !== 1 && currentPage !== totalPages && (
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
          )}

          {currentPage < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => onPageChange(currentPage + 1)}
              >
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Show ellipsis if there are many pages after current */}
          {currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Last page */}
          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => onPageChange(totalPages)}
                isActive={currentPage === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => onPageChange(currentPage + 1)}
              className={cn(
                currentPage === totalPages && "pointer-events-none opacity-50"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationRow;
