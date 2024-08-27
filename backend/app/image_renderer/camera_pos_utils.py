import numpy as np
import math
from scipy.spatial.transform import Rotation


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


def projection_3d_2d(pts3d_w, R_w_c, t_w_c, K):
    """
    This function projects 3d world points to 2d points of a given image.
    :param pts3d_w: 3D points in world coordinates (pts3d_w --> (3, n)).
    :param R_w_c: Rotation matrix as numpy array 3x3 assumed world to camera.
    :param t_w_c: Translation vector as numpy array 3x1 assumed world to camera.
    :param K: Camera intrinsic matrix as numpy array 3x3.
    :return: 2D image points in the image (2, n)
    """
    # return cv2.projectPoints(np.float32(pts3d_w), R_w_c, t_w_c, K, None)[0].reshape(2, -1).T
    pts2d = (K @ compose_44(R_w_c, t_w_c)[:3, :]) @ np.vstack([pts3d_w, np.ones(pts3d_w.shape[1])])
    pts2d = pts2d / pts2d[2]
    return pts2d[:2, :]


def check_visible(pts_2d, w, h):
    """
    Check if all 2D point are visible in image
    :param pts_2d: numpy array (2, n) where n is the number of points
    :param w: int width of image
    :param h: int height of image
    :return: True if all 2D points are visible and exactly which are not visible
    """
    if pts_2d.shape[0] == 0:
        return False

    visible_bools = np.vstack(
        [pts_2d[0, :] >= 0, pts_2d[0, :] < w, pts_2d[1, :] >= 0, pts_2d[1, :] < h]
    )
    visible_bool = np.all(visible_bools.reshape(-1))
    return visible_bool, np.all(visible_bools, axis=0).reshape(1, -1)


def inverse_projection(pts2d, D, K, R_w_c, t_w_c, w, h):
    """
    This function takes a set of 2D points in an image and projects them to 3D points in the world coordinate frame,
    using the depth map D of the corresponding image, K camera intrinsic and the world to camera pose (R_w_c, t_w_c).
    And returns the 3D points in world coordinate frame pts3d_w (3, n)

    :param pts2d: [[u1; v1], [u2; v2], ..., [un; vn]] where u is column and v is row. Such that pts_2d is shape (2, n)
    :param D: The depth map as numpy array (The depth map can be down-sampled and is handled by sx and sy)
    :param K: The camera intrinsic matrix as numpy array 3x3
    :param R_w_c: Rotation matrix as numpy array 3x3 assumed world to camera (i.e., Colmap R_W^C or R_w_c)
    :param t_w_c: Translation vector as numpy array 3x1 assumed world to camera (i.e., Colmap R_W^C or t_w_c)
    :param w: width of the image (px)
    :param h: height of the image (px)
    :return: 3D points in world coordinates (pts3d_w --> (3, n))
    """
    all_visible, _ = check_visible(pts2d, w, h)
    if all_visible:
        pass
    else:
        raise Exception("Sorry, Some Depth Points Are Not Available...")

    sx = D.shape[1] / w
    sy = D.shape[0] / h

    u = pts2d[0, :] * sx
    u = u.reshape(1, -1)
    v = pts2d[1, :] * sy
    v = v.reshape(1, -1)

    fx = K[0, 0] * sx
    fy = K[1, 1] * sy
    cx = K[0, 2] * sx
    cy = K[1, 2] * sy

    d = D[tuple(np.array(v, dtype=int)), tuple(np.array(u, dtype=int))].reshape(1, -1)
    u = u[d > 0]
    v = v[d > 0]
    d = d[d > 0]
    d = d.reshape(-1)

    z_c = np.array(d, dtype=np.float32)
    x_c = z_c * (u - cx) / fx
    y_c = z_c * (v - cy) / fy

    pts3d_c = np.array([x_c, y_c, z_c, np.ones(x_c.shape[0])])

    """
    Initialize Camera to World Transformation Matrix
    i.e., T_C^W in latex; W: is world C: is camera
    """
    T_c_w = np.eye(4)

    """
    We need to transform 3D points in the Camera coordinate system (pts3d_c)
    to 3D points in the World coordinate system (pts3d_w) using T_c_w...
    To find T_c_w we need to invert T_w_c, which we can do by via the following.
    """
    t_c_w = -R_w_c.T @ t_w_c
    R_c_w = R_w_c.T

    # Composing the camera to world transformation...
    T_c_w[:3, :3] = R_c_w
    T_c_w[:3, 3] = t_c_w

    """
    Using the T_c_w we can transform 3D points in the Camera coordinate system (pts3d_c) to 3D points in the World 
    coordinate system (pts3d_w).
    pts3d_w will be in homogenous coordinates so it is necessary to regularize by dividing by the last (4th) element.
    """
    pts3d_w = T_c_w.dot(pts3d_c)
    pts3d_w = pts3d_w[:3] / pts3d_w[3]

    return pts3d_w


