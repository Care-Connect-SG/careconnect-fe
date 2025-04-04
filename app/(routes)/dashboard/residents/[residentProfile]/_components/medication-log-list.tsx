"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MedicationAdministrationLog } from "@/types/medication-log";
import { getMedicationLogs } from "@/app/api/medication-log";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
    residentId: string;
}

const MedicationLogList: React.FC<Props> = ({ residentId }) => {
    const [logs, setLogs] = useState<MedicationAdministrationLog[]>([]);
    const [filterDate, setFilterDate] = useState("");

    const fetchLogs = async () => {
        const logs = await getMedicationLogs(residentId, filterDate);
        // Sort newest first
        setLogs(
            logs.sort(
                (a, b) =>
                    new Date(b.administered_at).getTime() -
                    new Date(a.administered_at).getTime()
            )
        );
    };

    useEffect(() => {
        if (residentId) fetchLogs();
    }, [residentId, filterDate]);

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block font-semibold mb-1">Filter by Date</label>
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <Button onClick={fetchLogs}>Apply</Button>
            </div>

            {logs.length === 0 ? (
                <p className="text-gray-500 mt-4">No medication logs found.</p>
            ) : (
                <ul className="space-y-4 mt-4">
                    {logs.map((log) => (
                        <li key={log.id} className="border p-4 rounded-lg">
                            <p>
                                <strong>Medication ID:</strong> {log.medication_id}
                            </p>
                            <p>
                                <strong>Date/Time:</strong>{" "}
                                {format(new Date(log.administered_at), "PPPpp")}
                            </p>
                            <p>
                                <strong>Nurse:</strong> {log.nurse || "Unassigned"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MedicationLogList;
