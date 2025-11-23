import React from 'react';
import { ComponentType, ComponentProps, FormNode } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ElementRendererProps {
  type: ComponentType;
  props: ComponentProps;
  children?: React.ReactNode; // Support nested children
  node?: FormNode; // Access to node structure for tabs
  activeTabId?: string | null;
  onTabChange?: (id: string) => void;
}

// Helper for merging styles safely
const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const FormElementRenderer: React.FC<ElementRendererProps> = ({ 
    type, 
    props, 
    children,
    node,
    activeTabId,
    onTabChange
}) => {
  const { label, placeholder, required, style, content, options, src, alt, buttonType } = props;

  const baseLabelClass = "block text-sm font-medium text-slate-700 mb-1 pointer-events-none";
  const baseInputClass = "block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white pointer-events-none";

  switch (type) {
    case ComponentType.HEADER:
      return (
        <h2 className={cn("text-2xl font-bold text-slate-900 pointer-events-none", props.className)} style={style}>
          {content}
        </h2>
      );

    case ComponentType.TEXT:
      return (
        <p className={cn("text-slate-600 pointer-events-none", props.className)} style={style}>
          {content}
        </p>
      );

    case ComponentType.INPUT:
      return (
        <div style={style}>
          {label && (
            <label className={baseLabelClass}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <input
            type="text"
            className={baseInputClass}
            placeholder={placeholder}
            disabled
            readOnly // Read only in designer
          />
        </div>
      );

    case ComponentType.TEXTAREA:
      return (
        <div style={style}>
           {label && (
            <label className={baseLabelClass}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <textarea
            className={baseInputClass}
            placeholder={placeholder}
            rows={3}
            disabled
            readOnly
          />
        </div>
      );

    case ComponentType.SELECT:
        return (
            <div style={style}>
                {label && (
                <label className={baseLabelClass}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                )}
                <select className={baseInputClass} disabled>
                    <option value="">Select an option</option>
                    {options?.map((opt, idx) => (
                        <option key={idx} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        );

    case ComponentType.CHECKBOX:
        return (
            <div className="flex items-center h-5" style={style}>
                <input
                    id="checkbox-preview"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                    disabled
                />
                <div className="ml-3 text-sm">
                    <label htmlFor="checkbox-preview" className="font-medium text-slate-700 pointer-events-none">
                        {label}
                    </label>
                    {content && <p className="text-slate-500 pointer-events-none">{content}</p>}
                </div>
            </div>
        );

    case ComponentType.BUTTON:
        return (
            <button
                type={buttonType}
                className={cn(
                    "inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 pointer-events-none",
                    props.className
                )}
                style={style} // Use style from props which usually has background color
                disabled
            >
                {content}
            </button>
        );

    case ComponentType.IMAGE:
        return (
            <div className="w-full pointer-events-none" style={style}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={src} 
                    alt={alt || 'Image'} 
                    className="max-w-full h-auto rounded-lg border border-slate-200"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                    }}
                />
            </div>
        );
    
    case ComponentType.FORM:
        return (
            <div style={style} className={cn("shadow-sm", props.className)}>
                {label && (
                    <div className="mb-4 pb-2 border-b border-slate-100 pointer-events-none">
                        <h3 className="font-semibold text-lg text-slate-800">{label}</h3>
                    </div>
                )}
                 <div className="min-h-[50px]">
                    {children}
                    {(!children || (Array.isArray(children) && children.length === 0)) && (
                         <div className="text-slate-300 text-center py-4 text-sm italic pointer-events-none">
                             Drop components here
                         </div>
                    )}
                </div>
            </div>
        );
        
    case ComponentType.CONTAINER:
        return (
            <div style={style} className={cn("min-h-[50px]", props.className)}>
               {children}
               {(!children || (Array.isArray(children) && children.length === 0)) && (
                     <div className="text-slate-300 text-center py-4 text-sm italic pointer-events-none">
                         Container
                     </div>
                )}
            </div>
        );

    case ComponentType.TABS:
        return (
            <div style={style} className={cn("flex flex-col", props.className)}>
                {/* Tab Headers */}
                <div className="flex border-b border-slate-200 bg-slate-50/50 rounded-t-lg overflow-x-auto">
                    {node?.children.map((child) => (
                        <button
                            key={child.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabChange?.(child.id);
                            }}
                            className={cn(
                                "px-4 py-3 text-sm font-medium transition-colors focus:outline-none border-b-2 whitespace-nowrap",
                                activeTabId === child.id
                                    ? "border-blue-500 text-blue-600 bg-white"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                            )}
                        >
                            {child.props.label || 'Tab'}
                        </button>
                    ))}
                </div>
                {/* Tab Content Area */}
                <div className="p-1 min-h-[100px]">
                    {children}
                    {(!children || (Array.isArray(children) && children.length === 0)) && (
                        <div className="text-slate-300 text-center py-8 text-sm italic">
                            No tabs
                        </div>
                    )}
                </div>
            </div>
        );

    case ComponentType.TAB_ITEM:
        return (
            <div style={style} className={cn("h-full", props.className)}>
                {children}
                {(!children || (Array.isArray(children) && children.length === 0)) && (
                    <div className="text-slate-300 text-center py-12 text-sm italic border-2 border-dashed border-slate-100 rounded-lg">
                        Drop content for {label} here
                    </div>
                )}
            </div>
        );

    default:
      return <div className="text-red-500">Unknown Component: {type}</div>;
  }
};