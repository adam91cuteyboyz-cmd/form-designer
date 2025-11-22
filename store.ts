import { create } from 'zustand';
import { FormNode, ComponentType, DEFAULT_PROPS, ComponentProps } from './types';

interface DesignerState {
  nodes: FormNode[];
  selectedNodeId: string | null;
  
  // Actions
  addNode: (type: ComponentType, parentId: string | null, index?: number) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<FormNode> | Partial<ComponentProps>) => void;
  selectNode: (id: string | null) => void;
  moveNode: (activeId: string, overId: string) => void;
}

// Simple ID generator
const generateId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

// Helper to recursively add a node
const addNodeRecursively = (nodes: FormNode[], parentId: string | null, newNode: FormNode, index?: number): FormNode[] => {
  if (parentId === null) {
    const newNodes = [...nodes];
    if (index !== undefined && index >= 0) {
      newNodes.splice(index, 0, newNode);
    } else {
      newNodes.push(newNode);
    }
    return newNodes;
  }

  return nodes.map(node => {
    if (node.id === parentId) {
      const newChildren = [...node.children];
      if (index !== undefined && index >= 0) {
        newChildren.splice(index, 0, newNode);
      } else {
        newChildren.push(newNode);
      }
      return { ...node, children: newChildren };
    }
    if (node.children.length > 0) {
      return { ...node, children: addNodeRecursively(node.children, parentId, newNode, index) };
    }
    return node;
  });
};

// Helper to recursively remove a node
const removeNodeRecursively = (nodes: FormNode[], id: string): FormNode[] => {
  return nodes
    .filter(node => node.id !== id)
    .map(node => ({
      ...node,
      children: removeNodeRecursively(node.children, id)
    }));
};

// Helper to recursively update a node
const updateNodeRecursively = (nodes: FormNode[], id: string, updates: any): FormNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
       if ('props' in updates) {
         return { ...node, ...updates };
       }
       if ('type' in updates || 'id' in updates) {
          return { ...node, ...updates };
       }
       return { ...node, props: { ...node.props, ...updates } };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNodeRecursively(node.children, id, updates) };
    }
    return node;
  });
};

export const useDesignerStore = create<DesignerState>((set) => ({
  nodes: [],
  selectedNodeId: null,

  addNode: (type, parentId, index) => set((state) => {
    const newNode: FormNode = {
      id: generateId(),
      type,
      props: { ...DEFAULT_PROPS[type] },
      children: []
    };
    
    return { 
      nodes: addNodeRecursively(state.nodes, parentId, newNode, index),
      selectedNodeId: newNode.id 
    };
  }),

  removeNode: (id) => set((state) => ({
    nodes: removeNodeRecursively(state.nodes, id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
  })),

  updateNode: (id, updates) => set((state) => ({
    nodes: updateNodeRecursively(state.nodes, id, updates)
  })),

  selectNode: (id) => set({ selectedNodeId: id }),

  moveNode: (activeId, overId) => set((state) => {
    const cloneNodes = JSON.parse(JSON.stringify(state.nodes));
    
    // 1. Find and Remove active node
    let activeNode: FormNode | undefined;

    const findAndRemove = (nodes: FormNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === activeId) {
          activeNode = nodes[i];
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && findAndRemove(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };

    findAndRemove(cloneNodes);

    if (!activeNode) return { nodes: state.nodes };

    // 2. Find overId and Insert
    // Logic: 
    // - If overId is a CONTAINER/FORM, insert INSIDE (at end).
    // - If overId is a regular item, insert BEFORE it (sibling).
    // - If overId is 'root', push to root.

    if (overId === 'root' || overId === 'canvas-droppable') {
        cloneNodes.push(activeNode);
        return { nodes: cloneNodes };
    }

    const insert = (nodes: FormNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === overId) {
                const targetNode = nodes[i];
                
                // Check if target is a container
                if (targetNode.type === ComponentType.CONTAINER || targetNode.type === ComponentType.FORM) {
                    // Insert inside
                    targetNode.children.push(activeNode!);
                } else {
                    // Insert BEFORE sibling (allows inserting at index 0)
                    nodes.splice(i, 0, activeNode!);
                }
                return true;
            }
            
            if (nodes[i].children) {
                if (insert(nodes[i].children)) return true;
            }
        }
        return false;
    };

    if (!insert(cloneNodes)) {
        // Fallback: add to root if not found
        cloneNodes.push(activeNode);
    }

    return { nodes: cloneNodes };
  }),
}));