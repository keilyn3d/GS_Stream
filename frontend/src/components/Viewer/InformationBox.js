const InformationBox = ({ elevation, heading }) => {
  if (elevation === 0 && heading === 0) {
    return (
      <div>
        <span></span>
      </div>
    );
  }
  return (
    <div>
      Elevation: {elevation.toFixed(1)}, Heading: {heading.toFixed(1)}
    </div>
  );
};

export default InformationBox;
