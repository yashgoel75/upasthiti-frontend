"use client";

import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";

export default function Branch() {
  const searchParams = useSearchParams();
  const params = useParams();

  return <>{params.branchId}</>;
}
