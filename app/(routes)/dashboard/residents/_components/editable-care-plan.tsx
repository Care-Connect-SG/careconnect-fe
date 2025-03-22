"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CarePlanRecord } from "@/types/careplan";
import { updateCarePlan, deleteCarePlan, createCarePlanWithEmptyValues } from "@/app/api/careplan";
import { XCircle, CheckCircle, Trash2, PlusCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CarePlanProps {
    careplan: CarePlanRecord | null;
    residentId: string;
    onCarePlanUpdated: (updatedCarePlan: CarePlanRecord | null) => void;
}

const EditableCarePlan: React.FC<CarePlanProps> = ({
    careplan,
    residentId,
    onCarePlanUpdated,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<CarePlanRecord | null>(careplan);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleToggle = (name: keyof CarePlanRecord) => {
        if (!formData) return;
        setFormData({ ...formData, [name]: !formData[name] });
    };

    const handleSave = async () => {
        if (!formData) return;
        const updatedCarePlan = await updateCarePlan(residentId, formData);
        if (updatedCarePlan) {
            onCarePlanUpdated(updatedCarePlan);
            setSuccessMessage("Changes successfully saved ✅");
            setTimeout(() => setSuccessMessage(null), 3000);
            setIsEditing(false);
        } else {
            setSuccessMessage("Failed to save changes ❌");
        }
    };

    const handleDeleteConfirm = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!formData) return;
        const result = await deleteCarePlan(residentId, formData.id);
        if (result.success) {
            onCarePlanUpdated(null);
            setSuccessMessage("Care Plan deleted successfully ✅");
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            setSuccessMessage("Failed to delete Care Plan ❌");
        }
    };

    const handleCreate = async () => {
        const newCarePlan = await createCarePlanWithEmptyValues(residentId);
        if (newCarePlan) {
            onCarePlanUpdated(newCarePlan);
            setSuccessMessage("New Care Plan created ✅");
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            setSuccessMessage("Failed to create Care Plan ❌");
        }
    };

    const formatDietaryRestrictions = (restrictions: string | undefined) => {
        if (!restrictions) return "None";
        return restrictions.split(",").map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <XCircle size={14} className="text-red-500" />
                {item.trim()}
            </div>
        ));
    };

    return (
        <Card className="border border-gray-200 shadow-md rounded-lg bg-white text-xs">
            <CardHeader className="px-6 py-4 border-b bg-blue-100">
                <CardTitle className="text-xl font-semibold text-gray-800">
                    Care Plan
                </CardTitle>
            </CardHeader>

            <CardContent className="px-6 py-4 space-y-4">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
                        <CheckCircle size={18} className="text-green-500" />
                        {successMessage}
                    </div>
                )}

                {/* Show either the form or Create Care Plan Button */}
                {formData ? (
                    <>
                        {/* Medical Appointment Care Plan */}
                        <div>
                            <h3 className="bg-blue-50 text-gray-800 font-semibold py-2 px-4 rounded-md text-base">
                                Medical Appointment Care Plan
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-700 px-4">
                                <label className="block font-semibold">Medical Conditions</label>
                                {isEditing ? (
                                    <Textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} />
                                ) : (
                                    <p>{formData.medical_conditions || "N/A"}</p>
                                )}
                                <label className="block font-semibold">Doctor Appointments</label>
                                {isEditing ? (
                                    <Textarea name="doctor_appointments" value={formData.doctor_appointments} onChange={handleChange} />
                                ) : (
                                    <p>{formData.doctor_appointments || "N/A"}</p>
                                )}
                            </div>
                        </div>

                        {/* Dietary Plan */}
                        <div>
                            <h3 className="bg-blue-50 text-gray-800 font-semibold py-2 px-4 rounded-md text-base">
                                Dietary Plan
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-700 px-4">
                                <label className="block font-semibold">Dietary Restrictions</label>
                                {isEditing ? (
                                    <Textarea name="dietary_restrictions" value={formData.dietary_restrictions} onChange={handleChange} />
                                ) : (
                                    <div className="ml-4">{formatDietaryRestrictions(formData.dietary_restrictions)}</div>
                                )}
                                <label className="block font-semibold">Daily Meal Plan</label>
                                {isEditing ? (
                                    <Textarea name="daily_meal_plan" value={formData.daily_meal_plan} onChange={handleChange} />
                                ) : (
                                    <p>{formData.daily_meal_plan || "No meal plan specified."}</p>
                                )}
                            </div>
                        </div>

                        {/* Assistance & Social Activities */}
                        <div>
                            <h3 className="bg-blue-50 text-gray-800 font-semibold py-2 px-4 rounded-md text-base">
                                Assistance & Social Activities
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-700 px-4">
                                <label className="block font-semibold">Hydration</label>
                                {isEditing ? (
                                    <Textarea name="hydration" value={formData.hydration} onChange={handleChange} />
                                ) : (
                                    <p>{formData.hydration || "N/A"}</p>
                                )}
                                <label className="block font-semibold">Nutritional Supplements</label>
                                {isEditing ? (
                                    <Textarea name="nutritional_supplements" value={formData.nutritional_supplements} onChange={handleChange} />
                                ) : (
                                    <p>{formData.nutritional_supplements || "N/A"}</p>
                                )}
                                <label className="block font-semibold">Bathing Assistance</label>
                                <Switch checked={formData.bathing_assistance} onCheckedChange={() => handleToggle("bathing_assistance")} />
                                <label className="block font-semibold">Dressing Assistance</label>
                                <Switch checked={formData.dressing_assistance} onCheckedChange={() => handleToggle("dressing_assistance")} />
                            </div>
                        </div>

                        {/* Edit/Save/Delete Buttons */}
                        <div className="mt-4 flex justify-between">
                            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
                                {isEditing ? "Cancel" : "Edit"}
                            </Button>
                            {isEditing && (
                                <Button onClick={handleSave} variant="default">
                                    Save Changes
                                </Button>
                            )}
                            <Button onClick={handleDeleteConfirm} variant="destructive">
                                <Trash2 size={16} className="mr-2" />
                                Delete Care Plan
                            </Button>
                        </div>
                    </>
                ) : (
                    <Button onClick={handleCreate} variant="default">
                        <PlusCircle size={16} className="mr-2" />
                        Create Care Plan
                    </Button>
                )}
            </CardContent>

            {/* Delete Confirmation Dialog */}
            {isDeleteConfirmOpen && (
                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <p>Are you sure you want to delete this care plan? This action cannot be undone.</p>
                        <DialogFooter className="flex justify-end mt-4">
                            <Button onClick={() => setIsDeleteConfirmOpen(false)} variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                handleDelete();
                                setIsDeleteConfirmOpen(false);
                            }}
                                variant="destructive"
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
};

export default EditableCarePlan;
