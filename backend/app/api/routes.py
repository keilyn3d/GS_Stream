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


# Temporary code to serve splat models
splat_models = [
    {"id": "101", "name": "st_comb/st_1", "file": "st_1.splat"},
    {"id": "102", "name": "st_comb/st_2", "file": "st_2.splat"},
    {"id": "103", "name": "RCH", "file": "rch.splat"}
]

@api_blueprint.route('/models/splat/list', methods=['GET'])
def get_splat_models_list():
    return jsonify(splat_models)


@api_blueprint.route('/models/splat/<splat_model_id>', methods=['GET'])
def get_splat_model_data(splat_model_id):
    import os
    SPLAT_MODELS_DIRECTORY = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'splat_models'
    ) + os.sep    
    model_file = next((model["file"] for model in splat_models if model["id"] == splat_model_id), None)
    if model_file is None:
        return "Model not found", 404
    
    file_path = SPLAT_MODELS_DIRECTORY + model_file
    
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return "File not found", 404
