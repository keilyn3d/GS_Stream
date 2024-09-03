#
# This script is used to generate a config.yaml for a project.
# Pre-requisite: Sparse model created using Colmap format.
#
import argparse
import glob
import math
import os
from os import path

import numpy as np
from PIL import Image
from ruamel.yaml import YAML
from scipy import stats
from scipy.spatial.transform import Rotation
from sklearn.linear_model import LinearRegression


def compose_44(r, t):
    return np.vstack((np.hstack((np.reshape(r, (3, 3)), np.reshape(t, (3, 1)))), np.array([0, 0, 0, 1])))


def decompose_44(a):
    return a[:3, :3], a[:3, 3]


def pt_2_plane_dist(p: np.ndarray, p0: np.ndarray, n: np.ndarray) -> float:
    """
    Calculates the distance between some point p and the plane defined by its normal n and point p0
    @param p: 3d point
    @param p0: 3d point on the plane
    @param n:  plane normal vector
    """

    return np.dot(p - p0, n)


def r_2_yaw(z_vec: np.ndarray, plane_vec: np.ndarray, n: np.ndarray) -> float:
    """
    Calculates the angle between camera forward vector (z_vec) and a vector on the plane (plane_vec).
    Such that the rotation is given in degrees about the normal n of the plane.
    @return: angle between -360 and 360 degrees
    """
    plane_proj = z_vec / np.linalg.norm(z_vec)
    dot = np.dot(plane_proj, plane_vec)

    det = np.vstack((plane_proj, plane_vec, n))
    det = np.linalg.det(det)
    return np.degrees(math.atan2(det, dot))


def get_dji_meta(filepath: str) -> dict:
    """
     Returns a dict with DJI-specific metadata stored in the XMB portion of the image
     @param filepath: filepath to referenced image with DJI formatted meta-data
     @returns dictionary with metadata tags
     """

    # list of metadata tags
    djimeta = ["AbsoluteAltitude", "RelativeAltitude", "GimbalRollDegree", "GimbalYawDegree", \
               "GimbalPitchDegree", "FlightRollDegree", "FlightYawDegree", "FlightPitchDegree"]

    # read file in binary format and look for XMP metadata portion
    fd = open(filepath, 'rb')
    d = fd.read()
    xmp_start = d.find(b'<x:xmpmeta')
    xmp_end = d.find(b'</x:xmpmeta')

    # convert bytes to string
    xmp_b = d[xmp_start:xmp_end + 12]
    xmp_str = xmp_b.decode()

    fd.close()

    # parse the XMP string to grab the values
    xmp_dict = {}
    for m in djimeta:
        istart = xmp_str.find(m)
        ss = xmp_str[istart:istart + len(m) + 10]
        val = float(ss.split('"')[1])
        xmp_dict.update({m: val})

    return xmp_dict


def read_gnd_points(filepath: str) -> list:
    points = []
    with open(filepath, 'r') as f:
        for line in f:
            points.append(np.array(line.split(), dtype=np.float32))
    return points


class ImagesMeta:
    def __init__(self, file):
        self.img_id = []
        self.files = []
        self.t_vec = []
        self.q_vec = []

        with open(file, 'r') as f:
            for count, line in enumerate(f, start=0):
                if count < 4:
                    pass
                else:
                    if count % 2 == 0:
                        str_parsed = line.split()
                        self.img_id.append(str_parsed[0])
                        self.files.append(str_parsed[9])
                        self.t_vec.append(str_parsed[5:8])
                        self.q_vec.append(str_parsed[1:5])

        self.q_vec = np.array(self.q_vec, dtype=np.float32)
        self.t_vec = np.array(self.t_vec, dtype=np.float32)

    def get_closest_n(self, pose, n=3):
        """
        :param pose: 4x4 extrinsic matrix
        :param n: number of closest images to provide
        :return: list of image filenames
        """
        R, t = decompose_44(pose)
        R = Rotation.from_matrix(R)
        R = R.as_quat()[[3, 0, 1, 2]]  # Change from x,y,z,w to w,x,y,z

        # First filter cameras by translation
        t_dist = np.linalg.norm(self.t_vec - t, axis=1)

        lowest_t_idx = np.argsort(t_dist)[0:(2 * n)]  # Find the closest 2*n idxs
        filtered_files = [self.files[i] for i in lowest_t_idx.tolist()]

        # Then rank by camera translation
        filtered_q_vec = self.q_vec[lowest_t_idx]
        q_dist = np.linalg.norm(filtered_q_vec - R, axis=1)
        lowest_q_idx = np.argsort(q_dist)[0:n]
        q_filtered_files = [filtered_files[i] for i in lowest_q_idx.tolist()]

        return q_filtered_files

    def get_pose_by_filename(self, filename):
        idx = self.files.index(filename)
        R = Rotation.from_quat(self.q_vec[idx][[1, 2, 3, 0]]).as_matrix()
        #R = np.linalg.inv(R)
        return compose_44(R, self.t_vec[idx])


def create_thumbnails(images_dir: str, thumbnails_dir: str, max_dim: int = 500):
    # Create folder of thumbnails if not available.
    if path.exists(thumbnails_dir):
        pass
    else:
        os.mkdir(thumbnails_dir)
        size = 250, 250
        for infile in glob.glob(path.join(images_dir, "*.JPG")):
            file, ext = os.path.splitext(infile)
            with Image.open(infile) as im:
                im.thumbnail(size)
                im.save(path.join(thumbnails_dir, file.split('/')[-1]+'.JPG'), "JPEG")

