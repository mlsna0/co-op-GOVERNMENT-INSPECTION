import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'thaidate'
})
export class ThaiDatePipe implements PipeTransform {
    transform(date: string, format: string): string {
        let ThaiDay = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
        let shortThaiMonth = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        let longThaiMonth = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        let inputDate = new Date(date);
        let dataDate = [
            inputDate.getDay(), inputDate.getDate(), inputDate.getMonth(), inputDate.getFullYear()
        ];
        let outputDateFull = [
            'วัน ' + ThaiDay[dataDate[0]],
            'ที่ ' + dataDate[1],
            'เดือน ' + longThaiMonth[dataDate[2]],
            'พ.ศ. ' + (dataDate[3] + 543)
        ];
        let outputDateShort = [
            dataDate[1],
            shortThaiMonth[dataDate[2]],
            dataDate[3] + 543,

        ];

        const minutes = String(inputDate.getMinutes()).padStart(2, '0');
        let outputDateShort2 = [
            dataDate[1],
            shortThaiMonth[dataDate[2]],
            dataDate[3] + 543,
            "เวลา " + inputDate.getHours() + ":" + minutes + " น.",

        ];
        let outputDateMedium = [
            dataDate[1],
            longThaiMonth[dataDate[2]],
            dataDate[3] + 543
        ];
        let outputDateYear = [
            // inputDate.getDate(),
            // inputDate.getMonth() + 1,
            dataDate[3] + 543
        ];
        let outputDateMonth = [
            // inputDate.getDate(),
            longThaiMonth[dataDate[2]],
            // dataDate[3] + 543
        ];
        let Salarydate = [
            longThaiMonth[dataDate[2]],
            dataDate[3] + 543,

        ];
        let outputTime = [
            inputDate.getHours() + ":" + minutes + " น.",

        ];
        let returnDate: string;
        returnDate = outputDateMedium.join(" ");
  
        if (format == 'full') {
            returnDate = outputDateFull.join(" ");
        }
        if (format == 'medium') {
            returnDate = outputDateMedium.join(" ");
        }
        if (format == 'short') {
            returnDate = outputDateShort.join(" ");
        }
        if (format == 'year') {
            returnDate = outputDateYear.join("/");
        }
        if (format == 'month') {
            returnDate = outputDateMonth.join(" ");
        }
        if (format == 'forlog') {
            returnDate = outputDateShort2.join(" ");
        }
        if (format == 'salarydate') {
            returnDate = Salarydate.join("");
        }
        if (format == 'time') {
            returnDate = outputTime.join("");

        }
        
        if (date.includes('/')) {
            let dateParts = date.split('/');
            let day = parseInt(dateParts[0], 10);
            let month = parseInt(dateParts[1], 10) - 1; // เดือนใน JavaScript นับจาก 0
            let year = parseInt(dateParts[2], 10);

            // แปลง พ.ศ. เป็น ค.ศ. ถ้าปีเป็นปี พ.ศ.
            if (year > 2400) {
                year = year - 543;
            }

            let inputDate = new Date(year, month, day);
            let dataDate = [
                inputDate.getDay(), inputDate.getDate(), inputDate.getMonth(), inputDate.getFullYear()
            ];

            let outputDateMedium = [
                dataDate[1],
                longThaiMonth[dataDate[2]],
                dataDate[3] + 543 // แปลง ค.ศ. กลับเป็น พ.ศ.
            ];

            let returnDate: string;

            // ตรวจสอบรูปแบบ
            if (format === 'medium') {
                returnDate = outputDateMedium.join(" ");
            }

            // เพิ่มรูปแบบใหม่ 'thaiDate'
            if (format === 'thaiDate') {
                returnDate = `${dataDate[1]} ${longThaiMonth[dataDate[2]]} ${dataDate[3] + 543}`;
            }

            return returnDate;
        }


        return returnDate;
    }
}