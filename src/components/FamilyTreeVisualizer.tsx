/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FamilyMember } from "../types";

interface Props {
  data: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  selectedId?: string;
  orientation?: 'horizontal' | 'vertical';
  siblingGap: number;
  subtreeGap: number;
  levelGap: number;
  interactionMode: 'pointer' | 'hand';
}

export default function FamilyTreeVisualizer({ 
  data, 
  onSelectMember, 
  selectedId, 
  orientation = 'horizontal',
  siblingGap,
  subtreeGap,
  levelGap,
  interactionMode
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<any>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = 1200;
    const height = 800;
    const margin = { top: 60, right: 120, bottom: 60, left: 120 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Disable pan if in pointer mode (optional, but hand tool usually implies explicit panning)
    // Actually, D3 usually allows both. Let's adjust cursor based on mode.
    svg.style("cursor", interactionMode === 'hand' ? "grab" : "default");

    const isVertical = orientation === 'vertical';

    const treeLayout = d3.tree<FamilyMember>()
      .nodeSize(isVertical ? [siblingGap * 50, levelGap * 100] : [siblingGap * 40, levelGap * 150])
      .separation((a, b) => {
        return (a.parent === b.parent ? 1.2 : subtreeGap);
      });

    const root = d3.hierarchy(data);
    treeLayout(root);

    // Custom Path Generator for "Elbow" style links
    const linkPath = (d: any) => {
      const startX = isVertical ? d.source.x : d.source.y;
      const startY = isVertical ? d.source.y : d.source.x;
      const endX = isVertical ? d.target.x : d.target.y;
      const endY = isVertical ? d.target.y : d.target.x;
      
      if (isVertical) {
        // Vertical step: down half, sideways, down remainder
        const midY = (startY + endY) / 2;
        return `M${startX},${startY} L${startX},${midY} L${endX},${midY} L${endX},${endY}`;
      } else {
        // Horizontal step: right half, up/down, right remainder
        const midX = (startX + endX) / 2;
        return `M${startX},${startY} L${midX},${startY} L${midX},${endY} L${endX},${endY}`;
      }
    };

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,2")
      .attr("d", linkPath);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => `node ${d.data.id === selectedId ? 'selected' : ''}`)
      .attr("transform", (d: any) => isVertical ? `translate(${d.x},${d.y})` : `translate(${d.y},${d.x})`)
      .style("cursor", interactionMode === 'pointer' ? "pointer" : "grab")
      .on("click", (event, d) => {
        if (interactionMode === 'pointer') {
          onSelectMember(d.data);
        }
      });

    node.append("circle")
      .attr("r", 5)
      .attr("fill", d => d.data.id === selectedId ? "#2563eb" : "#fff")
      .attr("stroke", d => d.data.id === selectedId ? "#1d4ed8" : "#2563eb")
      .attr("stroke-width", 1.5);

    // Marker (background for text)
    const labelGroups = node.append("g")
      .attr("class", "label-group");

    labelGroups.append("text")
      .attr("dy", isVertical ? "-1.5em" : ".31em")
      .attr("x", d => {
        if (isVertical) return 0;
        return d.children ? -12 : 12;
      })
      .attr("text-anchor", d => {
        if (isVertical) return "middle";
        return d.children ? "end" : "start";
      })
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", isVertical ? "10px" : "11px")
      .attr("font-weight", "800")
      .attr("fill", "#1e293b")
      .style("user-select", "none")
      .style("pointer-events", "none")
      .text(d => d.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "#f1f5f9")
      .attr("stroke-width", 5)
      .attr("stroke-linejoin", "round")
      .attr("opacity", 0.9);

  }, [data, selectedId, orientation, siblingGap, subtreeGap, levelGap, interactionMode]);

  return (
    <div id="family-tree-canvas" className={`w-full h-full bg-white overflow-hidden flex items-center justify-center print:bg-white`}>
      <svg ref={svgRef} className="w-full h-full bg-white" style={{ minHeight: '500px' }} />
    </div>
  );
}
