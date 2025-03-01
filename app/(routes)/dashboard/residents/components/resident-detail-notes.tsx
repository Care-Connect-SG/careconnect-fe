import React from "react";

interface ResidentDetailsNotesCardProps {

  additionalNotes?: string;

}



const ResidentDetailsNotesCard: React.FC<ResidentDetailsNotesCardProps> = ({

  additionalNotes,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6 p-4 ml-10 bg-white shadow-md rounded-md" style={{width: "50%"}}>
      <h3 className="text-xl font-semibold mb-4">Additional Notes</h3>

        <div className="sm:col-span-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium"></span>{" "}
            {additionalNotes || "None"}
          </p>
        </div>
      
    </div>
  );
};

export default ResidentDetailsNotesCard;
