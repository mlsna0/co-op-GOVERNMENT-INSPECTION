import { Request, Response } from 'express';
import BaseCtrl from './base';
import { ThaiProvince, ThaiDistrict, ThaiSubDistrict, ThaiSector } from '../models/thaiAddressModel';

class ThaiApiAddressCtrl {

  // Fetch all provinces
  getProvinces = async (req: Request, res: Response): Promise<void> => {
    try {
      const provinces = await ThaiProvince.find();
      res.status(200).json(provinces);
    } catch (err) {
      res.status(500).send(err);
    }
  };

  // Fetch districts by province ID
  getDistricts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provinceId } = req.params;
      const districts = await ThaiDistrict.find({ provinceId });
      res.status(200).json(districts);
    } catch (err) {
      res.status(500).send(err);
    }
  };

  // Fetch sub-districts by district ID
  getSubDistricts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { districtId } = req.params;
      const subDistricts = await ThaiSubDistrict.find({ districtId });
      res.status(200).json(subDistricts);
    } catch (err) {
      res.status(500).send(err);
    }
  };

  // Fetch sectors by sub-district ID
  getSectors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subDistrictId } = req.params;
      const sectors = await ThaiSector.find({ subDistrictId });
      res.status(200).json(sectors);
    } catch (err) {
      res.status(500).send(err);
    }
  };
}

export default ThaiApiAddressCtrl;
