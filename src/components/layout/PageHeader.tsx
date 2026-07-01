import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-page-title text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-page-subtitle text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="mt-3 flex items-center gap-3 sm:mt-0">{actions}</div>}
    </div>
  );
}
