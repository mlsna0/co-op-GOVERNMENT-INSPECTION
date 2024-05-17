import ItemModel, { Items } from '../models/itemModel'; // import model และ interface จาก itemModel

// ดึงข้อมูลทั้งหมดจากฐานข้อมูล
const getAllItems = async (): Promise<Items[]> => {
  return await ItemModel.find();
};

// สร้างข้อมูลใหม่ในฐานข้อมูล
const createItem = async (data: Items): Promise<Items> => {
  return await ItemModel.create(data);
};

// อัปเดตข้อมูลในฐานข้อมูลด้วย ID และข้อมูลใหม่ที่รับเข้ามา
const updateItem = async (id: string, data: Partial<Items>): Promise<Items | null> => {
  return await ItemModel.findByIdAndUpdate(id, data, { new: true });
};

export default {
  getAllItems,
  createItem,
  updateItem
};
