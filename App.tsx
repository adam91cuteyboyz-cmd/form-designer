import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DropAnimation,
  DragOverEvent,
} from '@dnd-kit/core';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useDesignerStore } from './store';
import { ComponentType, DragData, FormNode } from './types';
import { Eye, Save } from 'lucide-react';

// Drop animation config for smoother UX
// Disable duration to remove rebound effect
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
  duration: 0, 
};

// Helper to find a node in the tree
const findNode = (nodes: FormNode[], id: string): FormNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

function App() {
  const { addNode, moveNode, nodes } = useDesignerStore();
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // 10px movement before drag starts prevents accidental clicks
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragData(active.data.current as DragData);
  };

  const handleDragOver = (event: DragOverEvent) => {
      // Can be used for drag preview highlights
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset drag state
    setActiveDragData(null);

    if (!over) return;

    const activeData = active.data.current as DragData;
    const overData = over.data.current;

    // Scenario 1: Dropping Sidebar Item
    if (activeData?.type === 'sidebar-item' && activeData.componentType) {
        
        let parentId: string | null = null;
        let index: number | undefined = undefined;

        // If dropping over a container/form, add inside it
        if (overData?.isContainer) {
             parentId = over.id as string;
             // Index undefined means append to end
        } else if (over.id === 'canvas-droppable') {
             parentId = null; // Root
             index = nodes.length;
        } else {
            // Dropping over a regular item - add sibling
            // We don't easily know the parent of 'over', so we let a hypothetical store action handle it?
            // Current addNode requires strict parentId.
            // Simplification for sidebar drops:
            // If over a non-container item, find its parent.
            // This is computationally expensive to find parent here without store support.
            // For now, sidebar drops default to Root or Container (if dropped on container).
            // If dropped on a leaf node, we can try to find that node in the tree to get its parent.
            const findParent = (nodes: FormNode[], childId: string): string | null => {
                for(const node of nodes) {
                    if(node.children.some(c => c.id === childId)) return node.id;
                    const res = findParent(node.children, childId);
                    if(res) return res;
                }
                return null;
            };
            
            const pId = findParent(nodes, over.id as string);
            if(pId) parentId = pId; // Found parent container
        }

        addNode(activeData.componentType, parentId, index);
        return;
    }

    // Scenario 2: Reordering / Moving Canvas Items
    if (activeData?.type === 'canvas-item') {
        if (active.id !== over.id) {
             // Store logic handles: 
             // - If over is Container -> Insert Inside
             // - If over is Leaf -> Insert After
             moveNode(active.id as string, over.id as string);
        }
    }
  };

  const saveForm = () => {
      const json = JSON.stringify(nodes, null, 2);
      console.log('Saving form schema:', json);
      alert('Form schema saved to console!');
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                FC
            </div>
            <h1 className="text-lg font-bold text-slate-800">FormCraft <span className="text-slate-400 font-normal">Pro</span></h1>
          </div>
          <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${showPreview ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Edit Mode' : 'Preview'}
              </button>
              <button 
                onClick={saveForm}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
              >
                  <Save className="w-4 h-4" />
                  Save
              </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar */}
            {!showPreview && (
                <div className="h-full z-10 shadow-lg shadow-slate-200/50">
                    <Sidebar />
                </div>
            )}

            {/* Canvas */}
            <main className="flex-1 h-full relative flex flex-col">
                <Canvas />
            </main>

            {/* Properties Panel */}
            {!showPreview && (
                 <div className="h-full z-10">
                    <PropertiesPanel />
                </div>
            )}
        </div>

        {/* Drag Overlay - Visual feedback during drag */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragData?.type === 'sidebar-item' && activeDragData.componentType ? (
             <div className="w-[200px] bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500 opacity-90 cursor-grabbing">
                 <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">Adding {activeDragData.componentType}</span>
                 </div>
             </div>
          ) : null}
          {activeDragData?.type === 'canvas-item' ? (
              <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500 opacity-90 cursor-grabbing w-[300px]">
                  Moving component...
              </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}

export default App;