def main_dji(args):
    create_thumbnails(args.images_dir, args.images_dir_thumbnails, 250)
    if args.dji:
        points = read_gnd_points(args.plane_points_file)

        p1 = points[0]
        p2 = points[1]
        p3 = points[2]

        # These two vectors are in the plane
        v1 = p3 - p1
        v2 = p2 - p1

        # the cross product is a vector normal to the plane
        cp = np.cross(v1, v2)
        cp = cp / np.linalg.norm(cp)

        imagesMeta = ImagesMeta(args.images_txt_path)
        elev = []
        yaw = []
        plane_dist = []
        r_yaw = []
        for image in imagesMeta.files:
            elev.append(get_dji_meta(path.join(args.images_dir, image))["RelativeAltitude"])
            yaw.append(get_dji_meta(path.join(args.images_dir, image))["GimbalYawDegree"])  # assume this is real
            R, T = decompose_44(imagesMeta.get_pose_by_filename(image))
            z_vec = R.T[:, -1]
            C = np.matmul(-R.T, T)
            plane_dist.append(pt_2_plane_dist(C, p1, cp))
            r_yaw.append(r_2_yaw(z_vec, v1, cp))

        # elev = slope_alt * plane_dist + intercept_alt
        plane_dist = np.array(plane_dist).reshape(-1, 1)
        elev = np.array(elev).reshape(-1, 1)
        alt_model = LinearRegression(fit_intercept=False)
        alt_model.fit(plane_dist, elev)
        slope_alt = alt_model.coef_
        intercept_alt = alt_model.intercept_
        r_alt = alt_model.score(plane_dist, elev)

        yaw = np.array(yaw)
        r_yaw = np.array(r_yaw)
        yaw = np.where(yaw < 0, 360 + yaw, yaw)
        r_yaw = np.where(r_yaw < 0, 360 + r_yaw, r_yaw)

        r_yaw_offset = yaw - r_yaw
        r_yaw_offset = np.where(r_yaw_offset < -180, r_yaw_offset + 360, r_yaw_offset)
        r_yaw_offset = np.where(r_yaw_offset > 180, r_yaw_offset - 360, r_yaw_offset)

        # yaw = r_yaw + mean_offset
        _, _, mean_offset, var_offset, _, kurtosis_offset = stats.describe(r_yaw_offset)

        data = {
            "ply_path": path.abspath(args.ply_path),
            "images_txt_path": path.abspath(args.images_txt_path),
            "cameras_txt_path": path.abspath(args.cameras_txt_path),
            "images_dir": path.abspath(args.images_dir),
            "images_dir_thumbnails": path.abspath(args.images_dir_thumbnails),
            "alt_and_heading": {
                "gnd_points": {"p1": p1.tolist(), "p2": p2.tolist(), "p3": p3.tolist()},
                "gnd_vectors": {"v1": v1.tolist(), "v2": v2.tolist()},
                "gnd_normal": cp.tolist(),
                "altitude_model": {"altitude_slope": float(slope_alt), "altitude_intercept": float(intercept_alt)},
                "altitude_r": float(r_alt),
                "heading_offset": float(mean_offset),
                "heading_error": {"heading_variance": float(var_offset), "heading_kurtosis": float(kurtosis_offset)}
            }
        }
    else:
        data = {
            "ply_path": path.abspath(args.ply_path),
            "images_txt_path": path.abspath(args.images_txt_path),
            "cameras_txt_path": path.abspath(args.cameras_txt_path),
            "images_dir": path.abspath(args.images_dir),
            "images_dir_thumbnails": path.abspath(args.images_dir_thumbnails),
            "alt_and_heading": {
                "gnd_points": {"p1": "NA", "p2": "NA", "p3": "NA"},
                "gnd_vectors": {"v1": "NA", "v2": "NA"},
                "gnd_normal": "NA",
                "altitude_model": {"altitude_slope": "NA", "altitude_intercept": "NA"},
                "altitude_r": "NA",
                "heading_offset": "NA",
                "heading_error": {"heading_variance": "NA", "heading_kurtosis": "NA"}
            }
        }

    if args.depth_dir is not None:
        data["depth_dir"] = path.abspath(args.depth_dir)
    else:
        data["depth_dir"] = "NA"

    with open(path.join(args.config_path, 'config.yaml'), 'w') as outfile:
        yaml = YAML()
        yaml.default_flow_style = False
        yaml.dump(data, outfile)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-ply', '--ply_path', type=str, help="path to ply file",
                        default="../output/RCH/splat/iteration_30000/cropped.ply")
    parser.add_argument('-img_txt', '--images_txt_path', type=str, help="path to images.txt file",
                        default="../output/RCH/sparse/0/images.txt")
    parser.add_argument('-cams_txt', '--cameras_txt_path', type=str, help="path to cameras.txt file",
                        default="../output/RCH/sparse/0/cameras.txt")
    parser.add_argument('-img_dir', '--images_dir', type=str, help="path of images folder",
                        default="../output/RCH/images")
    parser.add_argument('-img_dir_thumb', "--images_dir_thumbnails", type=str,
                        help="path of thumbnails folder", default="../output/RCH/images_thumbnails")
    parser.add_argument('-depth_dir', '--depth_dir', type=str, help="path of depth folder", default=None)
    parser.add_argument('-gnd_pts', "--plane_points_file", type=str,
                        help="path to <projectid>_plane_points.txt file", default="../output/RCH/plane_points.txt")
    parser.add_argument('-config_path', "--config_path", type=str, help="path to save config file")
    parser.add_argument('-dji', "--dji", type=bool, help="Is DJI images?")
    args = parser.parse_args()
    main_dji(args)
