import { useEffect, useState } from 'react';

const WebglModelSelector = ({ handleSubmit }) => {
  const backendAddress = process.env.REACT_APP_CSR_BACKEND_URL;

  const [splatModels, setSplatModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModelForComparison, setSelectedModelForComparison] =
    useState('');

  const handleChange = (setter) => (event) => {
    const modelId = event.target.value;
    setter(modelId);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (selectedModelForComparison) {
      handleSubmit(selectedModel, selectedModelForComparison);
      console.log('Selected Model:', selectedModel);
      console.log('Selected Model for Comparison:', selectedModelForComparison);
    } else {
      handleSubmit(selectedModel);
      console.log('Selected Model:', selectedModel);
    }
  };

  useEffect(() => {
    fetch(backendAddress + '/api/models/splat/list')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setSplatModels(data);
      })
      .catch((error) => {
        console.error('Fetching data failed', error);
      });
  }, [backendAddress]);

  return (
    <div className="model-selector">
      <p>
        This is a placeholder for the WebGL model selector. The WebGL model
        selector will allow the user to select a model for rendering in the
        browser.
      </p>
      <p>
        <strong>
          Currently, only three models are available as a temporary option:{' '}
        </strong>
        st_comb/st_1, st_comb/st_2, RCH
      </p>
      <form onSubmit={onSubmit} className="form-action">
        <div className="selection-container">
          <select
            name="model"
            value={selectedModel}
            onChange={handleChange(setSelectedModel)}
          >
            <option value="">Please select a model</option>
            {splatModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <select
            name="model-for-comparison"
            value={selectedModelForComparison}
            onChange={handleChange(setSelectedModelForComparison)}
            disabled={!selectedModel}
          >
            <option value="">Please select a model</option>
            {splatModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
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

export default WebglModelSelector;
