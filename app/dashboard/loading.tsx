import { LoadingState } from "@/components/loading-state";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full h-[60vh] rounded-3xl mt-4">
      <LoadingState message="Mempersiapkan dashboard..." />
    </div>
  );
}
