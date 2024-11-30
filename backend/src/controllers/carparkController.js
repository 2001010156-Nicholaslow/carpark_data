const apiService = require('../services/apiService');
const csvService = require('../services/csvService');

class CarparkController {
  async getCarparkAvailability(req, res) {
    try {
      const carparks = await apiService.fetchCarparkAvailability();
      res.json(carparks);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching carpark availability',
        error: error.message 
      });
    }
  }

  getCarparkDetails(req, res) {
    const { code } = req.params;
    const details = csvService.getCarparkDetails(code);
    
    if (details) {
      res.json(details);
    } else {
      res.status(404).json({ message: 'Carpark not found' });
    }
  }
}

module.exports = new CarparkController();