def check_occlusion(pts3d_w, depth, K, R_w_c, t_w_c, w, h, occlusion_tol=0):
    """
    check_occlusion takes a set of 3D points in world coordinates and checks if they are visible to the camera with
    intrinsic matrix K, and pose defined by R_w_c and t_w_c (world to camera).
    1. This function works by first projecting pts3d_w to camera frame,
    2. check_visible...
    3. Then at pts2d project to world using inverse_projection (pts3d_proj).
    4. Calculate the z-vectors between pts3d_proj, pts3d and the camera center (t_c_w).
    5. Use dot project sign of z-vectors to ensure the pts3d is not behind the image...
    6. Finally, compare the distance between pts3d and pts3d_proj and t_c_w and if pts3d_proj is lower, return False.
    The function should accept lists of 3D points and checks a single image.

    :param pts3d_w: numpy array (3, n) where n is the number of points
    :param depth: array depth image
    :param K: array (3x3) camera matrix
    :param R_w_c: Rotation matrix as numpy array 3x3 assumed world to camera (i.e., Colmap R_W^C or R_w_c)
    :param t_w_c: Translation vector as numpy array 3x1 assumed world to camera (i.e., Colmap R_W^C or t_w_c)
    :param occlusion_tol: float percentage tolerance (bleed)
    :return: boolean array (n)
    """

    # 1. Project pts3d_w (annotations) to pts_2d
    pts2d_proj = projection_3d_2d(pts3d_w, R_w_c, t_w_c, K)

    # 2. Get a visible array of points
    _, in_frame = check_visible(pts2d_proj, w, h)

    # 3. Project pts2d_proj to 3D using the depth map
    pts3d_w_proj = inverse_projection(pts2d_proj, depth, K, R_w_c, t_w_c, w, h)

    # 4. Calculate Z-vectors
    # 4.1 Calculate camera center (t_c_w)
    t_c_w = -R_w_c.T @ t_w_c
    # 4.2 Calculate Z-vectors
    zvec_pts3d = pts3d_w - t_c_w[:, None]
    zvec_pts3d_proj = pts3d_w_proj - t_c_w[:, None]

    # 5. Check the sign of the dot product
    zvec_dot = np.einsum('ij,ij->j', zvec_pts3d, zvec_pts3d_proj)
    # Mask by if greater or less than 0. If greater than zero vector is in-front otherwise its behind...
    # Merge with in_frame boolean variable with AND operator
    in_frame = np.logical_and(in_frame, zvec_dot > 0)

    # 6. Compare the magnitudes of zvec_pts3d and zvec_pts3d_proj with occlusion_tol
    zvec_pts3d_mag = np.linalg.norm(zvec_pts3d, axis=0).reshape(1, -1)
    zvec_pts3d_proj_mag = np.linalg.norm(zvec_pts3d_proj, axis=0).reshape(1, -1)
    z_diff = zvec_pts3d_proj_mag - zvec_pts3d_mag
    # z_tol tolerance
    z_tol = zvec_pts3d_proj_mag * occlusion_tol
    in_frame = np.logical_and(in_frame, z_diff > -z_tol)

    return in_frame


