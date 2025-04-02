"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
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
import CreateMedication from "./_components/create-medication-dialog";
import EditCarePlan from "./_components/edit-careplan";
import EditMedicalHistoryModal from "./_components/edit-medical-history-dialog";
import EditMedication from "./_components/edit-medication";
import EditResidentDialog from "./_components/edit-resident-dialog";
import MedicalHistoryCard from "./_components/medical-history-card";
import CreateMedicalHistoryDialog from "./_components/medical-history-form";
import ResidentCarePlan from "./_components/resident-careplan";
import ResidentDetailsCard from "./_components/resident-detail-card";
import ResidentDetailsNotesCard from "./_components/resident-detail-notes";
import ResidentMedication from "./_components/resident-medication";
import ResidentProfileHeader from "./_components/resident-profile-header";
import CreateWellnessReportDialog from "./_components/create-wellness-report-dialog";
import WellnessReportsList from "./_components/wellness-reports-list";

import { useBreadcrumb } from "@/context/breadcrumb-context";
import { toTitleCase } from "@/lib/utils";
import { CarePlanRecord } from "@/types/careplan";
import { MedicalHistory, inferTemplateType } from "@/types/medical-history";
import { MedicationRecord } from "@/types/medication";
import { ResidentRecord } from "@/types/resident";
import { WellnessReportRecord } from "@/types/wellness-report";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Record History", value: "history" },
  { label: "Medication", value: "medication" },
  { label: "Care Plan", value: "careplan" },
  { label: "Wellness Report", value: "wellness" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ResidentDashboard() {
  const { residentProfile } = useParams() as { residentProfile: string };
  const { setPageName } = useBreadcrumb();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
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

  const { data: medicalHistory = [] } = useQuery<MedicalHistory[]>({
    queryKey: ["medicalHistory", residentProfile],
    queryFn: () => getMedicalHistoryByResident(residentProfile),
    enabled: !!residentProfile,
  });

  const { data: medications = [], refetch: refetchMedications } = useQuery<
    MedicationRecord[]
  >({
    queryKey: ["medications", residentProfile],
    queryFn: () => getMedicationsForResident(residentProfile),
    enabled: activeTab === "medication" && !!residentProfile,
  });

  const { data: carePlans = [], refetch: refetchCarePlans } = useQuery<
    CarePlanRecord[]
  >({
    queryKey: ["carePlans", residentProfile],
    queryFn: () => getCarePlansForResident(residentProfile),
    enabled: activeTab === "careplan" && !!residentProfile,
  });

  const { data: wellnessReports = [], refetch: refetchWellnessReports } =
    useQuery<WellnessReportRecord[]>({
      queryKey: ["wellnessReports", residentProfile],
      queryFn: () => getWellnessReportsForResident(residentProfile),
      enabled: activeTab === "wellness" && !!residentProfile,
    });

  const updateResidentMutation = useMutation({
    mutationFn: (updatedData: Partial<ResidentRecord>) =>
      updateResident(residentProfile, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });
      closeModal("editResident");
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

  const handleSaveAdditionalNotes = async (newNotes: string) => {
    if (!resident) return;

    try {
      await updateResident(resident.id, {
        ...resident,
        additional_notes: newNotes,
        additional_notes_timestamp: new Date().toISOString(),
      });
      queryClient.invalidateQueries({
        queryKey: ["resident", residentProfile],
      });
    } catch (error) {
      console.error("Error updating additional notes:", error);
    }
  };

  const handleCreateCarePlan = async () => {
    if (!residentProfile) return;

    setIsCreatingCarePlan(true);
    try {
      await createCarePlanWithEmptyValues(residentProfile);
      refetchCarePlans();
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

  if (isResidentLoading) {
    return <div className="text-center mt-10">Loading resident details...</div>;
  }

  if (!resident) {
    return (
      <div className="text-center mt-10 text-red-500">Resident not found</div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <ResidentProfileHeader
        resident={resident}
        onEdit={() => openModal("editResident")}
      />

      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              onClick={() => setActiveTab(tab.value)}
              className="px-4 py-2"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResidentDetailsCard
              gender={resident.gender}
              dateOfBirth={resident.date_of_birth}
              nricNumber={resident.nric_number}
              emergencyContactName={resident.emergency_contact_name}
              emergencyContactNumber={resident.emergency_contact_number}
              relationship={resident.relationship}
              primaryNurse={resident.primary_nurse || ""}
            />
            <ResidentDetailsNotesCard
              additionalNotes={resident.additional_notes || "None"}
              initialLastSaved={resident.additional_notes_timestamp}
              onSaveNotes={handleSaveAdditionalNotes}
            />
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Medical History</h2>
              <Button onClick={() => openModal("createMedicalHistory")}>
                Add Medical Record
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicalHistory.map((record) => (
                <MedicalHistoryCard
                  key={record.id}
                  record={record}
                  onEdit={() => openModal("editMedicalHistory", record)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "medication" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Medications</h2>
              <Button onClick={() => openModal("createMedication")}>
                Add Medication
              </Button>
            </div>
            <div className="space-y-4">
              {medications.map((medication) => (
                <ResidentMedication
                  key={medication.id}
                  medication={medication}
                  onEdit={() => openModal("editMedication", medication)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "careplan" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Care Plans</h2>
              <Button
                onClick={handleCreateCarePlan}
                disabled={isCreatingCarePlan}
              >
                Create Care Plan
              </Button>
            </div>
            {carePlans.map((carePlan) => (
              <ResidentCarePlan key={carePlan.id} careplan={carePlan} />
            ))}
          </div>
        )}

        {activeTab === "wellness" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Wellness Reports</h2>
              <Button onClick={() => openModal("createWellnessReport")}>
                Create Wellness Report
              </Button>
            </div>
            <WellnessReportsList
              reports={wellnessReports}
              residentId={residentProfile}
              onReportDeleted={refetchWellnessReports}
              onReportUpdated={refetchWellnessReports}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <EditResidentDialog
        isOpen={modals.editResident}
        onClose={() => closeModal("editResident")}
        initialData={resident}
        onSave={updateResidentMutation.mutate}
      />

      <CreateMedication
        isOpen={modals.createMedication}
        onClose={() => closeModal("createMedication")}
        residentId={residentProfile}
        onMedicationAdded={() => {
          refetchMedications();
          closeModal("createMedication");
        }}
      />

      {selectedMedication && (
        <EditMedication
          isOpen={modals.editMedication}
          onClose={() => closeModal("editMedication")}
          medication={selectedMedication}
          residentId={residentProfile}
          onMedicationUpdated={() => {
            refetchMedications();
            closeModal("editMedication");
          }}
        />
      )}

      <CreateMedicalHistoryDialog
        isOpen={modals.createMedicalHistory}
        onClose={() => closeModal("createMedicalHistory")}
        onRecordCreated={() => {
          queryClient.invalidateQueries({
            queryKey: ["medicalHistory", residentProfile],
          });
          closeModal("createMedicalHistory");
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
