"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

interface CarePlanProps {
    careplan: {
        medical_conditions?: string;
        doctor_appointments?: string;
        dietary_restrictions?: string;
        daily_meal_plan?: string;
        hydration?: string;
        nutritional_supplements?: string;
        bathing_assistance?: boolean;
        dressing_assistance?: boolean;
        required_assistance?: string;
        hobbies_interests?: string;
        social_interaction_plan?: string;
    };
}

const CarePlanDisplay: React.FC<CarePlanProps> = ({ careplan }) => {
    // Helper function for formatting dietary restrictions
    const formatDietaryRestrictions = (restrictions: string | undefined) => {
        if (!restrictions) return "None";
        return restrictions.split(",").map((item, index) => (
            <span key={index} className="flex items-center gap-1 text-sm text-gray-700">
                <XCircle size={14} className="text-red-500" /> {item.trim()}
            </span>
        ));
    };

    // Helper function for formatting meal plans
    const formatMealPlan = (mealPlan: string | undefined) => {
        if (!mealPlan) return "No meal plan specified.";
        const meals = mealPlan.split("\n");
        return (
            <div className="ml-4 text-sm text-gray-700">
                <p><strong>Breakfast:</strong> {meals[0] || "N/A"}</p>
                <p><strong>Lunch:</strong> {meals[1] || "N/A"}</p>
                <p><strong>Dinner:</strong> {meals[2] || "N/A"}</p>
            </div>
        );
    };

    return (
        <Card className="border border-gray-200 shadow-md rounded-lg bg-white text-xs">
            <CardHeader className="px-6 py-4 border-b bg-blue-100">
                <CardTitle className="text-xl font-semibold text-gray-800">
                    Care Plan
                </CardTitle>
            </CardHeader>

            <CardContent className="px-6 py-4 space-y-4">
                {/* Medical Appointments Section */}
                <div>
                    <h3 className="bg-blue-50 text-gray-800 font-semibold py-2 px-4 rounded-md text-base">
                        Medical Appointment Care Plan
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-700 px-4">
                        <p><strong>Medical Conditions:</strong> {careplan.medical_conditions || "N/A"}</p>
                        <p><strong>Doctor Appointments:</strong> {careplan.doctor_appointments || "N/A"}</p>
                    </div>
                </div>

                {/* Dietary Plan Section */}
                <div>
                    <h3 className="bg-blue-50 text-gray-800 font-semibold py-2 px-4 rounded-md text-base">
                        Dietary Plan
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-700 px-4">
                        <p><strong>Dietary Restrictions:</strong></p>
                        <div className="ml-4">{formatDietaryRestrictions(careplan.dietary_restrictions)}</div>
                        <p><strong>Daily Meal Plan:</strong></p>
                        <div>{formatMealPlan(careplan.daily_meal_plan)}</div>
                        <p><strong>Hydration:</strong> {careplan.hydration || "N/A"}</p>
                        <p><strong>Nutritional Supplements:</strong> {careplan.nutritional_supplements || "N/A"}</p>
                    </div>
                </div>

                {/* Daily Care Routine Section */}
                <div>
                    <h3 className="bg-blue-50 text-gray-800 font-semibold py-2 px-4 rounded-md text-base">
                        Daily Care Routine
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-700 px-4">
                        <p><strong>Bathing Assistance:</strong> {careplan.bathing_assistance ? "Yes" : "No"}</p>
                        <p><strong>Dressing Assistance:</strong> {careplan.dressing_assistance ? "Yes" : "No"}</p>
                        <p><strong>Required Assistance:</strong> {careplan.required_assistance || "N/A"}</p>
                    </div>
                </div>

                {/* Social & Recreational Activities */}
                <div>
                    <h3 className="bg-blue-50 text-gray-800 font-semibold py-2 px-4 rounded-md text-base">
                        Social & Recreational Activities
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-700 px-4">
                        <p><strong>Hobbies & Interests:</strong> {careplan.hobbies_interests || "N/A"}</p>
                        <p><strong>Social Interaction Plan:</strong> {careplan.social_interaction_plan || "N/A"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CarePlanDisplay;
