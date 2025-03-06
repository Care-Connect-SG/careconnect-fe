export interface CarePlanRecord {
    id: string; // Unique identifier for the care plan
    resident_id: string; // The resident this care plan belongs to
    created_date: string; // ISO date string format (e.g., "2025-03-06")

    // Medical Information
    medical_conditions: string;
    doctor_appointments: string;

    // Dietary Plan
    dietary_restrictions: string;
    daily_meal_plan: string;
    hydration: string;
    nutritional_supplements: string;

    // Daily Care Routine
    bathing_assistance: boolean;
    dressing_assistance: boolean;
    required_assistance: string; // e.g., "Walker, Wheelchair, Cane"

    // Social & Recreational Activities
    hobbies_interests: string;
    social_interaction_plan: string;
}
