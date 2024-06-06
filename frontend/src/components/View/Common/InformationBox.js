const InformationBox = ({ elevation, heading }) => {
  if (isNaN(elevation) || elevation === 0) {
    elevation = '';
  } else {
    elevation = `Elevation: ${elevation.toFixed(1)}`;
  }

  if (isNaN(heading) || heading === 0) {
    heading = '';
  } else {
    heading = `Heading: ${heading.toFixed(1)}`;
  }

  if (elevation === '' && heading === '') {
    return (
      <div>
        <span></span>
      </div>
    );
  }

  return (
    <div>
      {elevation}, {heading}
    </div>
  );
};

export default InformationBox;
