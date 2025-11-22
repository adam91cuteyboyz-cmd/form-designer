import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDesignerStore } from '../store';
import { FormNode, ComponentType } from '../types';
import { FormElementRenderer } from './FormElements';
import { Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SortableNodeProps {
  node: FormNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const SortableNode: React.FC<SortableNodeProps> = ({ node, isSelected, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
      id: node.id, 
      data: { 
          type: 'canvas-item', 
          id: node.id,
          // Pass children info to help drag handling determine if this is a container
          isContainer: node.type === ComponentType.CONTAINER || node.type === ComponentType.FORM
      } 
  });

  const { removeNode, selectNode, selectedNodeId } = useDesignerStore();

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-40 bg-slate-100 border-2 border-blue-500 rounded-lg h-[80px] w-full my-2"
      />
    );
  }
  
  const isContainer = node.type === ComponentType.CONTAINER || node.type === ComponentType.FORM;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group relative my-3 rounded-lg border-2 transition-all bg-white hover:shadow-md cursor-grab active:cursor-grabbing",
        isSelected ? "border-blue-500 ring-1 ring-blue-500 z-10" : "border-transparent hover:border-blue-200",
        isOver && isContainer ? "ring-2 ring-blue-400 bg-blue-50/50" : ""
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      {...attributes}
      {...listeners}
      // Critical: Stop propagation to prevent dragging parent when interacting with child
      onMouseDown={(e) => {
          e.stopPropagation();
          listeners?.onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
          e.stopPropagation();
          listeners?.onTouchStart?.(e);
      }}
    >
      {/* Content */}
      <div className="p-4 relative">
        {/* For non-containers, overlay prevents interaction. For containers, we need to interact with children */}
        {!isContainer && <div className="absolute inset-0 z-[5]" />} 
        
        <FormElementRenderer type={node.type} props={node.props}>
            {isContainer && (
                <SortableContext items={node.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="min-h-[50px] w-full transition-colors rounded">
                        {node.children.map((child) => (
                             <SortableNode
                                key={child.id}
                                node={child}
                                isSelected={selectedNodeId === child.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectNode(child.id);
                                }}
                             />
                        ))}
                    </div>
                </SortableContext>
            )}
        </FormElementRenderer>
      </div>

      {/* Actions */}
      {isSelected && (
        <div 
            className="absolute -right-3 -top-3 bg-white rounded-full shadow border border-slate-200 z-20 cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking delete
            onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export const Canvas: React.FC = () => {
  const { nodes, selectedNodeId, selectNode } = useDesignerStore();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
    data: {
        type: 'canvas'
    }
  });

  return (
    <div
      className="flex-1 h-full bg-canvas overflow-y-auto p-8"
      onClick={() => selectNode(null)}
    >
      <div className="max-w-[800px] mx-auto">
        <div
          ref={setNodeRef}
          className={clsx(
            "min-h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border transition-colors p-8 pb-32",
            isOver ? "border-blue-400 bg-blue-50/30" : "border-slate-200"
          )}
        >
          {nodes.length === 0 && !isOver && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-lg font-medium">Canvas is empty</p>
              <p className="text-sm">Drag components from the left sidebar</p>
            </div>
          )}

          <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            {nodes.map((node) => (
              <SortableNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onClick={(e) => {
                    e.stopPropagation();
                    selectNode(node.id);
                }}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
};