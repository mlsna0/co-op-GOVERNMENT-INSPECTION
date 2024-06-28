import RegisterModel from '../models/registerModel';
import BaseCtrl from './base';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class RegisterModelCtrl extends BaseCtrl {
    model = RegisterModel;

    create = async (req, res) => {
        try {
            const { firstname, lastname, email, password, confirmpassword, phone, role } = req.body;

            if (password !== confirmpassword) {
                return res.status(400).json({ msg: 'Passwords do not match' });
            }

            // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
            let user = await this.model.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // เข้ารหัสผ่าน
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // สร้างผู้ใช้ใหม่
            user = new this.model({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                confirmpassword: hashedPassword,
                phone,
                role
            });

            await user.save();

            res.status(201).json({ msg: 'User registered successfully' });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
            let user = await this.model.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }

            // ตรวจสอบรหัสผ่าน
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }

            // สร้าง JWT
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || 'your_jwt_secret_key', // ใช้ process.env.JWT_SECRET หรือ default key
                { expiresIn: '1h' }
            );

            res.json({ token });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    };

    // วิธีการอื่นๆ ของ CRUD...
}

export default RegisterModelCtrl;
