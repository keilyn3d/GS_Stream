import io
import yaml

import numpy as np
import torch
import torchvision

from gaussian_renderer import GaussianModel, render
from utils.graphics_utils import getProjectionMatrix, getWorld2View2
from .camera_pos_utils import ImagesMeta, compose_44, decompose_44, pt_2_plane_dist, r_2_yaw

class DummyPipeline:
    convert_SHs_python = False
    compute_cov3D_python = False
    debug = False


class DummyCamera:
    def __init__(self, R, T, FoVx, FoVy, W, H, C2C_Rot=np.eye(4, dtype=np.float32), C2C_T=np.eye(4, dtype=np.float32)):
        self.projection_matrix = getProjectionMatrix(znear=0.01, zfar=100.0, fovX=FoVx, fovY=FoVy).transpose(0,
                                                                                                             1).cuda()
        self.R = R
        self.T = T

        world2View2 = getWorld2View2(self.R, self.T, np.array([0, 0, 0]), 1.0)

        world2View2 = C2C_Rot @ world2View2
        world2View2 = C2C_T @ world2View2

        self.world_view_transform = torch.tensor(world2View2).transpose(0, 1).cuda()
        self.full_proj_transform = (
            self.world_view_transform.unsqueeze(0).bmm(self.projection_matrix.unsqueeze(0))).squeeze(0)
        self.camera_center = self.world_view_transform.inverse()[3, :3]
        self.image_width = W
        self.image_height = H
        self.FoVx = FoVx
        self.FoVy = FoVy

    def get_new_pose(self):
        """
        Use this function to get the update pose cuz world_view_transform uses the OpenGL view matrix convention
        i.e.,
        [[Right_x, Right_y, Right_z, 0],
        [Up_x, Up_y, Up_z, 0],
        [Look_x, Look_y, Look_z, 0],
        [Position_x, Position_y, Position_z, 0]]
        Or [R|0]
           [T|1] so we need to rearrange before returning back to keep conventions consistent
        """
        world_view_transform = self.world_view_transform.cpu()
        pose = np.eye(4, dtype=np.float32)
        pose[0:3, 0:3] = world_view_transform[0:3, 0:3]
        pose[:3, 3] = np.transpose(world_view_transform[3, :3])
        return pose


