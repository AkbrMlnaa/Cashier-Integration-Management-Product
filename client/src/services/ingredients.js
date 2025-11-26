import { api } from "./api";

export const getAllIngredients = async () => {
  try {
    const res = await api.get("/v1/ingredients");
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getIngredientByID = async (id) => {
  try {
    const res = await api.get(`/v1/ingredients/${id}`);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addIngredient = async (ingredient) => {
  try {
    const payload = {
      name: ingredient.name,
      unit: ingredient.unit,
    };
    const res = await api.post("/v1/ingredients", payload);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateIngredient = async (id, ingredient) => {
  try {
    const payload = {
      name: ingredient.name,
      unit: ingredient.unit,
    };
    const res = await api.put(`/v1/ingredients/${id}`, payload);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateIngredientStock = async (id, quantity) => {
  try {
    const res = await api.put(`/v1/ingredients/${id}/stock`, {
      quantity: Number(quantity),
    });
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteIngredient = async (id) => {
  try {
    const res = await api.delete(`/v1/ingredients/${id}`);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
