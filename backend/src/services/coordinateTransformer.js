const proj4 = require('proj4');

class CoordinateTransformer {
  constructor() {
    // SVY21 projection definition
    this.svy21 = '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs';
    
    // WGS84 (standard GPS coordinates)
    this.wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
  }

  transformCoordinate(x, y) {
    try {
      // Transform from SVY21 to WGS84
      const [longitude, latitude] = proj4(this.svy21, this.wgs84, [x, y]);
      return { latitude, longitude };
    } catch (error) {
      console.error('Coordinate transformation error:', error);
      return null;
    }
  }

  // Batch transform method for multiple coordinates
  transformCoordinates(carparkData) {
    return carparkData.map(carpark => ({
      ...carpark,
      coordinates: this.transformCoordinate(
        parseFloat(carpark.x_coord), 
        parseFloat(carpark.y_coord)
      )
    }));
  }
}

module.exports = new CoordinateTransformer();