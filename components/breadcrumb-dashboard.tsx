"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useBreadcrumb } from "../context/breadcrumb-context";

const items = [
  { key: "home", label: "Home" },
  { key: "tasks", label: "Tasks" },
  { key: "residents", label: "Residents" },
  { key: "groups", label: "Groups" },
  { key: "calendar", label: "Calendar" },
  { key: "incidents", label: "Incident Reporting" },
  { key: "nurses", label: "Nurses" },
  { key: "profile", label: "My Profile" },
];

function BreadCrumbDashboard() {
  const { pageName, setPageName } = useBreadcrumb();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = pathname?.split("/").filter(Boolean) || [];
  const dynamicSegments = segments.slice(1);

  useEffect(() => {
    setPageName(null);
  }, [pathname]);

  const filteredSegments =
    dynamicSegments[2] === "view"
      ? dynamicSegments.filter((segment, index) => index !== 3)
      : dynamicSegments;

  const breadcrumbItems = filteredSegments.map((segment, index) => {
    const isLast = index === filteredSegments.length - 1;
    const url = `/dashboard/${dynamicSegments.slice(0, index + 1).join("/")}`;
    let label = segment;

    if (index === 0) {
      const item = items.find((x) => x.key === segment);
      if (item) label = item.label;
    }
    if (index === 1 && segment === "view") {
      label = "Preview Report";
    }
    if (index === 1 && segment === "fill") {
      label = "Fill Report";
    }
    if (index === 1 && segment === "admin") {
      label = "Manage Forms";
    }
    if (index === 1 && segment === "form") {
      label = "Create Report";
    }

    if (index === 2 && segment === "build") {
      label = searchParams ? "Edit Form" : "Create Form";
    }
    if (index === 2 && segment === "view") {
      label = "Preview Form";
    }
    if (index === 2 && segment === "review") {
      label = "Review Reports";
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
