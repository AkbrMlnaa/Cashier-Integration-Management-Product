import { api } from "./api";

export const getAllProducts = async () => {
  try {
    const res = await api.get("/v1/products");
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProductById = async (id) => {
  try {
    const res = await api.get(`/v1/products/${id}`);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addProduct = async (product) => {
  try {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("stock", product.stock);

    if (product.image) {
      formData.append("image", product.image);
    }

    const res = await api.post("/v1/products", formData,{
      headers:{
        "Content-Type": "multipart/form-data"
      },
    });

    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    const formData = new FormData();

    if (product.name) formData.append("name", product.name);
    if (product.category) formData.append("category", product.category);
    if (product.price) formData.append("price", product.price);
    if (product.stock) formData.append("stock", product.stock);

    if (product.image) {
      formData.append("image", product.image);
    }

    const res = await api.put(`/v1/products/${id}`, formData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`/v1/products/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const upsertProductIngredients = async (id, ingredients) => {
  try {
    const res = await api.put(`/v1/products/${id}/ingredients`, {
      ingredients,
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
