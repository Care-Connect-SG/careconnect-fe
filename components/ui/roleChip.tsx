import React from "react";

type RoleChipProps = {
  role: string;
};

const RoleChip: React.FC<RoleChipProps> = ({ role }) => {
  let roleColor = "";
  let textColor = "";

  switch (role) {
    case "Admin":
      roleColor = "bg-green-600 bg-opacity-20";
      textColor = "text-green-900";
      break;
    case "Nurse":
      roleColor = "bg-blue-600 bg-opacity-20";
      textColor = "text-blue-900";
      break;
    case "Family":
      roleColor = "bg-yellow-600 bg-opacity-20";
      textColor = "text-yellow-900";
      break;
    default:
      roleColor = "bg-gray-300 bg-opacity-70";
      textColor = "text-gray-900";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${roleColor} ${textColor}`}
    >
      {role}
    </span>
  );
};

export default RoleChip;
