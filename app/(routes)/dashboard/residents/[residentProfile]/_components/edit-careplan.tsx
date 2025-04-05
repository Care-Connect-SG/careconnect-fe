"use client";

import {
  createCarePlanWithEmptyValues,
  deleteCarePlan,
  updateCarePlan,
} from "@/app/api/careplan";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CarePlanRecord } from "@/types/careplan";
import { Edit, MoreHorizontal, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";

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
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CarePlanRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (careplan) {
      setFormData(careplan);
    }
  }, [careplan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
    setIsSaving(true);
    try {
      const { id, ...rest } = formData;
      const updatedCarePlan = await updateCarePlan(residentId, { ...rest, id });

      if (!updatedCarePlan || !updatedCarePlan.id) {
        throw new Error("Update returned invalid data");
      }
      setFormData(updatedCarePlan);
      onCarePlanUpdated(updatedCarePlan);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Care plan has been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    setIsDeleting(true);
    try {
      const result = await deleteCarePlan(residentId, formData.id);
      if (result.success) {
        onCarePlanUpdated(null);
        setFormData(null);
        setIsDeleteDialogOpen(false);
        toast({
          title: "Success",
          description: "Care plan has been deleted successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to delete care plan");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete care plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newCarePlan = await createCarePlanWithEmptyValues(residentId);
      if (newCarePlan && newCarePlan.id) {
        setFormData(newCarePlan);
        onCarePlanUpdated(newCarePlan);

        toast({
          title: "Success",
          description: "New care plan has been created successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to create care plan");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create care plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatDietaryRestrictions = (restrictions: string | undefined) => {
    if (!restrictions || restrictions.trim() === "") return "None";
    return restrictions.split(",").map((item, index) => (
      <div
        key={index}
        className="flex items-center gap-2 text-sm text-gray-700 py-0.5"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
        {item.trim()}
      </div>
    ));
  };

  const renderField = (
    label: string,
    value: string | undefined,
    name: string,
    placeholder: string,
  ) => (
    <div>
      <Label className="block font-semibold mb-2 text-gray-500">{label}</Label>
      {isEditing ? (
        <Textarea
          name={name}
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full"
        />
      ) : (
        <p className="text-sm text-gray-700">{value || "None specified"}</p>
      )}
    </div>
  );

  return (
    <Card className="border">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold text-gray-800 flex justify-between items-center">
          <h2>Care Plan</h2>
          {formData && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-4">
        {formData ? (
          <>
            <div className="space-y-6 bg-gray-50 border rounded-xl p-6">
              <h2 className=" text-gray-800 font-bold mb-4 tracking-tight text-sm">
                MEDICAL INFORMATION
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {renderField(
                  "Medical Conditions",
                  formData.medical_conditions,
                  "medical_conditions",
                  "List any medical conditions",
                )}
                {renderField(
                  "Doctor Appointments",
                  formData.doctor_appointments,
                  "doctor_appointments",
                  "Enter upcoming doctor appointments",
                )}
              </div>
            </div>

            <div className="space-y-6 bg-gray-50 border rounded-xl p-6">
              <h2 className=" text-gray-800 font-bold mb-4 tracking-tight text-sm">
                DIETARY PLAN
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="block font-semibold mb-2 text-gray-500">
                    Dietary Restrictions
                  </Label>
                  {isEditing ? (
                    <Textarea
                      name="dietary_restrictions"
                      value={formData.dietary_restrictions || ""}
                      onChange={handleChange}
                      placeholder="List dietary restrictions (comma separated)"
                      className="w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-700">
                      {formatDietaryRestrictions(formData.dietary_restrictions)}
                    </div>
                  )}
                </div>
                {renderField(
                  "Daily Meal Plan",
                  formData.daily_meal_plan,
                  "daily_meal_plan",
                  "Describe daily meal plan",
                )}
              </div>
            </div>

            <div className="space-y-6 bg-gray-50 border rounded-xl p-6">
              <h2 className=" text-gray-800 font-bold mb-4 tracking-tight text-sm">
                ASSISSTANCE AND ACTIVITIES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField(
                  "Hydration",
                  formData.hydration,
                  "hydration",
                  "Hydration requirements",
                )}
                {renderField(
                  "Nutritional Supplements",
                  formData.nutritional_supplements,
                  "nutritional_supplements",
                  "List any supplements needed",
                )}
                <div className="flex items-center space-x-8">
                  <Label className="font-semibold text-gray-500">
                    Bathing Assistance
                  </Label>
                  <Switch
                    disabled={!isEditing}
                    checked={formData.bathing_assistance}
                    onCheckedChange={() =>
                      isEditing && handleToggle("bathing_assistance")
                    }
                  />
                </div>
                <div className="flex items-center space-x-8">
                  <Label className="font-semibold text-gray-500">
                    Dressing Assistance
                  </Label>
                  <Switch
                    disabled={!isEditing}
                    checked={formData.dressing_assistance}
                    onCheckedChange={() =>
                      isEditing && handleToggle("dressing_assistance")
                    }
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="gap-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="default"
                  className="gap-2 w-36"
                  disabled={isSaving}
                >
                  {isSaving ? <Spinner /> : "Save Changes"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-50 p-8 rounded-lg mb-6 w-full max-w-md">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                No Care Plan Found
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Create a new care plan to help manage the resident's daily needs
                and medical requirements.
              </p>
              <Button
                onClick={handleCreate}
                variant="default"
                className="gap-2 w-full"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Create New Care Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Care Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this care plan? This action cannot
              be undone and will remove all associated information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Care Plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EditableCarePlan;
