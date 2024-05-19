import json
import os
from ..image_renderer.render_wrapper import GS_Model


class ModelConfig:
    _instances = {}
    model_configs = []

    def __new__(cls, key, config):
        if key not in cls._instances:
            instance = super().__new__(cls)
            instance.configure(config)
            cls._instances[key] = instance
        return cls._instances[key]

    def configure(self, config):
        self.model_config = config
        self._id = config['id']
        self._name = config['name']
        self._config_path = config['config_path']
        self._R_mat = config['R_mat']
        self._T_vec = config['T_vec']

    @property
    def id(self):
        return self._id

    @property
    def name(self):
        return self._name

    @property
    def config_path(self):
        return self._config_path

    @property
    def R_mat(self):
        return self._R_mat

    @property
    def T_vec(self):
        return self._T_vec

    @classmethod
    def load_configs(cls, json_file_path):
        with open(json_file_path, 'r') as f:
            model_config_data = json.load(f)
        return [cls(config['id'], config) for config in model_config_data]


class ModelManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelManager, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_configs=None):
        if model_configs is not None:
            self.models = {}
            self.model_config = {config.id: config for config in model_configs}

    def set_model(self, model_id):
        try:
            config = self.find_model_config(model_id)
            print("Model config path:", config.config_path)
            new_model = GS_Model(
                config_path=config.config_path,
                R_mat=config.R_mat,
                T_vec=config.T_vec
            )
            self.models[model_id] = new_model
        except ValueError as e:
            print(e)

    def get_model(self, model_id):
        return self.models.get(model_id)

    def find_model_config(self, model_id):
        config = self.model_config.get(model_id)
        if config:
            return config
        else:
            raise ValueError('Invalid model_id: {}'.format(model_id))

    def get_model_config_data(self, model_id):
        config = self.find_model_config(model_id)
        if config:
            return config.model_config  # Return the actual config data
        else:
            return 'Invalid model_id'

    def get_model_ids_and_names(self):
        model_ids_and_names = [
            (config.id, config.name) for config in self.model_config.values()
        ]
        return model_ids_and_names


# Load model configs
json_file_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'model_config_data.json'
)
model_configs = ModelConfig.load_configs(json_file_path)

# Initialize model manager
model_manager = ModelManager(model_configs)
