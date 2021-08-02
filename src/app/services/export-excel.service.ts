import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  constructor() { }

  exportExcel(excelData: any) {

    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.header;
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Danh sách đối tượng tiêm');

    //Add Row and formatting
    worksheet.mergeCells('A1', 'AA1');
    let titleRow = worksheet.getCell('A1');
    titleRow.value = title
    titleRow.font = {
      name: 'Times New Roman',
      size: 14,
      underline: 'single',
      bold: true,
      color: { argb: '000000' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true }

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, i) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'a8d08d' },
        bgColor: { argb: '' }
      }
      cell.font = {
        name: 'Times New Roman',
        bold: true,
        color: { argb: '000000' },
        size: 11,
        italic: true
      }
    })
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true };
    // Adding Data with Conditional Formatting
    data.forEach((customerData: any) => {
      let row = worksheet.addRow(customerData);
    });
    worksheet.addRow([]);

    worksheet.columns.forEach(function (column, i) {
      if (i !== 0) {
        var maxLength = 0;
        column['eachCell'] && column['eachCell']({ includeEmpty: true }, function (cell, j) {
          if (j > 1) {
            let columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 5;
      }
    });

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    })

  }
}
