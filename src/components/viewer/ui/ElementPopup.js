import React from 'react';

const ElementPopup = ({ element, position, onClose }) => {
  if (!element || !position) return null;

  return (
    <div 
      className="popup-content"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)', 
      }}
    >
      <h3>{element.type || 'Element'}</h3>
      <table className="plant-details">
        <tbody>
          {Object.entries(element).map(([key, value]) => {
            if (key === 'type') return null;
            if (!value || value === '-') return null;
            
            return (
              <tr key={key}>
                <td>{key}:</td>
                <td>
                  {typeof value === 'object' ? 
                    JSON.stringify(value) : 
                    value.toString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ElementPopup;