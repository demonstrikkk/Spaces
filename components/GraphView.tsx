import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Node } from '../types';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface GraphViewProps {
  nodes: Node[];
  onNodeClick?: (nodeId: string) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ nodes, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  // Re-run simulation when nodes change
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Prepare data
    // Create links based on shared tags
    const links: any[] = [];
    nodes.forEach((source, i) => {
      nodes.forEach((target, j) => {
        if (i < j) {
          const sharedTags = source.tags.filter(t => target.tags.includes(t));
          if (sharedTags.length > 0) {
            links.push({ source: source.id, target: target.id, weight: sharedTags.length });
          }
        }
      });
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Zoom behavior
    const g = svg.append("g");
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

    // Draw Links
    const link = g.append("g")
      .attr("stroke", "#ffffff")
      .attr("stroke-opacity", 0.1)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.weight));

    // Draw Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Node Circles
    node.append("circle")
      .attr("r", 20)
      .attr("fill", "#1e293b") // Slate-800
      .attr("stroke", (d: any) => getColorForType(d.type))
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-all hover:brightness-125")
      .on("click", (_event, d: any) => onNodeClick && onNodeClick(d.id));

    // Icons (using Emoji as simpler placeholder for D3)
    node.append("text")
      .text((d: any) => getIconForType(d.type))
      .attr("x", 0)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .style("pointer-events", "none");

    // Labels
    node.append("text")
      .text((d: any) => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title)
      .attr("x", 25)
      .attr("y", 5)
      .attr("fill", "#94a3b8")
      .style("font-size", "10px")
      .style("pointer-events", "none")
      .attr("opacity", 0.7);

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag handlers
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [nodes, onNodeClick]);

  const getColorForType = (type: string) => {
    const colors: any = {
      'NOTE': '#6366f1', // Indigo
      'ARTICLE': '#3b82f6', // Blue
      'VIDEO': '#e11d48', // Rose
      'IMAGE': '#a855f7', // Purple
      'TWEET': '#0ea5e9', // Sky
    };
    return colors[type] || '#64748b';
  };

  const getIconForType = (type: string) => {
    const icons: any = {
      'NOTE': '📝',
      'ARTICLE': '📄',
      'VIDEO': '🎬',
      'IMAGE': '🖼️',
      'TWEET': '🐦',
    };
    return icons[type] || '📌';
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-white/5">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-slate-900/80 backdrop-blur border border-white/10 p-2 rounded-xl">
        <button className="p-2 hover:bg-white/10 rounded-lg text-white">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-lg text-white">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-lg text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 left-4 p-2 bg-slate-900/50 backdrop-blur rounded-lg text-xs text-slate-400 border border-white/5">
        {nodes.length} nodes • Auto-clustered by tags
      </div>
    </div>
  );
};

export default GraphView;
