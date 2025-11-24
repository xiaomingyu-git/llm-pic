import type {
  XMLNode,
  XMLEdge,
  XMLDiagramData,
  MockElement,
  MockDocument,
  MockDOMParser,
} from '../types';

// 导入DOMParser用于XML解析
let DOMParser: MockDOMParser;

// 检查浏览器环境
if (typeof window !== 'undefined' && window.DOMParser) {
  DOMParser = window.DOMParser as any;
} else {
  // Node.js环境中的模拟DOMParser
  DOMParser = class {
    parseFromString(xmlString: string, _mimeType: string): MockDocument {
      // 简化的XML解析（仅用于示例目的）
      const parser = {
        parseFromString: (_str: string, _type: string) => {
          // 这里应该使用真正的XML解析库
          // 为了演示，我们创建一个简单的解析器
          const mockDocument: MockDocument = {
            querySelector: (selector: string) => {
              if (selector === 'parsererror') {
                return xmlString.includes('>')
                  ? null
                  : ({ nodeType: 1 } as any);
              }
              return null;
            },
            querySelectorAll: (_selector: string) => {
              const lines = xmlString.split('\n');
              const elements: MockElement[] = [];

              lines.forEach((line, index) => {
                if (
                  line.includes('<node') ||
                  line.includes('<component') ||
                  line.includes('<service') ||
                  line.includes('<database')
                ) {
                  const labelMatch = line.match(/>([^<]*?)</) || [
                    '',
                    line.match(/label="([^"]*?)"/)?.[1] || `节点${index + 1}`,
                  ];

                  elements.push({
                    getAttribute: (attr: string) => {
                      const match = line.match(
                        new RegExp(`${attr}="([^"]*?)"`)
                      );
                      return match ? match[1] : null;
                    },
                    textContent: labelMatch[1],
                    querySelector: () => null,
                    querySelectorAll: () => [],
                  });
                }
              });

              return elements;
            },
          };
          return mockDocument;
        },
      };
      return parser.parseFromString(xmlString, 'text/xml') as any;
    }
  } as any;
}

// XML架构图服务类
export class XMLDiagramService {
  /**
   * 解析XML字符串为架构图数据
   */
  static parseXML(xmlString: string): XMLDiagramData {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // 检查解析错误
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML解析错误：格式不正确');
      }

      // 解析节点
      const nodes: XMLNode[] = [];
      const nodeElements = xmlDoc.querySelectorAll(
        'node, component, service, database'
      );

      nodeElements.forEach((nodeElement: MockElement, index: number) => {
        const node: XMLNode = {
          id: nodeElement.getAttribute('id') || `node_${index}`,
          label:
            nodeElement.getAttribute('label') ||
            nodeElement.textContent ||
            `节点 ${index + 1}`,
          x: parseInt(nodeElement.getAttribute('x') || '0', 10),
          y: parseInt(
            nodeElement.getAttribute('y') || (index * 80).toString(),
            10
          ),
          width: parseInt(nodeElement.getAttribute('width') || '120', 10),
          height: parseInt(nodeElement.getAttribute('height') || '60', 10),
          type: (nodeElement.getAttribute('type') as any) || 'rectangle',
          color: nodeElement.getAttribute('color') || undefined,
        };
        nodes.push(node);
      });

      // 解析连接关系
      const edges: XMLEdge[] = [];
      const edgeElements = xmlDoc.querySelectorAll('edge, connection, link');

      edgeElements.forEach((edgeElement: MockElement) => {
        const edge: XMLEdge = {
          from: edgeElement.getAttribute('from') || '',
          to: edgeElement.getAttribute('to') || '',
          label: edgeElement.getAttribute('label') || undefined,
          type: (edgeElement.getAttribute('type') as any) || 'arrow',
          color: edgeElement.getAttribute('color') || undefined,
        };

        // 只有from和to都存在时才添加到edges数组
        if (edge.from && edge.to) {
          edges.push(edge);
        }
      });

