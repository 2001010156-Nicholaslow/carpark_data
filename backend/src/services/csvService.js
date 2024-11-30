const fs = require('fs');
const { parse } = require('csv-parse/sync');
const path = require('path');

class CarparkCSVService {
  constructor() {
    this.carparkData = this.loadCarparkData();
  }

  loadCarparkData() {
    try {
      const csvPath = path.join(__dirname, '../data/HDBCarparkInformation.csv');
      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Create a map using car_park_no as the key
      const carparkMap = new Map();
      records.forEach(record => {
        carparkMap.set(record.car_park_no, record);
      });

      return carparkMap;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      return new Map();
    }
  }

  getCarparkDetails(carparkNo) {
    return this.carparkData.get(carparkNo) || null;
  }

  getAllCarparks() {
    return Array.from(this.carparkData.values());
  }
}

module.exports = new CarparkCSVService();