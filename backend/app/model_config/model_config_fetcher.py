from typing import Any
from ..image_renderer.render_wrapper import GS_Model

model_config_data = [
    {
        'id':'1', 
        'name': 'RCH', 
        'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml',
        'R_mat':'[[ 0.9347217, 0.01801105, 0.354922  ],[ 0.14371365, 0.89425105, -0.42386374],[-0.32502365, 0.44720212, 0.8332877 ]]',
        'T_vec':'[ 0.3057762, -0.8536954, 2.3952193]'        
    },
    {
        'id':'2', 
        'name': 'UW_tower', 
        'config_path':'/home/ubuntu/projects/GS_Stream/output/UW_tower/config.yaml', 
        'R_mat':'[[-0.70811329, -0.21124761, 0.67375813],[0.16577646, 0.87778949, 0.4494483],[-0.68636268, 0.42995355, -0.58655453]]',
        'T_vec':'[-0.32326042, -3.65895232, 2.27446875]'

    },
    # {'id':3, 'name': 'CViSS', 'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml'},
    # {'id':4, 'name': 'st_comb/st_1', 'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml'},
    # {'id':5, 'name': 'st_comb/st_2', 'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml'},
]

class ModelConfig:
    _instances = {}
    
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

model_configs = []
for config in model_config_data:
    model_config = ModelConfig(config['id'], config)
    model_configs.append(model_config)
         
def get_model_ids_and_names():
    model_ids_and_names = [(model.id, model.name) for model in model_configs]
    return model_ids_and_names

models = {}

def set_model(model_id):
    print("=========")
    print(models)
    try:
        config = find_model_config(model_id)
        print("Model config path:", config.config_path)
        new_model = GS_Model(config_path=config.config_path, R_mat=config.R_mat, T_vec=config.T_vec)
        models[model_id] = new_model  
        print(models)
        print("=========")
    except ValueError as e:
        print(e)    

def get_model(model_id):
    return models.get(model_id)
    
def find_model_config(model_id):    
    config = next((config for config in model_configs if config.id == model_id), None)
    if config:
        return config
    else:
        raise ValueError('Invalid model_id: {}'.format(model_id))
        
def get_model_config_data(model_id):
    if model_id == 'model1':
        return 'Initial data for model1'
    elif model_id == 'model2':
        return 'Initial data for model2'
    elif model_id == 'model3':
        return 'Initial data for model3'
    else:
        return 'Invalid model_id'
