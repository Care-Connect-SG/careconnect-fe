"use client";

import { getMedicationById } from "@/app/api/medication";
import { getMedicationLogs } from "@/app/api/medication-log";
import { Spinner } from "@/components/ui/spinner";
import { MedicationRecord } from "@/types/medication";
import { MedicationAdministrationLog } from "@/types/medication-log";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface Props {
  residentId: string;
  selectedDate?: Date;
}

const MedicationLogList: React.FC<Props> = ({ residentId, selectedDate }) => {
  const [logs, setLogs] = useState<MedicationAdministrationLog[]>([]);
  const [medicationDetailsMap, setMedicationDetailsMap] = useState<{
    [key: string]: MedicationRecord | null;
  }>({});
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!residentId) return;

    setLoading(true);
    try {
      const dateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
      const logs = await getMedicationLogs(residentId, dateString);

      const sortedLogs = logs.sort(
        (a, b) =>
          new Date(b.administered_at).getTime() -
          new Date(a.administered_at).getTime(),
      );
      setLogs(sortedLogs);

      const medInfoMap: { [key: string]: MedicationRecord | null } = {};

      await Promise.all(
        sortedLogs.map(async (log) => {
          if (!medInfoMap[log.medication_id]) {
            const med = await getMedicationById(
              log.resident_id,
              log.medication_id,
              true,
            );
            medInfoMap[log.medication_id] = med;
          }
        }),
      );

      setMedicationDetailsMap(medInfoMap);
    } catch (error) {
      console.error("Error fetching medication logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [residentId, selectedDate]);

  const groupedByDate = logs.reduce(
    (groups, log) => {
      const date = format(new Date(log.administered_at), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    },
    {} as Record<string, MedicationAdministrationLog[]>,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {logs.length === 0 ? (
        <div className="bg-gray-50 border rounded-xl p-8 text-center">
          <p className="text-gray-500">
            {selectedDate
              ? `No medication logs found for ${format(
                  selectedDate,
                  "MMMM d, yyyy",
                )}.`
              : "No medication logs found."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, dateLogs]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <h3 className="text-sm">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h3>
              </div>

              <ul className="grid gap-4">
                {dateLogs.map((log, index) => {
                  const med = medicationDetailsMap[log.medication_id];
                  const administeredTime = new Date(log.administered_at);

                  return (
                    <li
                      key={log.id || `${log.medication_id}-${index}`}
                      className="border p-6 rounded-xl bg-gray-50 "
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 tracking-tight text-sm">
                              {med
                                ? med.medication_name.toUpperCase()
                                : "Loading medication..."}
                            </span>
                          </div>

                          {med && (
                            <div className="ml-6.5 mt-1 text-sm text-gray-600">
                              {med.dosage}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-sm font-medium">
                            {format(administeredTime, "h:mm a")}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationLogList;
