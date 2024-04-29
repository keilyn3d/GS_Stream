from flask import Blueprint, jsonify, request
from ..model_config.model_config_fetcher import get_model_config_data
from ..model_config.model_config_fetcher import get_model_ids_and_names
from ..model_config.model_config_fetcher import set_model

api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/codes', methods=['GET'])
def get_model_ids():
    model_ids_and_names = get_model_ids_and_names()
    reseponse = [{'id': id, 'model_name': name} for id, name in model_ids_and_names]
    return jsonify(reseponse)


@api_blueprint.route('/models/<model_id>/config', methods=['GET'])
def get_initial_data(model_id):
    set_model(model_id)
    initial_data = get_model_config_data(model_id)
    return jsonify(initial_data)

@api_blueprint.route('/models/configs', methods=['GET'])
def get_multiple_model_data():
    model_ids = request.args.get('ids')

    if not model_ids:
        return jsonify({'error': 'No model IDs provided'}), 400

    model_ids = model_ids.split(',')

    results = []
    for model_id in model_ids:
        set_model(model_id)

        model_data = get_model_config_data(model_id)
        if model_data:
            results.append(model_data)
        else:
            results.append({'model_id': model_id, 'error': 'Data not found'})

    return jsonify(results)