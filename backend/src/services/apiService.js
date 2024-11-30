const axios = require("axios");
const csvService = require("./csvService");
const coordinateTransformer = require("./coordinateTransformer");

class CarparkAPIService {
  async fetchCarparkAvailability() {
    try {
      const response = await axios.get(
        "https://api.data.gov.sg/v1/transport/carpark-availability"
      );

      const seenCarparkNumbers = new Set(); // Reset on every fetch

      const enrichedCarparks = response.data.items[0].carpark_data
        .filter((apiCarpark) => {
          if (seenCarparkNumbers.has(apiCarpark.carpark_number)) {
            // Skip duplicates
            return false;
          } else {
            // Add to the set and include in the results
            seenCarparkNumbers.add(apiCarpark.carpark_number);
            return true;
          }
        })
        .map((apiCarpark) => {
          const csvDetails = csvService.getCarparkDetails(
            apiCarpark.carpark_number
          );

          const carparkInfo = {
            apiData: apiCarpark,
            csvDetails: csvDetails,
            carpark_number: apiCarpark.carpark_number,
            total_lots: apiCarpark.carpark_info[0].total_lots,
            lots_available: apiCarpark.carpark_info[0].lots_available,
            lot_type: apiCarpark.carpark_info[0].lot_type,
            address: csvDetails ? csvDetails.address : "Unknown",
            x_coord: csvDetails ? csvDetails.x_coord : null,
            y_coord: csvDetails ? csvDetails.y_coord : null,
            update_datetime: apiCarpark.update_datetime,
          };

          // Transform coordinates if x and y are available
          if (carparkInfo.x_coord && carparkInfo.y_coord) {
            carparkInfo.gps = coordinateTransformer.transformCoordinate(
              parseFloat(carparkInfo.x_coord),
              parseFloat(carparkInfo.y_coord)
            );
          }

          return carparkInfo;
        })
        .filter((carpark) => {
          // Validate update_datetime
          const updateDate = new Date(carpark.update_datetime);
          const now = new Date();
          const oneDayInMs = 24 * 60 * 60 * 1000;
          // Check if the update is within the last day
          return now - updateDate <= oneDayInMs;
        });

      return enrichedCarparks;
    } catch (error) {
      console.error("Error fetching carpark data:", error);
      throw error;
    }
  }
}

module.exports = new CarparkAPIService();
