"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { useBreadcrumb } from "../context/breadcrumb-context";

const items = [
  { key: "home", label: "Home" },
  { key: "tasks", label: "Tasks" },
  { key: "residents", label: "Residents" },
  { key: "form", label: "Incident Management" },
  { key: "announcements", label: "Announcements" },
  { key: "group", label: "Group" },
];

function BreadCrumbDashboard() {
  const { pageName, setPageName } = useBreadcrumb();
  const pathname = usePathname();
  let segments = pathname?.split("/").filter(Boolean) || [];
  const dynamicSegments = segments.slice(1);

  useEffect(() => {
    setPageName(null);
  }, [pathname, setPageName]);

  const breadcrumbItems = dynamicSegments.map((segment, index) => {
    const isLast = index === dynamicSegments.length - 1;
    let url = `/dashboard/${dynamicSegments.slice(0, index + 1).join("/")}`;
    let label = segment;

    if (index === 0) {
      const item = items.find((x) => x.key === segment);
      if (item) label = item.label;
    }

    if (index === 1 && segment === "view") {
      label = "Preview Form";
      url = "/dashboard/form";
    }

    if (pathname.startsWith("/dashboard/form/view/") && isLast) {
      label = "Preview Form";
    }

    if (index === 1 && segment === "build") {
      label = "Edit Form";
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
