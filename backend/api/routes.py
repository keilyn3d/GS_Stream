from flask import Blueprint, jsonify
from .fetch_data_module import fetch_initial_data  


api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/codes', methods=['GET'])
def get_model_ids():
    model_ids = ['model1', 'model2', 'model3', 'model4']  
    return jsonify(model_ids)


@api_blueprint.route('/models/<model_id>/config', methods=['GET'])
def get_initial_data(model_id):
    initial_data = fetch_initial_data(model_id)
    return jsonify(initial_data)
