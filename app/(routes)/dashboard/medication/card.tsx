import * as React from "react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`rounded-lg shadow-md p-4 bg-white ${className}`}>{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className="border-b pb-2 mb-2">{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="text-gray-700">{children}</div>;
}
