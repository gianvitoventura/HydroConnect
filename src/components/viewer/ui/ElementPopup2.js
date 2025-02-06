const ElementPopup = ({ selectedElement, position, onClose, onZoomTo }) => {
  if (!selectedElement || !position) return null;

  return (
    <div 
      className="popup-content"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)', // Centra e posiziona sopra il punto
        marginTop: '-10px' // Offset per il puntatore
      }}
    >
      <h3>{selectedElement.type}</h3>
      <table className="plant-details">
        <tbody>
          <tr>
            <td>ID:</td>
            <td>{selectedElement.id}</td>
          </tr>
          <tr>
            <td>Nome:</td>
            <td>{selectedElement.name}</td>
          </tr>
          {selectedElement.Material && (
            <tr>
              <td>Materiale:</td>
              <td>{selectedElement.Material}</td>
            </tr>
          )}
          {selectedElement.Level && (
            <tr>
              <td>Livello:</td>
              <td>{selectedElement.Level}</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {selectedElement.description && (
        <div className="plant-description">
          {selectedElement.description}
        </div>
      )}
      
      <div className="popup-actions">
        <button 
          className="popup-button"
          onClick={onZoomTo}
        >
          Zoom
        </button>
      </div>
    </div>
  );
};

export default ElementPopup;