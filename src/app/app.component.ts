import { Component, OnInit } from '@angular/core';
import { ExportExcelService } from './services/export-excel.service';
import * as XLSX from "xlsx";
import { cloneDeep, filter } from 'lodash-es';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  willDownload = false;
  data: CustomerData[] = [];
  displayData: CustomerData[] = [];
  showItem: boolean[] = [];
  dataForExcel: any[] = [];
  searchText = '';
  injectedNumber = 0;
  formatDate = '';

  constructor(public excelService: ExportExcelService) { }

  ngOnInit() {
    this.showItem.fill(false);
    const today = new Date();
    const date = today.toJSON().slice(0, 10);
    this.formatDate = date.slice(8, 10) + '/'
      + date.slice(5, 7) + '/'
      + date.slice(0, 4);
  };

  onFileChange(ev: any) {
    let workBook: XLSX.WorkBook | null = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      let json;
      workBook = XLSX.read(data, { type: 'binary' });
      json = workBook.SheetNames.reduce((initial: any, name) => {
        const sheet = workBook!.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      json = Object.values(json)[0] as [];
      json.splice(0, 1);
      this.mapData(json);
      this.willDownload = true;
    }
    reader.readAsBinaryString(file);
  }

  mapData(json: any) {
    json.forEach((item: any) => {
      this.data.push({
        sl: Object.values(item)[0] as number,
        name: item['__EMPTY'] || '',
        gender: this.formatGender(item['__EMPTY_1']),
        birth: this.formatBirth(item['__EMPTY_2']),
        email: item['__EMPTY_3'] || '',
        priotyId: item['__EMPTY_4'] || '',
        job: item['__EMPTY_5'] || '',
        workUnit: item['__EMPTY_6'] || '',
        phone: item['__EMPTY_7'] || '',
        indentificationCard: item['__EMPTY_8'] || '',
        healthInsuranceNumber: item['__EMPTY_9'] || '',
        ethnic: item['__EMPTY_10'] || '',
        nation: item['__EMPTY_11'] || '',
        city: item['__EMPTY_12'] || '',
        cityId: item['__EMPTY_13'] || '',
        district: item['__EMPTY_14'] || '',
        districtId: item['__EMPTY_15'] || '',
        ward: item['__EMPTY_16'] || '',
        wardId: item['__EMPTY_17'] || '',
        address: item['__EMPTY_18'] || '',
        healthfacilityId: item['__EMPTY_19'] || '',
        note: item['__EMPTY_20'] || '',
        firstChecked: item['__EMPTY_20'] === 'YES' ? true : false,
        secondChecked: item['__EMPTY_21'] === 'YES' ? true : false,
        done: item['__EMPTY_22'] === 'YES' ? true : false
      })
    });
    this.countInjectedNumber();
    this.displayData = [...this.data];
  }

  filterData() {
    const filterText = this.formatString(this.searchText);
    this.displayData = filter(this.data, (item) => {
      const name = this.formatString(item.name);
      const indentificationCard = this.formatString(item.indentificationCard.toString());
      const phone = this.formatString(item.phone.toString());
      return name.includes(filterText) || indentificationCard.includes(filterText) || phone.includes(filterText);
    }) as CustomerData[];
    this.showItem.fill(false);
  }

  formatBirth(str: string) {
    if (!str) return '';

    return `${str.slice(4,6)}/${str.slice(6,8)}/${str.slice(0,4)}`;
  }

  formatGender(str: any) {
    if (!str || str === 0) return 'Không rõ';

    return str === 'Nam' ? 'Nam': 'Nữ';
  }

  formatString(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  }

  showCustomer(index: number) {
    if (this.showItem[index]) {
      this.showItem[index] = false;
    } else {
      this.showItem.fill(false);
      this.showItem[index] = true;
    }
  }

  exportToExcel() {
    this.dataForExcel = [];
    this.data.forEach((row: any) => {
      const rowExcel = cloneDeep(row);
      rowExcel.firstChecked = row.firstChecked ? 'Yes' : 'No';
      rowExcel.secondChecked = row.secondChecked ? 'Yes' : 'No';
      rowExcel.done = row.done ? 'Yes' : 'No';
      if (row.gender === 'Không rõ') {
        rowExcel.gender = 0
      } else {
        rowExcel.gender = row.gender === 'Nam' ? 'Nam' : 'Nữ';
      }
      rowExcel.birth = `${row.birth.slice(6,10)}${row.birth.slice(3,5)}${row.birth.slice(0,2)}`
      this.dataForExcel.push(Object.values(rowExcel))
    })
    const header = [
      'STT',
      'Họ và tên',
      'Giới tính',
      'Ngày sinh',
      'E-mail',
      'Mã nhóm đối tượng ưu tiên',
      'Nghề nghiệp',
      'Đơn vị công tác',
      'Số điện thoại',
      'Số CMT/CCCD/Hộ chiếu',
      'Số thẻ bảo hiểm y tế',
      'Dân tộc',
      'Quốc tịch',
      'Tỉnh/Thành phố',
      'Mã Tỉnh/Thành phố',
      'Quận/Huyện',
      'Mã Quận/Huyện',
      'Xã Phường',
      'Mã Xã Phường',
      'Địa chỉ chi tiết',
      'Mã cơ sở y tế tiêm',
      'Ghi chú',
      'Check-in Kim Mã',
      'Check-in Bệnh viện',
      'Đã tiêm thành công'
    ]
    let reportData = {
      title: `DANH SÁCH ĐỐI TƯỢNG ĐĂNG KÝ TIÊM VẮC XIN COVID-19 - ngày ${this.formatDate}`,
      header: header,
      data: this.dataForExcel
    }

    this.excelService.exportExcel(reportData);
  }

  changeCustomerData(changedData: CustomerData, i: number) {
    this.data[i] = changedData;
    this.countInjectedNumber();
  }

  countInjectedNumber() {
    this.injectedNumber = this.data.filter(item => item.done).length;

    return;
  }
}

export interface CustomerData {
  sl: number | string;
  name: string;
  gender: string;
  birth: string;
  email?: string;
  priotyId: number | string;
  job: string;
  workUnit: string;
  phone: string;
  indentificationCard: string;
  healthInsuranceNumber?: string;
  ethnic: string;
  nation: string;
  city: string;
  cityId: string;
  district: string;
  districtId: string;
  ward: string;
  wardId: string;
  address: string;
  healthfacilityId: string;
  note: string;
  firstChecked: boolean;
  secondChecked: boolean;
  done: boolean;
}
