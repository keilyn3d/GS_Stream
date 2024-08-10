const WebglModelSelector = ({ handleSubmit }) => {
  return (
    <div className="model-selector">
      <p>
        This is a placeholder for the WebGL model selector. The WebGL model
        selector will allow the user to select a model for rendering in the
        browser.
      </p>
      <p>
        <strong>
          Currently, only one model is available as a temporary option. The
          model is "RCH".
        </strong>
      </p>
      <form onSubmit={handleSubmit} className="form-action">
        <div className="selection-container">
          <select name="model" value="rch" disabled>
            <option value="rch">RCH</option>
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
