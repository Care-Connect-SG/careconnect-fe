import { ReportStatus } from "@/types/report";

export default function getReportBadgeConfig(status: ReportStatus) {
    if (status === ReportStatus.DRAFT) {
        return "text-yellow-800 bg-yellow-100 h-6 hover:bg-yellow-200 hover:text-yellow-900";
    } else if (status === ReportStatus.PUBLISHED) {
        return "text-green-800 bg-green-100 h-6 hover:bg-green-200 hover:text-green-900";
    } else if (status === ReportStatus.SUBMITTED) {
        return "text-blue-800 bg-blue-100 h-6 hover:bg-blue-200 hover:text-blue-900";
    } else if (status === ReportStatus.CHANGES_REQUESTED) {
        return "text-red-800 bg-red-100 h-6 hover:bg-red-200 hover:text-red-900";
    } else if (status === ReportStatus.CHANGES_MADE) {
        return "text-purple-800 bg-purple-100 h-6 hover:bg-purple-200 hover:text-purple-900";
    }
}