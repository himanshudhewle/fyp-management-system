import { axiosInstance } from "./axios";

export const readDemoRecords = async (name) => {
  const { data } = await axiosInstance.get(`/records/${encodeURIComponent(name)}`);
  return data.records;
};

export const createDemoRecord = async (name, data) => {
  const response = await axiosInstance.post(
    `/records/${encodeURIComponent(name)}`,
    { data }
  );
  return response.data.record;
};

export const updateDemoRecord = async (name, id, data) => {
  const response = await axiosInstance.put(
    `/records/${encodeURIComponent(name)}/${encodeURIComponent(id)}`,
    { data }
  );
  return response.data.record;
};

export const deleteDemoRecord = async (name, id) => {
  await axiosInstance.delete(
    `/records/${encodeURIComponent(name)}/${encodeURIComponent(id)}`
  );
};
