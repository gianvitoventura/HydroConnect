import React from 'react';
import * as OBCF from "@thatopen/components-front";

export const setupProperties = (components, world, model) => {
  const highlighter = components.get(OBCF.Highlighter);
  highlighter.setup({ world });
  return highlighter;
};

const formatValue = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object' && value.value !== undefined) return value.value;
  return '-';
};

export const Properties = ({ element }) => {
  if (!element) return null;

  return (
    <div className="properties-panel absolute right-4 top-20 bg-white rounded-lg shadow-lg p-4 w-80">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
        {element.type || 'Element Properties'}
      </h3>
      
      <table className="w-full">
        <tbody>
          {Object.entries(element).map(([key, value]) => {
            if (key === 'type' || !value || value === '-') return null;
            
            return (
              <tr key={key} className="border-b border-gray-100">
                <td className="py-2 text-gray-600 font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </td>
                <td className="py-2 text-gray-800">
                  {formatValue(value)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};