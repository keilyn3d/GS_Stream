from flask import Blueprint, jsonify
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
    # initial_data = model.get_model_config_data()
    initial_data = get_model_config_data(model_id)
    return jsonify(initial_data)