class ImagesMeta:
    def __init__(self, images_txt_file, cameras_txt_file):
        self.img_id = []
        self.files = []
        self.t_vec = []
        self.q_vec = []
        self.camera_id = []
        self.cam_centers = []
        self.cameras_params = {}

        with open(cameras_txt_file, 'r') as f:
            for count, line in enumerate(f, start=0):
                if count < 3:
                    pass
            else:
                str_parsed = line.split()
                self.cameras_params[str_parsed[0]] = [str_parsed[1], int(str_parsed[2]), int(str_parsed[3]), np.array(tuple(map(float, str_parsed[4:])))]

        with open(images_txt_file, 'r') as f:
            for count, line in enumerate(f, start=0):
                if count < 4:
                    pass
                else:
                    if count % 2 == 0:
                        str_parsed = line.split()
                        self.img_id.append(str_parsed[0])
                        self.files.append(str_parsed[9])
                        q_raw = np.array(str_parsed[1:5], dtype=np.float32)
                        R_raw = self.qvec2rotmat(q_raw)
                        t_raw = np.array(str_parsed[5:8], dtype=np.float32)
                        self.camera_id.append(int(str_parsed[8]))
                        cam_center = (-R_raw.T @ t_raw)
                        self.q_vec.append(q_raw)
                        self.t_vec.append(t_raw)
                        self.cam_centers.append(cam_center)

        self.q_vec = np.array(self.q_vec, dtype=np.float32)
        self.t_vec = np.array(self.t_vec, dtype=np.float32)

    def get_closest_n(self, pose, n=3):
        """
        :param pose: 4x4 extrinsic matrix
        :param n: number of closest images to provide
        :return: list of image filenames
        """
        R, t = decompose_44(pose)

        t = np.matmul(-R, t)

        #R = Rotation.from_matrix(R)
        #R = R.as_quat()[[3, 0, 1, 2]]  # Change from x,y,z,w to w,x,y,z

        # First filter cameras by translation
        t_dist = np.linalg.norm(self.cam_centers - t, axis=1)

        lowest_t_idx = np.argsort(t_dist)[0:n]  # Find the closest 2*n idxs
        filtered_files = [self.files[i] for i in lowest_t_idx.tolist()]

        # Then rank by camera rotation (Depreciated June 18 2024, fixed closes images bug.)
        #filtered_q_vec = self.q_vec[lowest_t_idx]
        #q_dist = np.linalg.norm(filtered_q_vec - R, axis=1)
        #lowest_q_idx = np.argsort(q_dist)[0:n]
        #q_filtered_files = [filtered_files[i] for i in lowest_q_idx.tolist()]
        #return q_filtered_files

        return filtered_files

    def get_pose_by_filename(self, filename, colmap=False):
        """
        :param filename: filename of the image
        :param colmap: boolean flag to indicate whether to return in original colmap convention (i.e., T_w_c)
        """
        idx = self.files.index(filename)
        R = Rotation.from_quat(self.q_vec[idx][[1, 2, 3, 0]]).as_matrix()
        if colmap:
            t = self.t_vec[idx]
        else:
            R = np.linalg.inv(R)
            t = self.cam_centers[idx]
        return compose_44(R, t)

    def qvec2rotmat(self, qvec):
        return np.array(
            [
                [
                    1 - 2 * qvec[2] ** 2 - 2 * qvec[3] ** 2,
                    2 * qvec[1] * qvec[2] - 2 * qvec[0] * qvec[3],
                    2 * qvec[3] * qvec[1] + 2 * qvec[0] * qvec[2],
                ],
                [
                    2 * qvec[1] * qvec[2] + 2 * qvec[0] * qvec[3],
                    1 - 2 * qvec[1] ** 2 - 2 * qvec[3] ** 2,
                    2 * qvec[2] * qvec[3] - 2 * qvec[0] * qvec[1],
                ],
                [
                    2 * qvec[3] * qvec[1] - 2 * qvec[0] * qvec[2],
                    2 * qvec[2] * qvec[3] + 2 * qvec[0] * qvec[1],
                    1 - 2 * qvec[1] ** 2 - 2 * qvec[2] ** 2,
                ],
            ]
        )

    def rotmat2qvec(self, R):
        Rxx, Ryx, Rzx, Rxy, Ryy, Rzy, Rxz, Ryz, Rzz = R.flat
        K = (
                np.array(
                    [
                        [Rxx - Ryy - Rzz, 0, 0, 0],
                        [Ryx + Rxy, Ryy - Rxx - Rzz, 0, 0],
                        [Rzx + Rxz, Rzy + Ryz, Rzz - Rxx - Ryy, 0],
                        [Ryz - Rzy, Rzx - Rxz, Rxy - Ryx, Rxx + Ryy + Rzz],
                    ]
                )
                / 3.0
        )
        eigvals, eigvecs = np.linalg.eigh(K)
        qvec = eigvecs[[3, 0, 1, 2], np.argmax(eigvals)]
        if qvec[0] < 0:
            qvec *= -1
        return qvec


