import React, { useState } from 'react';
import { Button } from './Button';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ModelTree = ({ structure, selectedElement, onSelect }) => {
  const [expanded, setExpanded] = useState(new Set());

  const toggleNode = (id) => {
    const newExpanded = new Set(expanded);
    if (expanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const renderNode = (node) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedElement?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="ml-4">
        <div className="flex items-center gap-2 py-1">
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => toggleNode(node.id)}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          <div
            className={`cursor-pointer hover:text-blue-500 ${isSelected ? 'text-blue-500 font-medium' : ''}`}
            onClick={() => onSelect(node)}
          >
            {node.name || node.type}
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="border-l border-gray-200">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-sm">
      {structure ? structure.map(node => renderNode(node)) : 
        <p className="text-gray-500 text-center">No structure available</p>
      }
    </div>
  );
};

export default ModelTree;