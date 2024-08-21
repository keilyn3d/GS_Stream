import React from 'react';

const SsrModelSelector = ({
  selectedModelId,
  setSelectedModelId,
  setSelectedModelName,
  selectedModelIdForComparison,
  setSelectedModelIdForComparison,
  setSelectedModelNameForComparison,
  allModels,
  handleSubmit,
}) => {
  const handleModelChange = (setterId, setterName) => (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    const selectedValue = e.target.value;
    const selectedText = e.target.options[selectedIndex].text;

    setterId(selectedValue);
    setterName(selectedText);
  };

  return (
    <div className="model-selector">
      <p>
        If you select one model, you will go to the single view, and if you
        select two models, you will go to the dual view.
      </p>
      <form onSubmit={handleSubmit} className="form-action">
        <div className="selection-container">
          <select
            name="model"
            value={selectedModelId}
            onChange={handleModelChange(
              setSelectedModelId,
              setSelectedModelName,
            )}
          >
            <option value="">Please select a model</option>

            {allModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
              </option>
            ))}
          </select>

          <select
            name="model-for-comparison"
            value={selectedModelIdForComparison}
            onChange={handleModelChange(
              setSelectedModelIdForComparison,
              setSelectedModelNameForComparison,
            )}
            disabled={!selectedModelId}
          >
            <option value="">Please select a model</option>

            {allModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
              </option>
            ))}
          </select>
          <button type="submit" name="connect">
            Connect
          </button>
        </div>
      </form>
    </div>
  );
};

export default SsrModelSelector;
