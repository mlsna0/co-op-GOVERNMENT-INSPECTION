import mongoose, { Schema, Document } from 'mongoose';

interface IThaiProvince extends Document {
    id: number;
    name_th: string;
    name_en: string;
    geography_id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

interface IThaiDistrict extends Document {
    id: number;
    name_th: string;
    name_en: string;
    province_id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

interface IThaiSubDistrict extends Document {
    id: number;
    zip_code:number;
    name_th: string;
    name_en: string;
    amphure_id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

interface IThaiSector extends Document {
    id: number;
    name: string;
  
}

const ThaiProvinceSchema: Schema = new Schema({
    id: { type: Number, required: true },
    name_th: { type: String, required: true },
    name_en: { type: String, required: true },
    geography_id: { type: Number, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    deleted_at: { type: Date, default: null }
});

const ThaiDistrictSchema: Schema = new Schema({
  name: { type: String, required: true },
  province_Id: { type: mongoose.Types.ObjectId, required: true, ref: 'ThaiProvince' },
  // Add other fields here
});

const ThaiSubDistrictSchema: Schema = new Schema({
  name: { type: String, required: true },
  districtId: { type: mongoose.Types.ObjectId, required: true, ref: 'ThaiDistrict' },
  // Add other fields here
});

const ThaiSectorSchema: Schema = new Schema({
  name: { type: String, required: true },
  subDistrictId: { type: mongoose.Types.ObjectId, required: true, ref: 'ThaiSubDistrict' },
  // Add other fields here
});

const ThaiProvince = mongoose.model<IThaiProvince>('ThaiProvince', ThaiProvinceSchema);
const ThaiDistrict = mongoose.model<IThaiDistrict>('ThaiDistrict', ThaiDistrictSchema);
const ThaiSubDistrict = mongoose.model<IThaiSubDistrict>('ThaiSubDistrict', ThaiSubDistrictSchema);
const ThaiSector = mongoose.model<IThaiSector>('ThaiSector', ThaiSectorSchema);

export { ThaiProvince, ThaiDistrict, ThaiSubDistrict, ThaiSector };
