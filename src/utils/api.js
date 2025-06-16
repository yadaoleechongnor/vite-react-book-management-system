export const API_BASE_URL = "http://localhost:5000" || "https://yadaoleechongnor-souphanouvong-master.onrender.com";

export const handleApiError = async (response) => {
  try {
    const data = await response.json();
    if (data.message) {
      throw new Error(data.message);
    }
  } catch (e) {
    if (response.status === 500) {
      throw new Error('Server error - please try again later');
    } else if (response.status === 413) {
      throw new Error('File is too large - please try a smaller file');
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
};
