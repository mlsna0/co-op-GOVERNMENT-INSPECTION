import Agency from "../models/agencyModel";
import BaseCtrl from "./base";

class AgencyModelCtrl extends BaseCtrl {
    model = Agency;

    createAgency = async (req, res) => {
        try {
            console.log(req.body);
            const { agency_name, email, phone, address, province, amphure, tambon, postCode } = req.body;

            const agency = new this.model({
                agency_name,
                email,
                phone,
                address,
                province,
                amphure,
                tambon,
                postCode,
            });

            const savedAgency = await agency.save();
            res.status(201).json(savedAgency);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getAgencies = async (req, res) => {
        try {
            const agencies = await this.model.find();
            res.status(200).json(agencies);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get single agency by ID
    getAgencyById = async (req, res) => {
        try {
            const agency = await this.model.findById(req.params.id);
            if (!agency) {
                return res.status(404).json({ message: "Agency not found" });
            }
            res.status(200).json(agency);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

export default AgencyModelCtrl;