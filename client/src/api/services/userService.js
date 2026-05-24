import api from "../axios";

export const getAllUsers = () => {
  return api.get("/users");
};

export const updateUserRole = (id, role) => {
  return api.patch(`/users/${id}/role`, { role });
};
