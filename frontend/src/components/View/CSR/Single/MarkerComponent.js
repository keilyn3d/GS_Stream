import React, { useState } from 'react';
import TextEditDialog from './TextEditDialog'; // Import the custom text edit dialog component

const MarkerComponent = ({
  markers,
  handleUpdateMarker,
  handleDeleteMarker,
}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  const handleEditMarker = (index) => {
    setEditIndex(index);
    setEditLabel(markers[index].label || `marker ${index + 1}`);
  };

  const handleSaveEdit = () => {
    if (editLabel !== null) {
      handleUpdateMarker(editIndex, {
        ...markers[editIndex],
        label: editLabel,
      });
    }
    setEditIndex(null);
    setEditLabel('');
  };

  return (
    <>
      {markers.map(
        (marker, index) =>
          marker.visible && (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${marker.screenPosition.x}px`,
                top: `${marker.screenPosition.y}px`,
                backgroundColor: 'transparent',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-100%',
                  left: '10px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: '5px',
                  borderRadius: '3px',
                  color: 'white',
                  width: 'max-content',
                  display: 'flex',
                  alignItems: 'center',
                  lineHeight: '1',
                }}
              >
                {marker.label || `marker ${index + 1}`}
                <img
                  src="/icons/edit.svg"
                  alt="Edit"
                  onClick={() => handleEditMarker(index)}
                  style={{ cursor: 'pointer', marginLeft: '5px' }}
                />
                <img
                  src="/icons/delete.svg"
                  alt="Delete"
                  onClick={() => handleDeleteMarker(index)}
                  style={{ cursor: 'pointer', marginLeft: '5px' }}
                />
              </div>
            </div>
          ),
      )}
      {editIndex !== null && (
        <TextEditDialog
          label={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onSave={handleSaveEdit}
          onCancel={() => setEditIndex(null)}
        />
      )}
    </>
  );
};

export default MarkerComponent;
