export interface ChartOptions {
    chart: {
      type:
        | "donut"
        | "area"
        | "line"
        | "bar"
        | "pie"
        | "radialBar"
        | "scatter"
        | "bubble"
        | "heatmap"
        | "candlestick"
        | "boxPlot"
        | "radar"
        | "polarArea"
        | "rangeBar"
        | "rangeArea"
        | "treemap";
      width?: number;
    };
  
    labels:string[],
    responsive: Array<{
      breakpoint: number;
      options: {
        chart: {
          width: number;
        };
        legend: {
          position: string;
        };
      };
    }>;
  }
  
export interface ChartData {
  series: number[];
  options: ApexOptions & {
    plotOptions: {
      pie: {
        donut: {
          size: string;
        };
      };
    };
  };
}

  export  interface SeriesData {
    name: string;
    data: number[];
  };
  
export interface CreditHistoryData {
  id?: number|string,
  date: string,
  name: string,
  credit?: number,
  fileTitle?:string,
}

export interface CreditHistory {
  activity: string,
  created_at: string,
  credit_type: string,
  credit_usage: number,
  id: number,
  user_id: number
}