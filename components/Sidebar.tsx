import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ComponentType } from '../types';
import { 
  Type, 
  LayoutTemplate, 
  CheckSquare, 
  Type as TypeIcon, 
  Image as ImageIcon, 
  MousePointerClick, 
  AlignLeft,
  Heading,
  BoxSelect,
  AppWindow,
  Folder
} from 'lucide-react';

interface SidebarItemProps {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ type, label, icon }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type: 'sidebar-item',
      componentType: type,
    },
  });

  const style = isDragging
    ? {
        opacity: 0.5,
        border: '2px dashed #3b82f6',
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-sm transition-all active:cursor-grabbing"
    >
      <div className="text-slate-600 mb-2">{icon}</div>
      <span className="text-xs font-medium text-slate-700 text-center">{label}</span>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <BoxSelect className="w-5 h-5 text-blue-600" />
          Components
        </h2>
        <p className="text-xs text-slate-500 mt-1">Drag items to the canvas</p>
      </div>

      <div className="p-4 space-y-6">
        
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Layout</h3>
          <div className="grid grid-cols-2 gap-3">
             <SidebarItem type={ComponentType.CONTAINER} label="Container" icon={<LayoutTemplate className="w-6 h-6"/>} />
             <SidebarItem type={ComponentType.FORM} label="Form" icon={<AppWindow className="w-6 h-6"/>} />
             <SidebarItem type={ComponentType.TABS} label="Tabs" icon={<Folder className="w-6 h-6"/>} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Form Controls</h3>
          <div className="grid grid-cols-2 gap-3">
            <SidebarItem type={ComponentType.INPUT} label="Input" icon={<Type className="w-6 h-6"/>} />
            <SidebarItem type={ComponentType.TEXTAREA} label="Text Area" icon={<AlignLeft className="w-6 h-6"/>} />
            <SidebarItem type={ComponentType.SELECT} label="Select" icon={<MousePointerClick className="w-6 h-6"/>} />
            <SidebarItem type={ComponentType.CHECKBOX} label="Checkbox" icon={<CheckSquare className="w-6 h-6"/>} />
            <SidebarItem type={ComponentType.BUTTON} label="Button" icon={<BoxSelect className="w-6 h-6"/>} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Display</h3>
          <div className="grid grid-cols-2 gap-3">
            <SidebarItem type={ComponentType.HEADER} label="Header" icon={<Heading className="w-6 h-6"/>} />
            <SidebarItem type={ComponentType.TEXT} label="Text" icon={<TypeIcon className="w-6 h-6"/>} />
            <SidebarItem type={ComponentType.IMAGE} label="Image" icon={<ImageIcon className="w-6 h-6"/>} />
          </div>
        </div>

      </div>
    </div>
  );
};