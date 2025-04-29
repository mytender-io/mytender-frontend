import React from "react";
import { Skeleton } from "@mui/material";
import { TableCell, TableRow } from "@/components/ui/table";

const SkeletonRow = ({ rowCount = 7 }: { rowCount?: number }) => (
  <TableRow>
    {Array.from({ length: rowCount - 1 }).map((_, index) => (
      <TableCell key={index} className="px-4">
        <Skeleton variant="text" width="100%" />
      </TableCell>
    ))}
    <TableCell className="w-[100px] px-4">
      <Skeleton variant="rounded" width={20} height={20} className="ml-auto" />
    </TableCell>
  </TableRow>
);

export default SkeletonRow;
