"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  createCarePlanWithEmptyValues,
  getCarePlansForResident,
} from "@/app/api/careplan";
import {
  getMedicalHistoryByResident,
  updateMedicalHistory,
} from "@/app/api/medical-history";
import { getMedicationsForResident } from "@/app/api/medication";
import { getResidentById, updateResident } from "@/app/api/resident";
import { getWellnessReportsForResident } from "@/app/api/wellness-report";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateMedicalHistoryDialog from "./_components/create-medical-history";
import CreateMedication from "./_components/create-medication-dialog";
import CreateWellnessReportDialog from "./_components/create-wellness-report-dialog";
import EditCarePlan from "./_components/edit-careplan";
import EditMedicalHistoryModal from "./_components/edit-medical-history-dialog";
import EditMedication from "./_components/edit-medication";
import EditResidentDialog from "./_components/edit-resident-dialog";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import MedicalHistoryCard from "./_components/resident-medical-history";
import ResidentMedication from "./_components/resident-medication";
import MedicationLogList from "./_components/resident-medication-log";
import ResidentProfileHeader from "./_components/resident-profile-header";
import WellnessReportList from "./_components/resident-wellness-report";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useBreadcrumb } from "@/context/breadcrumb-context";
import { useToast } from "@/hooks/use-toast";
import { toTitleCase } from "@/lib/utils";
import { CarePlanRecord } from "@/types/careplan";
import { MedicalHistory, inferTemplateType } from "@/types/medical-history";
import { MedicationRecord } from "@/types/medication";
import { ResidentRecord } from "@/types/resident";
import { WellnessReportRecord } from "@/types/wellness-report";
import { format } from "date-fns/format";
import { CalendarIcon, NotebookPen, Plus, X } from "lucide-react";
import BCMA_Scanner from "./_components/bcma-scanner";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Care Plan", value: "careplan" },
  { label: "Medication", value: "medication" },
  { label: "Wellness Report", value: "wellness" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ResidentDashboard() {
  const { residentProfile } = useParams() as { residentProfile: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setPageName } = useBreadcrumb();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const tabParam = searchParams.get("tab");
  const isValidTab = (tab: string | null): tab is TabValue => {
    return !!tab && TABS.some((t) => t.value === tab);
  };

  const [activeTab, setActiveTab] = useState<TabValue>(
    isValidTab(tabParam) ? tabParam : "overview",
  );

  const [modals, setModals] = useState({
    editResident: false,
    createMedication: false,
    editMedication: false,
    createMedicalHistory: false,
    editMedicalHistory: false,
    createWellnessReport: false,
  });
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationRecord | null>(null);
  const [selectedMedicalHistory, setSelectedMedicalHistory] =
    useState<MedicalHistory | null>(null);
  const [isCreatingCarePlan, setIsCreatingCarePlan] = useState(false);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (activeTab === "overview") {
      newParams.delete("tab");
    } else {
      newParams.set("tab", activeTab);
    }

    const newSearch = newParams.toString();
    const query = newSearch ? `?${newSearch}` : "";

    router.replace(`${pathname}${query}`, { scroll: false });
  }, [activeTab, pathname, router, searchParams]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (tabFromUrl === null && activeTab !== "overview") {
      setActiveTab("overview");
    }
  }, [searchParams]);

  const { data: resident, isLoading: isResidentLoading } =
    useQuery<ResidentRecord>({
      queryKey: ["resident", residentProfile],
      queryFn: () => getResidentById(residentProfile),
    });

  useEffect(() => {
    if (resident) {
      setPageName(toTitleCase(resident.full_name) || "Resident Profile");
    }
  }, [resident, setPageName]);

  const { data: medicalHistory = [], isLoading: isMedicalHistoryLoading } =
    useQuery<MedicalHistory[]>({
      queryKey: ["medicalHistory", residentProfile],
      queryFn: () => getMedicalHistoryByResident(residentProfile),
      enabled: activeTab === "history" || !!residentProfile,
    });

  const {
    data: medications = [],
    isLoading: isMedicationsLoading,
    refetch: refetchMedications,
  } = useQuery<MedicationRecord[]>({
    queryKey: ["medications", residentProfile],
    queryFn: () => getMedicationsForResident(residentProfile),
    enabled: activeTab === "medication" || !!residentProfile,
  });

  const {
    data: carePlans = [],
    isLoading: isCarePlansLoading,
    refetch: refetchCarePlans,
  } = useQuery<CarePlanRecord[]>({
    queryKey: ["carePlans", residentProfile],
    queryFn: () => getCarePlansForResident(residentProfile),
    enabled: activeTab === "careplan" || !!residentProfile,
  });

  const {
    data: wellnessReports = [],
    isLoading: isWellnessReportsLoading,
    refetch: refetchWellnessReports,
  } = useQuery<WellnessReportRecord[]>({
    queryKey: ["wellnessReports", residentProfile],
    queryFn: () => getWellnessReportsForResident(residentProfile),
    enabled: activeTab === "wellness" || !!residentProfile,
  });

  const updateResidentMutation = useMutation({
    mutationFn: (updatedData: Partial<ResidentRecord>) =>
      updateResident(residentProfile, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });
      closeModal("editResident");
      toast({
        variant: "default",
        title: "Profile updated",
        description: "Resident profile has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    },
  });

  const openModal = (modalName: keyof typeof modals, item?: any) => {
    if (modalName === "editMedication" && item) {
      setSelectedMedication(item);
    } else if (modalName === "editMedicalHistory" && item) {
      setSelectedMedicalHistory(item);
    }

    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));

    if (modalName === "editMedication") {
      setSelectedMedication(null);
    } else if (modalName === "editMedicalHistory") {
      setSelectedMedicalHistory(null);
    }
  };

  const handleSaveAdditionalNotes = async (newNote: string) => {
    if (!resident) return;

    try {
      const existingNotes = Array.isArray(resident.additional_notes)
        ? [...resident.additional_notes]
        : [];
      const existingTimestamps = Array.isArray(
        resident.additional_notes_timestamp,
      )
        ? [...resident.additional_notes_timestamp]
        : [];

      const updatedNotes = [...existingNotes, newNote];
      const updatedTimestamps = [
        ...existingTimestamps,
        new Date().toISOString(),
      ];

      const updateData = {
        additional_notes: updatedNotes,
        additional_notes_timestamp: updatedTimestamps,
      };

      await updateResident(resident.id, updateData);

      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });

      toast({
        variant: "default",
        title: "Note added",
        description: "Note has been added successfully",
      });
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast({
        variant: "destructive",
        title: "Error adding note",
        description: error.details || "Failed to add note",
      });
    }
  };
  const handleUpdateNote = async (index: number, updatedNote: string) => {
    if (!resident) return;

    try {
      const updatedNotes = Array.isArray(resident.additional_notes)
        ? [...resident.additional_notes]
        : [];
      const updatedTimestamps = Array.isArray(
        resident.additional_notes_timestamp,
      )
        ? [...resident.additional_notes_timestamp]
        : [];

      if (index >= 0 && index < updatedNotes.length) {
        updatedNotes[index] = updatedNote;
        updatedTimestamps[index] = new Date().toISOString();
      } else {
        throw new Error("Invalid note index");
      }

      await updateResident(resident.id, {
        additional_notes: updatedNotes,
        additional_notes_timestamp: updatedTimestamps,
      });

      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });

      toast({
        variant: "default",
        title: "Note updated",
        description: "Note has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast({
        variant: "destructive",
        title: "Error updating note",
        description: error.details || "Failed to update note",
      });
    }
  };

  const handleDeleteNote = async (index: number) => {
    if (!resident) return;

    try {
      const updatedNotes = Array.isArray(resident.additional_notes)
        ? resident.additional_notes.filter((_, idx) => idx !== index)
        : [];
      const updatedTimestamps = Array.isArray(
        resident.additional_notes_timestamp,
      )
        ? resident.additional_notes_timestamp.filter((_, idx) => idx !== index)
        : [];

      await updateResident(resident.id, {
        additional_notes: updatedNotes,
        additional_notes_timestamp: updatedTimestamps,
      });

      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });

      toast({
        variant: "default",
        title: "Note deleted",
        description: "Note has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        variant: "destructive",
        title: "Error deleting note",
        description: error.details || "Failed to delete note",
      });
    }
  };

  const handleCreateCarePlan = async () => {
    if (!residentProfile) return;

    setIsCreatingCarePlan(true);
    try {
      await createCarePlanWithEmptyValues(residentProfile);
      await refetchCarePlans();
    } catch (error) {
      console.error("Error creating care plan:", error);
    } finally {
      setIsCreatingCarePlan(false);
    }
  };

  const handleSaveMedicalHistory = async (updatedData: any) => {
    if (!selectedMedicalHistory || !resident) return;

    try {
      const templateType = inferTemplateType(selectedMedicalHistory);
      const recordId = selectedMedicalHistory.id;
      if (!recordId) {
        throw new Error("No record ID found");
      }

      await updateMedicalHistory(recordId, templateType, resident.id, {
        updatedData,
      });

      closeModal("editMedicalHistory");
      queryClient.invalidateQueries({
        queryKey: ["medicalHistory", residentProfile],
      });
    } catch (error: any) {
      console.error("Error updating medical record:", error);
      throw error;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <Spinner />
    </div>
  );

  if (isResidentLoading) {
    return (
      <div className="h-[90vh] justify-center items-center flex">
        <Spinner />
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="h-screen justify-center items-center flex">
        Resident not found
      </div>
    );
  }

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <ResidentProfileHeader
        resident={resident}
        onEdit={() => openModal("editResident")}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <ResidentDetailsCard
              gender={resident.gender}
              dateOfBirth={resident.date_of_birth}
              nricNumber={resident.nric_number}
              emergencyContactName={resident.emergency_contact_name}
              emergencyContactNumber={resident.emergency_contact_number}
              relationship={resident.relationship}
              primaryNurse={resident.primary_nurse || "None"}
              admissionDate={resident.admission_date}
            />
            <ResidentDetailsNotesCard
              additionalNotes={
                Array.isArray(resident.additional_notes)
                  ? resident.additional_notes
                  : []
              }
              initialTimestamps={
                Array.isArray(resident.additional_notes_timestamp)
                  ? resident.additional_notes_timestamp.map((ts) =>
                      typeof ts === "string" ? ts : new Date(ts).toISOString(),
                    )
                  : []
              }
              onSaveNotes={handleSaveAdditionalNotes}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Medical Record</h2>
              <Button onClick={() => openModal("createMedicalHistory")}>
                <Plus className="h-4 w-4 mr-1" />
                Medical Record
              </Button>
            </div>

            {isMedicalHistoryLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="mt-4 space-y-4">
                {medicalHistory.length > 0 ? (
                  medicalHistory.map((record, index) => (
                    <MedicalHistoryCard
                      key={index}
                      record={record}
                      onEdit={() => openModal("editMedicalHistory", record)}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 p-8 border rounded-lg bg-gray-50">
                    No medical records found for this resident.
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="medication">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
            <div className="p-6 border rounded-lg bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Medication List</h2>
                <Button onClick={() => openModal("createMedication")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              {isMedicationsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4 mt-4">
                  {medications.length > 0 ? (
                    medications.map((medication, index) => (
                      <ResidentMedication
                        key={medication.id || index}
                        medication={medication}
                        onEdit={() => openModal("editMedication", medication)}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 p-8 border rounded-lg bg-gray-50">
                      No medications found for this resident.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border rounded-lg bg-white flex flex-col h-fit">
              <div className="top-0 p-6  z-10 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Medication Log</h2>

                <div className="flex items-center gap-2">
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear filter</span>
                    </Button>
                  )}

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "MMM d")
                          : "Filter"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                      />
                    </PopoverContent>
                  </Popover>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                        size="sm"
                      >
                        <NotebookPen className="h-4 w-4" />
                        Administer
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-3xl sm:max-w-2xl p-0">
                      <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="text-xl font-semibold">
                          Medication Administration
                        </DialogTitle>
                      </DialogHeader>

                      <BCMA_Scanner
                        onSuccess={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["medicationLogs", residentProfile],
                          })
                        }
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-4">
                <MedicationLogList
                  residentId={residentProfile}
                  selectedDate={selectedDate}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="careplan">
          {isCarePlansLoading ? (
            <LoadingSpinner />
          ) : (
            <div>
              {carePlans.length > 0 ? (
                <EditCarePlan
                  careplan={carePlans[0]}
                  residentId={residentProfile}
                  onCarePlanUpdated={(updatedPlan) => {
                    if (!updatedPlan) return;
                    queryClient.setQueryData(
                      ["carePlans", residentProfile],
                      (old: CarePlanRecord[] | undefined) => {
                        if (!old) return [updatedPlan];
                        const updated = old.map((cp) =>
                          cp.id === updatedPlan.id ? updatedPlan : cp,
                        );
                        return updated.length > 0 ? updated : [updatedPlan];
                      },
                    );
                  }}
                />
              ) : (
                <div className="flex flex-col items-center mt-4 p-8 border rounded-lg bg-gray-50">
                  <p className="text-gray-500 mb-4">
                    No care plan found for this resident.
                  </p>
                  <Button
                    onClick={handleCreateCarePlan}
                    variant="default"
                    disabled={isCreatingCarePlan}
                  >
                    {isCreatingCarePlan ? (
                      <>
                        <Spinner />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1 h-4 w-4" />
                        Create Care Plan
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wellness">
          <div className="space-y-4 p-6 border rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Wellness Reports</h2>
              <Button onClick={() => openModal("createWellnessReport")}>
                <Plus className="h-4 w-4 mr-1" />
                Create Wellness Report
              </Button>
            </div>

            {isWellnessReportsLoading ? (
              <LoadingSpinner />
            ) : (
              <WellnessReportList
                reports={wellnessReports}
                residentId={residentProfile}
                onReportDeleted={refetchWellnessReports}
                onReportUpdated={refetchWellnessReports}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <EditResidentDialog
        isOpen={modals.editResident}
        onClose={() => closeModal("editResident")}
        initialData={resident}
        onSave={(updatedData) => updateResidentMutation.mutate(updatedData)}
      />

      <CreateMedication
        isOpen={modals.createMedication}
        onClose={() => closeModal("createMedication")}
        residentId={residentProfile}
        onMedicationAdded={() => {
          closeModal("createMedication");
          refetchMedications();
        }}
      />

      {selectedMedication && (
        <EditMedication
          isOpen={modals.editMedication}
          onClose={() => closeModal("editMedication")}
          medication={selectedMedication}
          residentId={residentProfile}
          onMedicationUpdated={() => {
            closeModal("editMedication");
            refetchMedications();
          }}
        />
      )}

      <CreateMedicalHistoryDialog
        isOpen={modals.createMedicalHistory}
        onClose={() => closeModal("createMedicalHistory")}
        onRecordCreated={() => {
          closeModal("createMedicalHistory");
          queryClient.invalidateQueries({
            queryKey: ["medicalHistory", residentProfile],
          });
        }}
      />

      {selectedMedicalHistory && (
        <EditMedicalHistoryModal
          isOpen={modals.editMedicalHistory}
          onClose={() => closeModal("editMedicalHistory")}
          templateType={inferTemplateType(selectedMedicalHistory)}
          residentId={resident.id}
          initialData={selectedMedicalHistory}
          onSave={handleSaveMedicalHistory}
        />
      )}

      <CreateWellnessReportDialog
        isOpen={modals.createWellnessReport}
        onClose={() => closeModal("createWellnessReport")}
        residentId={residentProfile}
        onReportCreated={() => {
          refetchWellnessReports();
          closeModal("createWellnessReport");
        }}
      />
    </div>
  );
}
