import { CSSProperties } from 'react';

export enum ComponentType {
  // Layout
  CONTAINER = 'container',
  FORM = 'form',
  TABS = 'tabs',
  TAB_ITEM = 'tab_item',
  
  // Form Controls
  INPUT = 'input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  BUTTON = 'button',
  
  // Display
  TEXT = 'text',
  IMAGE = 'image',
  HEADER = 'header'
}

export interface ComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: { label: string; value: string }[]; // For select
  src?: string; // For image
  alt?: string; // For image
  content?: string; // For text/header
  className?: string;
  style?: CSSProperties;
  buttonType?: 'submit' | 'button' | 'reset';
  
  // Layout props
  columns?: number;
  gap?: number;
}

export interface FormNode {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children: FormNode[];
}

export interface DragData {
  type: 'sidebar-item' | 'canvas-item';
  componentType?: ComponentType;
  id?: string;
  isContainer?: boolean;
}

export const DEFAULT_PROPS: Record<ComponentType, ComponentProps> = {
  [ComponentType.CONTAINER]: {
    style: { padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', minHeight: '100px' },
    columns: 1,
    gap: 16
  },
  [ComponentType.FORM]: {
    label: 'My Form',
    style: { padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', width: '100%', minHeight: '150px' },
    columns: 1,
    gap: 16
  },
  [ComponentType.TABS]: {
    style: { width: '100%', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }
  },
  [ComponentType.TAB_ITEM]: {
    label: 'Tab',
    style: { padding: '20px', minHeight: '100px' },
    columns: 1,
    gap: 16
  },
  [ComponentType.INPUT]: {
    label: 'Text Input',
    placeholder: 'Enter text here...',
    required: false,
  },
  [ComponentType.TEXTAREA]: {
    label: 'Text Area',
    placeholder: 'Enter long text here...',
    required: false,
  },
  [ComponentType.SELECT]: {
    label: 'Dropdown',
    required: false,
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ]
  },
  [ComponentType.CHECKBOX]: {
    label: 'Checkbox',
    required: false,
    content: 'I agree to terms'
  },
  [ComponentType.BUTTON]: {
    content: 'Submit',
    buttonType: 'submit',
    style: { backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '4px' }
  },
  [ComponentType.TEXT]: {
    content: 'This is a text block. You can edit this content.',
    style: { color: '#64748b', fontSize: '14px' }
  },
  [ComponentType.HEADER]: {
    content: 'Form Header',
    style: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }
  },
  [ComponentType.IMAGE]: {
    src: 'https://picsum.photos/400/200',
    alt: 'Placeholder Image',
    style: { borderRadius: '8px', width: '100%', height: 'auto', objectFit: 'cover' }
  }
};