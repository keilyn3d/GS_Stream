def get_model_config_data(model_id):
    if model_id == 'model1':
        return 'Initial data for model1'
    elif model_id == 'model2':
        return 'Initial data for model2'
    elif model_id == 'model3':
        return 'Initial data for model3'
    else:
        return 'Invalid model_id'

def get_model_init_pose_data():
    # Raw list form before using numpy array
    R_mat = [[-0.70811329, -0.21124761, 0.67375813],
                [0.16577646, 0.87778949, 0.4494483],
                [-0.68636268, 0.42995355, -0.58655453]]
    T_vec = [-0.32326042, -3.65895232, 2.27446875]
    return R_mat, T_vec
