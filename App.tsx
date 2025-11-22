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
  closestCorners,
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

        // If dropping over a container/form, add inside it at the end
        if (overData?.isContainer) {
             parentId = over.id as string;
             // Index undefined means append to end
        } else if (over.id === 'canvas-droppable') {
             parentId = null; // Root
             index = nodes.length;
        } else {
            // Dropping over a regular item - insert next to it
            const findParentAndIndex = (nodes: FormNode[], childId: string): { parentId: string | null, index: number } | null => {
                 for(const node of nodes) {
                    const idx = node.children.findIndex(c => c.id === childId);
                    if(idx !== -1) return { parentId: node.id, index: idx }; // Insert after: idx + 1, Insert before: idx
                    
                    const res = findParentAndIndex(node.children, childId);
                    if(res) return res;
                 }
                 return null;
            };

            // Check root level first
            const rootIdx = nodes.findIndex(n => n.id === over.id);
            if (rootIdx !== -1) {
                parentId = null;
                index = rootIdx + 1; // Insert after for sidebar drops usually feels better, or before.
            } else {
                // Check nested
                const res = findParentAndIndex(nodes, over.id as string);
                if (res) {
                    parentId = res.parentId;
                    index = res.index + 1; // Insert after
                }
            }
        }

        addNode(activeData.componentType, parentId, index);
        return;
    }

    // Scenario 2: Reordering / Moving Canvas Items
    if (activeData?.type === 'canvas-item') {
        if (active.id !== over.id) {
             // Store logic handles: 
             // - If over is Container -> Insert Inside
             // - If over is Leaf -> Insert Before
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
      collisionDetection={closestCorners}
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