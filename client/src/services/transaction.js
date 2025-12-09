import { api } from "./api";

export const getAllTransactions = async () => {
  try {
    const res = await api.get("/v1/transactions");
    return res.data.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTransactionByID = async (id) => {
  try {
    const res = await api.get(`/v1/transactions/${id}`);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const addTransaction = async (transaction) => {
  try {
    const payload = {
      payment_method: transaction.payment_method,
      details: transaction.details.map((d) => ({
        product_id: d.product_id,
        quantity: d.quantity,
      })),
    };

    const res = await api.post("/v1/transactions", payload);
    return res.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
