models = [
    {'id':1, 'name': 'RCH', 'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml'},
    {'id':2, 'name': 'UW_tower', 'config_path':'/home/ubuntu/projects/GS_Stream/data/UW_tower/config.yaml'},
    # {'id':3, 'name': 'CViSS', 'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml'},
    # {'id':4, 'name': 'st_comb/st_1', 'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml'},
    # {'id':5, 'name': 'st_comb/st_2', 'config_path':'/home/ubuntu/projects/GS_Stream/output/RCH/config.yaml'},
]

def get_model_ids_and_names():
    model_ids_and_names = [(model['id'], model['name']) for model in models]
    return model_ids_and_names

def get_model_config_data(model_id):
    if model_id == 'model1':
        return 'Initial data for model1'
    elif model_id == 'model2':
        return 'Initial data for model2'
    elif model_id == 'model3':
        return 'Initial data for model3'
    else:
        return 'Invalid model_id'

def get_model_init_pose_raw_data():
    # Raw list form before using numpy array
    R_mat = [[-0.70811329, -0.21124761, 0.67375813],
                [0.16577646, 0.87778949, 0.4494483],
                [-0.68636268, 0.42995355, -0.58655453]]
    T_vec = [-0.32326042, -3.65895232, 2.27446875]
    return R_mat, T_vec
