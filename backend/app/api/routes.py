from flask import Blueprint, jsonify, send_file, request
from ..model_config.model_config_fetcher import ModelManager

model_manager = ModelManager()

api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/model_ids', methods=['GET'])
def get_model_ids():
    model_ids_and_names = model_manager.get_model_ids_and_names()
    response = [{'id': id, 'model_name': name} for id, name in model_ids_and_names]
    return jsonify(response)


@api_blueprint.route('/models/<model_id>/config', methods=['GET'])
def get_initial_data(model_id):
    model_manager.set_model(model_id)
    initial_data = model_manager.get_model_config_data(model_id)
    return jsonify(initial_data)


@api_blueprint.route('/models/configs', methods=['GET'])
def get_multiple_model_data():
    model_ids = request.args.get('ids')

    if not model_ids:
        return jsonify({'error': 'No model IDs provided'}), 400

    model_ids = model_ids.split(',')

    results = []
    for model_id in model_ids:
        model_manager.set_model(model_id)

        model_data = model_manager.get_model_config_data(model_id)
        if model_data:
            results.append(model_data)
        else:
            results.append({'model_id': model_id, 'error': 'Data not found'})

    return jsonify(results)

@api_blueprint.route('/models/splat/rch', methods=['GET'])
def get_splat_model_data():
    import os
    splat_model_repo_path = os.environ.get('GS_SPLAT_MODEL_REPO_PATH')
    file_path = splat_model_repo_path + "rch.splat"
    
    if splat_model_repo_path == "/your/path/to/splat-model-repo":
        print ("!!!!!!!!!!!!!!!!!!!!!! Please set GS_SPLAT_MODEL_REPO_PATH environment variable !!!!!!!!!!!!!!!!!!!!!")
        return "Please set GS_SPLAT_MODEL_REPO_PATH environment variable", 404
    
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return "File not found", 404
