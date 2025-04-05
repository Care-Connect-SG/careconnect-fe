"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MedicationAdministrationLog } from "@/types/medication-log";
import { getMedicationLogs } from "@/app/api/medication-log";
import { getMedicationById } from "@/app/api/medication";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MedicationRecord } from "@/types/medication";
import { User, Clock, Pill } from "lucide-react";

interface Props {
    residentId: string;
}

const MedicationLogList: React.FC<Props> = ({ residentId }) => {
    const [logs, setLogs] = useState<MedicationAdministrationLog[]>([]);
    const [medicationDetailsMap, setMedicationDetailsMap] = useState<{
        [key: string]: MedicationRecord | null;
    }>({});
    const [filterDate, setFilterDate] = useState("");

    const fetchLogs = async () => {
        const logs = await getMedicationLogs(residentId, filterDate);
        const sortedLogs = logs.sort(
            (a, b) =>
                new Date(b.administered_at).getTime() -
                new Date(a.administered_at).getTime()
        );
        setLogs(sortedLogs);

        const medInfoMap: { [key: string]: MedicationRecord | null } = {};

        await Promise.all(
            sortedLogs.map(async (log) => {
                if (!medInfoMap[log.medication_id]) {
                    const med = await getMedicationById(log.resident_id, log.medication_id, true);
                    medInfoMap[log.medication_id] = med;
                }
            })
        );

        setMedicationDetailsMap(medInfoMap);
    };

    useEffect(() => {
        if (residentId) fetchLogs();
    }, [residentId, filterDate]);

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block font-semibold mb-1 text-sm text-gray-600">Filter by Date</label>
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <Button onClick={fetchLogs}>Apply</Button>
            </div>

            {logs.length === 0 ? (
                <p className="text-gray-500 mt-4 text-sm">No medication logs found.</p>
            ) : (
                <ul className="space-y-4 mt-4">
                    {logs.map((log, index) => {
                        const med = medicationDetailsMap[log.medication_id];
                        return (
                            <li
                                key={log.id || `${log.medication_id}-${index}`}
                                className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm space-y-2"
                            >
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span><strong>Resident ID:</strong> {log.resident_id}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Pill className="w-4 h-4 text-gray-400" />
                                    <span>
                                        <strong>Medication:</strong>{" "}
                                        {med ? `${med.medication_name} (${med.dosage})` : "Loading..."}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>
                                        <strong>Time:</strong>{" "}
                                        {new Date(log.administered_at).toLocaleString("en-SG", {
                                            timeZone: "Asia/Singapore",
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}

                                    </span>

                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default MedicationLogList;