      return {
        nodes,
        edges,
        metadata: {
          width: parseInt(
            xmlDoc.querySelector('diagram')?.getAttribute('width') || '800',
            10
          ),
          height: parseInt(
            xmlDoc.querySelector('diagram')?.getAttribute('height') || '600',
            10
          ),
        },
      };
    } catch (error) {
      console.error('XML解析失败:', error);
      throw new Error(
        `XML解析失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 将架构图数据渲染为HTML
   */
  static renderToHTML(diagram: XMLDiagramData): string {
    if (!diagram.nodes || diagram.nodes.length === 0) {
      return '<div class="xml-diagram-empty">暂无图表数据</div>';
    }

    // 计算图表边界
    const maxX = Math.max(
      ...diagram.nodes.map((node) => (node.x || 0) + (node.width || 120))
    );
    const maxY = Math.max(
      ...diagram.nodes.map((node) => (node.y || 0) + (node.height || 60))
    );

    // 创建SVG容器
    let svg = `<svg width="${maxX + 100}" height="${maxY + 100}" class="xml-diagram-svg" xmlns="http://www.w3.org/2000/svg">`;

    // 添加样式定义
    svg += this.getSVGStyles();

    // 绘制连接线
    diagram.edges.forEach((edge) => {
      const fromNode = diagram.nodes.find((n) => n.id === edge.from);
      const toNode = diagram.nodes.find((n) => n.id === edge.to);

      if (fromNode && toNode) {
        svg += this.createConnection(fromNode, toNode, edge);
      }
    });

    // 绘制节点
    diagram.nodes.forEach((node, index) => {
      svg += this.createNode(node, index);
    });

    svg += '</svg>';

    return svg;
  }

  /**
   * 创建SVG样式
   */
  private static getSVGStyles(): string {
    return `
      <defs>
        <style>
          .xml-node-rect { fill: #ffffff; stroke: #409eff; stroke-width: 2; rx: 8; }
          .xml-node-database { fill: #e1f3d8; stroke: #67c23a; stroke-width: 2; rx: 8; }
          .xml-node-server { fill: #fdf6ec; stroke: #e6a23c; stroke-width: 2; rx: 8; }
          .xml-node-client { fill: #f4f4f5; stroke: #909399; stroke-width: 2; rx: 8; }
          .xml-node-circle { fill: #ffffff; stroke: #409eff; stroke-width: 2; }
          .xml-node-text { font-family: Arial, sans-serif; font-size: 14px; fill: #333333; text-anchor: middle; }
          .xml-edge-line { stroke: #409eff; stroke-width: 2; fill: none; }
          .xml-edge-dashed { stroke: #409eff; stroke-width: 2; fill: none; stroke-dasharray: 5,5; }
          .xml-edge-text { font-family: Arial, sans-serif; font-size: 12px; fill: #666666; text-anchor: middle; }
          .xml-arrow { fill: #409eff; }
        </style>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" class="xml-arrow" />
        </marker>
      </defs>
    `;
  }

  /**
   * 创建节点SVG
   */
  private static createNode(node: XMLNode, index: number): string {
    const x = node.x || 0;
    const y = node.y || 0;
    const width = node.width || 120;
    const height = node.height || 60;
    const nodeId = `node-${index}`;

    let nodeElement = '';
    const shapeClass = this.getNodeShapeClass(node);
    const nodeStyle = this.getNodeStyle(node);

    // 使用形状类，如果指定了特殊类型
    if (node.type === 'circle') {
      const radius = Math.min(width, height) / 2;
      nodeElement += `<circle cx="${x + width / 2}" cy="${y + height / 2}" r="${radius}" class="${shapeClass}" style="${nodeStyle}"/>`;
    } else if (node.type === 'diamond') {
      const points = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`;
      nodeElement += `<polygon points="${points}" class="${shapeClass}" style="${nodeStyle}"/>`;
    } else {
      nodeElement += `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="${shapeClass}" style="${nodeStyle}"/>`;
    }

    // 添加文本
    const textY = y + height / 2 + 5;
    nodeElement += `<text x="${x + width / 2}" y="${textY}" class="xml-node-text" id="${nodeId}">${this.escapeHtml(node.label)}</text>`;

    return nodeElement;
  }

  /**
   * 获取节点形状类
   */
  private static getNodeShapeClass(node: XMLNode): string {
    switch (node.type) {
      case 'database':
        return 'xml-node-database';
      case 'server':
        return 'xml-node-server';
      case 'client':
        return 'xml-node-client';
      case 'circle':
        return 'xml-node-circle';
      default:
        return 'xml-node-rect';
    }
  }

  /**
   * 获取节点样式
   */
  private static getNodeStyle(node: XMLNode): string {
    const styles: string[] = [];

    if (node.color) {
      styles.push(`fill: ${node.color}`);
    }

    return styles.join('; ');
  }

  /**
   * 创建连接线SVG
   */
  private static createConnection(
    fromNode: XMLNode,
    toNode: XMLNode,
    edge: XMLEdge
  ): string {
    const fromX = fromNode.x || 0;
    const fromY = fromNode.y || 0;
    const fromWidth = fromNode.width || 120;
    const fromHeight = fromNode.height || 60;
    const toX = toNode.x || 0;
    const toY = toNode.y || 0;
    const toWidth = toNode.width || 120;
    const toHeight = toNode.height || 60;

    // 计算节点中心点
    const fromCenterX = fromX + fromWidth / 2;
    const fromCenterY = fromY + fromHeight / 2;
    const toCenterX = toX + toWidth / 2;
    const toCenterY = toY + toHeight / 2;

    // 创建连接线路径
    const pathClass =
      edge.type === 'dashed' ? 'xml-edge-dashed' : 'xml-edge-line';
    const pathColor = edge.color || '#409eff';

    let connection = `<path d="M ${fromCenterX} ${fromCenterY} L ${toCenterX} ${toCenterY}" class="${pathClass}" stroke="${pathColor}" marker-end="url(#arrowhead)"/>`;

    // 添加连接标签
    if (edge.label) {
      const midX = (fromCenterX + toCenterX) / 2;
      const midY = (fromCenterY + toCenterY) / 2;
      connection += `<text x="${midX}" y="${midY - 5}" class="xml-edge-text">${this.escapeHtml(edge.label)}</text>`;
    }

    return connection;
  }

  /**
   * HTML转义
   */
  private static escapeHtml(text: string): string {
    if (typeof document !== 'undefined') {
      // 浏览器环境
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    } else {
      // Node.js环境
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  /**
   * 创建示例XML架构图
   */
  static createExampleXML(): string {
    return `
<diagram width="800" height="600">
  <nodes>
    <node id="frontend" label="前端应用" x="100" y="100" width="120" height="60" type="rectangle" color="#e1f5fe"/>
    <node id="backend" label="后端服务" x="400" y="100" width="120" height="60" type="rectangle" color="#f3e5f5"/>
    <node id="database" label="数据库" x="400" y="300" width="120" height="60" type="database" color="#e8f5e8"/>
    <node id="cache" label="缓存" x="100" y="300" width="120" height="60" type="rectangle" color="#fff3e0"/>
  </nodes>
  <edges>
    <edge from="frontend" to="backend" label="HTTP请求" type="arrow"/>
    <edge from="backend" to="database" label="查询" type="arrow"/>
    <edge from="backend" to="cache" label="缓存查询" type="dashed"/>
    <edge from="frontend" to="cache" label="状态获取" type="arrow"/>
  </edges>
</diagram>
    `.trim();
  }
}

// 导出服务实例
export const xmlDiagramService = XMLDiagramService;
