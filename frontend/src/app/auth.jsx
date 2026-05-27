import api from "../services/api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    if (response.data && response.data.data.access_token) {
      localStorage.setItem("token", response.data.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data.data;
    }
  } catch (error) {
    throw error.response?.data?.error || "Đăng nhập thất bại";
  }
};

export const register = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    if (response.data && response.data.data.access_token) {
      localStorage.setItem("token", response.data.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data.data;
    }
  } catch (error) {
    throw error.response?.data?.error || "Đăng ký thất bại";
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Yêu cầu thất bại";
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Đặt lại mật khẩu thất bại";
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.put("/auth/update-profile", data);
    if (response.data && response.data.data) {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...savedUser,
        ...response.data.data
      }));
      return response.data.data;
    }
  } catch (error) {
    throw error.response?.data?.error || "Cập nhật thông tin thất bại";
  }
};

export const changePassword = async (current_password, new_password) => {
  try {
    const response = await api.put("/auth/change-password", { current_password, new_password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Đổi mật khẩu thất bại";
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};
