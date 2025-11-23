import React, { useEffect, useState } from 'react';
import { useDesignerStore } from '../store';
import { ComponentType, FormNode } from '../types';
import { Settings2, Type, AlignLeft, Palette, Layout, X, Image as ImageIcon, Grid } from 'lucide-react';

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 text-slate-800 font-medium text-sm mb-3 mt-6 border-b border-slate-100 pb-2">
        <span className="text-blue-500">{icon}</span>
        {title}
    </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

// Recursive helper to find node by ID
const findNodeById = (nodes: FormNode[], id: string): FormNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const PropertiesPanel: React.FC = () => {
  const { nodes, selectedNodeId, updateNode, selectNode } = useDesignerStore();
  
  // Use recursive search to find the selected node in the tree
  const selectedNode = selectedNodeId ? findNodeById(nodes, selectedNodeId) : undefined;

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 h-full">
        <Settings2 className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-center text-sm">Select a component on the canvas to configure its properties.</p>
      </div>
    );
  }

  // Helper to update nested props
  const handlePropChange = (key: string, value: any) => {
    updateNode(selectedNode.id, { [key]: value });
  };

  // Helper to update style props
  const handleStyleChange = (key: string, value: any) => {
    updateNode(selectedNode.id, {
        style: {
            ...selectedNode.props.style,
            [key]: value
        }
    });
  };

  const isContainer = [ComponentType.CONTAINER, ComponentType.FORM, ComponentType.TAB_ITEM].includes(selectedNode.type);

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-30">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            Properties
            </h2>
            <span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase">{selectedNode.type}</span>
        </div>
        <button onClick={() => selectNode(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Layout Settings for Containers */}
        {isContainer && (
            <>
                <SectionHeader title="Layout Settings" icon={<Grid className="w-4 h-4"/>} />
                
                <InputGroup label={`Grid Columns: ${selectedNode.props.columns || 1}`}>
                    <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        className="w-full accent-blue-500"
                        value={selectedNode.props.columns || 1}
                        onChange={(e) => handlePropChange('columns', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                    </div>
                </InputGroup>

                <InputGroup label="Grid Gap (px)">
                     <input
                        type="number"
                        min="0"
                        max="64"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedNode.props.gap || 16}
                        onChange={(e) => handlePropChange('gap', parseInt(e.target.value))}
                    />
                </InputGroup>
            </>
        )}

        {/* Common Text/Label Props */}
        {(selectedNode.props.label !== undefined || selectedNode.props.content !== undefined || selectedNode.props.placeholder !== undefined) && (
             <SectionHeader title="Content" icon={<Type className="w-4 h-4"/>} />
        )}

        {selectedNode.props.label !== undefined && (
          <InputGroup label="Label">
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedNode.props.label}
              onChange={(e) => handlePropChange('label', e.target.value)}
            />
          </InputGroup>
        )}

        {selectedNode.props.content !== undefined && (
          <InputGroup label={selectedNode.type === ComponentType.BUTTON ? "Button Text" : "Text Content"}>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedNode.props.content}
              onChange={(e) => handlePropChange('content', e.target.value)}
            />
          </InputGroup>
        )}

        {selectedNode.props.placeholder !== undefined && (
          <InputGroup label="Placeholder">
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedNode.props.placeholder}
              onChange={(e) => handlePropChange('placeholder', e.target.value)}
            />
          </InputGroup>
        )}

         {/* Specific: Image */}
         {selectedNode.type === ComponentType.IMAGE && (
             <>
                <SectionHeader title="Image Source" icon={<ImageIconWrapper />} />
                <InputGroup label="Image URL">
                    <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedNode.props.src || ''}
                    onChange={(e) => handlePropChange('src', e.target.value)}
                    />
                </InputGroup>
                <InputGroup label="Alt Text">
                    <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedNode.props.alt || ''}
                    onChange={(e) => handlePropChange('alt', e.target.value)}
                    />
                </InputGroup>
             </>
         )}

        {/* Specific: Options (Select) */}
        {selectedNode.type === ComponentType.SELECT && (
            <>
             <SectionHeader title="Options" icon={<AlignLeft className="w-4 h-4"/>} />
             <div className="space-y-2">
                 {selectedNode.props.options?.map((opt, idx) => (
                     <div key={idx} className="flex gap-2">
                         <input 
                            className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded" 
                            value={opt.label}
                            onChange={(e) => {
                                const newOptions = [...(selectedNode.props.options || [])];
                                newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                                handlePropChange('options', newOptions);
                            }}
                         />
                         <input 
                            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-slate-500" 
                            value={opt.value}
                             onChange={(e) => {
                                const newOptions = [...(selectedNode.props.options || [])];
                                newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                                handlePropChange('options', newOptions);
                            }}
                         />
                     </div>
                 ))}
                 <button 
                    className="text-xs text-blue-600 hover:underline mt-2"
                    onClick={() => {
                        const newOptions = [...(selectedNode.props.options || [])];
                        newOptions.push({ label: `Option ${newOptions.length + 1}`, value: `${newOptions.length + 1}` });
                        handlePropChange('options', newOptions);
                    }}
                 >
                     + Add Option
                 </button>
             </div>
            </>
        )}

        {/* Validation */}
        {selectedNode.props.required !== undefined && (
           <>
            <SectionHeader title="Validation" icon={<Layout className="w-4 h-4"/>} />
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-100">
                <span className="text-sm text-slate-600">Required Field</span>
                <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                checked={selectedNode.props.required}
                onChange={(e) => handlePropChange('required', e.target.checked)}
                />
            </div>
           </>
        )}

        {/* Styling */}
        <SectionHeader title="Appearance" icon={<Palette className="w-4 h-4"/>} />
        
        {/* Font Size for Text Components */}
        {(selectedNode.type === ComponentType.HEADER || selectedNode.type === ComponentType.TEXT) && (
             <InputGroup label="Font Size">
                <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                    value={selectedNode.props.style?.fontSize || ''}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                >
                    <option value="12px">Small</option>
                    <option value="14px">Normal</option>
                    <option value="16px">Medium</option>
                    <option value="20px">Large</option>
                    <option value="24px">Extra Large</option>
                    <option value="32px">Huge</option>
                </select>
             </InputGroup>
        )}

         {/* Colors for Button/Text */}
         {(selectedNode.type === ComponentType.BUTTON || selectedNode.type === ComponentType.HEADER || selectedNode.type === ComponentType.TEXT) && (
             <InputGroup label={selectedNode.type === ComponentType.BUTTON ? "Background Color" : "Text Color"}>
                 <div className="flex gap-2 flex-wrap">
                     {['#1e293b', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ffffff'].map(color => (
                         <button
                            key={color}
                            className={`w-6 h-6 rounded-full border border-slate-200 shadow-sm ${selectedNode.props.style?.[selectedNode.type === ComponentType.BUTTON ? 'backgroundColor' : 'color'] === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleStyleChange(selectedNode.type === ComponentType.BUTTON ? 'backgroundColor' : 'color', color)}
                         />
                     ))}
                 </div>
             </InputGroup>
         )}
         
         {/* Generic Padding */}
         <InputGroup label="Padding (Y-Axis)">
            <input
                type="range"
                min="0"
                max="64"
                className="w-full accent-blue-500"
                value={parseInt(selectedNode.props.style?.paddingTop as string || '0')}
                onChange={(e) => {
                    const val = `${e.target.value}px`;
                    updateNode(selectedNode.id, {
                        style: { ...selectedNode.props.style, paddingTop: val, paddingBottom: val }
                    });
                }}
            />
            <div className="text-right text-xs text-slate-400 mt-1">{selectedNode.props.style?.paddingTop || '0px'}</div>
         </InputGroup>

      </div>
    </div>
  );
};

// Small icon helper
const ImageIconWrapper = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);