def compose_44(r, t):
    return np.vstack((np.hstack((np.reshape(r, (3, 3)), np.reshape(t, (3, 1)))), np.array([0, 0, 0, 1])))


def decompose_44(a):
    return a[:3, :3], a[:3, 3]


def rotate4(rad, x, y, z):
    """
    rotate4 rotates the camera around the specified axis

    @param rad: rotation angle in radians
    @param x: rotate around the camera's x-axis (pitch)
    @param y: rotate around the camera's y-axis (yaw)
    @param z: rotate around the camera's z-axis (roll)

    returns 4x4 rotation matrix (MUST BE FLOAT32)
    """

    if x == 1:
        rotation_x = np.array([
            [1, 0, 0, 0],
            [0, np.cos(rad), -np.sin(rad), 0],
            [0, np.sin(rad), np.cos(rad), 0],
            [0, 0, 0, 1]
        ])
    else:
        rotation_x = np.eye(4)

    if y == 1:
        rotation_y = np.array([
            [np.cos(rad), 0, np.sin(rad), 0],
            [0, 1, 0, 0],
            [-np.sin(rad), 0, np.cos(rad), 0],
            [0, 0, 0, 1]
        ])
    else:
        rotation_y = np.eye(4)

    if z == 1:
        rotation_z = np.array([
            [np.cos(rad), -np.sin(rad), 0, 0],
            [np.sin(rad), np.cos(rad), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
    else:
        rotation_z = np.eye(4)

    C2C_Rot = rotation_x @ rotation_y @ rotation_z
    return C2C_Rot.astype(np.float32)


def translate4(x, y, z):
    """
    Translates camera in each axis

    @param x: how much to translate in the x-axis
    @param y: how much to translate in the y-axis
    @param z: how much to translate in the z-axis

    Sample Usage:
    matrix = np.array([[1, 0, 0, 0],
                   [0, 1, 0, 0],
                   [0, 0, 1, 0],
                   [0, 0, 0, 1]])
    translated_matrix = translate4(matrix, 1, 1.25, 0)
    """
    translation_matrix = np.array([
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ])

    return translation_matrix.astype(np.float32)


if __name__ == '__main__':
    R_mat = np.array([[-0.70811329, -0.21124761, 0.67375813],
                      [0.16577646, 0.87778949, 0.4494483],
                      [-0.68636268, 0.42995355, -0.58655453]])
    T_vec = np.array([-0.32326042, -3.65895232, 2.27446875])
    init_pose = compose_44(R_mat, T_vec)
    imagelocs = ImagesMeta("/home/cviss/PycharmProjects/GS_Stream/data/UW_Health_Tower/reconstruction/sparse/0/images.txt", "/home/cviss/PycharmProjects/GS_Stream/data/UW_Health_Tower/reconstruction/sparse/0/cameras.txt")
    print(imagelocs.get_closest_n(init_pose))
