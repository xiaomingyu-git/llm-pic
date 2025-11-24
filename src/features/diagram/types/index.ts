/**
 * Diagram Feature Types
 * 图表功能相关类型定义
 */

export interface DiagramConfig {
  id: string;
  type: 'mermaid' | 'xml' | 'flowchart';
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MermaidConfig {
  theme: 'default' | 'forest' | 'dark' | 'neutral' | 'base';
  themeVariables?: Record<string, string>;
  flowchart?: {
    useMaxWidth: boolean;
    htmlLabels: boolean;
    curve: 'basis' | 'linear' | 'cardinal';
  };
  sequence?: {
    useMaxWidth: boolean;
    wrap: boolean;
    widthCorrection: number;
  };
}

export interface XMLDiagramOptions {
  layout: 'hierarchical' | 'organic' | 'force-directed';
  nodeStyle: {
    shape: string;
    color: string;
    borderColor: string;
    borderWidth: number;
  };
  edgeStyle: {
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface DiagramExportOptions {
  format: 'svg' | 'png' | 'pdf' | 'json';
  width?: number;
  height?: number;
  quality?: number;
  backgroundColor?: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: string;
  position?: { x: number; y: number };
  style?: Record<string, any>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  style?: Record<string, any>;
}

// XML Diagram 相关类型
export interface XMLNode {
  id: string;
  label: string;
  type: string;
  position?: { x: number; y: number };
  x?: number; // 直接坐标属性
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  attributes?: Record<string, any>;
  children?: XMLNode[];
}

export interface XMLEdge {
  id: string;
  source: string;
  target: string;
  from?: string; // 兼容性属性
  to?: string;
  label?: string;
  type?: string;
  color?: string;
  attributes?: Record<string, any>;
}

export interface XMLDiagramData {
  nodes: XMLNode[];
  edges: XMLEdge[];
  layout?: {
    type: string;
    options?: Record<string, any>;
  };
  metadata?: {
    [key: string]: any;
  };
}

// Mock DOM types (for XML processing)
export interface MockElement {
  tagName: string;
  attributes: Record<string, string>;
  children: MockElement[];
  textContent?: string;
  getElementsByTagName(tagName: string): MockElement[];
  querySelector(selector: string): MockElement | null;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null | undefined;
}

export interface MockDocument {
  createElement(tagName: string): MockElement;
  getElementsByTagName(tagName: string): MockElement[];
  querySelector(selector: string): MockElement | null;
  querySelectorAll(selector: string): MockElement[];
  documentElement: MockElement;
}

export interface MockDOMParser {
  new(): MockDOMParser;
  parseFromString(xmlString: string, mimeType: string): MockDocument;
}

export interface DiagramGenerationOptions {
  type: 'mermaid' | 'xml' | 'flowchart';
  style?: string;
  theme?: string;
  layout?: string;
  format: string; // 改为必需属性
  direction?: string;
  timeout?: number;
  maxTokens?: number;
  useColors?: boolean;
  includeDetails?: boolean;
  addIcons?: boolean;
  generateCode?: boolean;
}
