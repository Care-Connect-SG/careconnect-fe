"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";
import { useBreadcrumb } from "../context/breadcrumb-context";

const items = [
  { key: "home", label: "Home" },
  { key: "tasks", label: "Tasks" },
  { key: "residents", label: "Residents" },
  { key: "incidents", label: "Incident Reports" },
  { key: "announcements", label: "Announcements" },
  { key: "group", label: "Group" },
];

function BreadCrumbDashboard() {
  const { pageName } = useBreadcrumb();
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];
  const dynamicSegments = segments.slice(1);

  const breadcrumbItems = dynamicSegments.map((segment, index) => {
    const isLast = index === dynamicSegments.length - 1;
    const url = `/dashboard/${dynamicSegments.slice(0, index + 1).join("/")}`;
    let label = segment;

    if (index === 0) {
      const item = items.find((x) => x.key === segment);
      if (item) label = item.label;
    }

    if (isLast && pageName) {
      label = pageName;
    }
    return { url, label, isLast };
  });

  return (
    <Breadcrumb className="py-2 pl-2">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isLast ? (
                item.label
              ) : (
                <BreadcrumbLink href={item.url}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index !== breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadCrumbDashboard;
