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
      Elevation: {elevation}, Heading: {heading}
    </div>
  );
};

export default InformationBox;