class GS_Model():
    def __init__(self, config_path: str, R_mat: str, T_vec: str, device: str = "cuda:0", ):
        self.images = None
        self._R_mat = np.array(eval(R_mat))
        self._T_vec = np.array(eval(T_vec))

        with open(config_path, "r") as f:
            config = yaml.safe_load(f)

        if config["images_txt_path"] is not None:
            self.images = ImagesMeta(config["images_txt_path"])
            self.images_files = config["images_dir"]
            self.images_thumbnails = config["images_dir_thumbnails"]

        self.p1 = np.array(config["alt_and_heading"]["gnd_points"]["p1"])
        self.v1 = np.array(config["alt_and_heading"]["gnd_vectors"]["v1"])
        self.n = np.array(config["alt_and_heading"]["gnd_normal"])
        self.alt_slope = config["alt_and_heading"]["altitude_model"]["altitude_slope"]
        self.alt_intercept = config["alt_and_heading"]["altitude_model"]["altitude_intercept"]
        self.heading_offset = config["alt_and_heading"]["heading_offset"]

        # First Set GPU Context (i.e., we can put different models on different GPUs if needed)
        device = torch.device(device)
        torch.cuda.set_device(device)

        self.pipeline = DummyPipeline()

        self.gaussians = GaussianModel(3)  # 3 is the default sh-degree
        self.gaussians.load_ply(config["ply_path"])

        bg_color = [0.5, 0.5, 0.5]
        self.background = torch.tensor(bg_color, dtype=torch.float32, device=device)

    def get_flight_params(self, R, T):
        if self.alt_slope == "NA":
            altitude = "NA"
            heading = "NA"
        else:
            z_vec = R[:, -1]
            C = np.matmul(-R, T)  # The imagesMeta returns the inv(R) so C = -inv(R)*T in our case its just -R*T
            altitude = self.alt_slope * pt_2_plane_dist(C, self.p1, self.n) + self.alt_intercept
            heading = r_2_yaw(z_vec, self.v1, self.n)
            heading = heading + self.heading_offset
            if heading < 0:
                heading = 360 + heading
            else:
                if heading > 360:
                    heading = heading - 360

        return altitude, heading

    def render_view(self, cam: DummyCamera, save: bool = False, out_path: str = "./test.png"):
        """
        @param cam: DummyCamera object
        @param save: whether to save the image
        @param out_path: where and what to save the image as
        @return rendered PIL image
        """

        result = render(cam, self.gaussians, self.pipeline, self.background)["render"]

        result = torch.clamp(result, min=0, max=1)
        if save:
            result = result.detach().cpu()
            torchvision.io.write_png(result.type(torch.uint8), out_path)

        result = torchvision.transforms.ToPILImage()(result)
        return result
    
    def init_pose(self):
        print(f"wrapper: {self._R_mat}, {self._T_vec}")
        init_pose = compose_44(self._R_mat, self._T_vec)
        return init_pose
    
    def get_initial_camera_pose(self, R_mat, T_vec):
        init_pose = compose_44(R_mat, T_vec)
        R, T = decompose_44(np.array(init_pose))
        return R, T

    def configure_camera(self, R, T, width=1000, height=1000, fovx=1.4261863218, fovy=1.261863218):
        return DummyCamera(R=R, T=T, W=width, H=height, FoVx=fovx, FoVy=fovy)
    
    def get_init_image(self):
        R, T = self.get_initial_camera_pose(self._R_mat, self._T_vec)  # Calculate the camera pose
        cam = self.configure_camera(R, T)  # Configure the camera
        pil_image = self.render_view(cam)
        image_data = io.BytesIO()
        pil_image.save(image_data, "JPEG")
        image_data.seek(0)  # Move the cursor to the initial position for reading the image data
        return image_data
    
    def render_model_image(self, cam):
        # Render the model image using the provided camera
        pil_image = self.render_view(cam)
        image_data = io.BytesIO()
        pil_image.save(image_data, "JPEG")
        image_data.seek(0)  # Move the cursor to the initial position for reading the image data
        return image_data
        


if __name__ == '__main__':
    from backend.app.model_config.model_config_fetcher import model_manager
    
    model_id = "101" # You can change this to any model id. This is just for testing purposes
    model_manager.set_model(model_id)
    model = model_manager.get_model(model_id)
    
    # The code below is for using config from the model_config_fetcher.py   
    #
    # config = model_manager.find_model_config(model_id)   
    # R_mat = np.array(eval(config.R_mat))
    # T_vec = np.array(eval(config.T_vec))
    
    # The code below is for custom R_mat and T_vec
    R_mat = np.array([[-0.70811329, -0.21124761, 0.67375813],
                      [0.16577646, 0.87778949, 0.4494483],
                      [-0.68636268, 0.42995355, -0.58655453]])
    T_vec = np.array([-0.32326042, -3.65895232, 2.27446875])

    # The code below is not needed for the current implementation, but I am keeping it here for reference 
    # 
    # import numpy as np
    # from utils.graphics_utils import rotate4, translate4
    # C2C_Rot = rotate4(np.radians(90), 0, 1, 0)
    # C2C_T = translate4(0, 0, 0)

    cam = DummyCamera(R=R_mat, T=T_vec, W=1600, H=1200, FoVx=1.4261863218, FoVy=1.150908963)

    print(cam.world_view_transform)
    
    print(model.images.get_closest_n(cam.world_view_transform.cpu().detach().numpy()))

    model.render_view(cam=cam, save=True, out_path="test.png")
    
    print("Done")