export interface WeatherData {
  properties: {
    timeseries: WeatherTimeSeries[];
  };
}

export interface WeatherTimeSeries {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        relative_humidity: number;
        wind_speed: number;
        wind_from_direction: number;
      };
    };
    next_1_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
    next_6_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
  };
}

export interface WeatherForecastItem {
  time: string;
  temperature: number;
  symbolCode: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}