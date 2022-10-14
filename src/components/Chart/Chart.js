import style from './Chart.module.css';
import ChartBar from './ChartBar';

const Chart = ( props ) => {
  const dataPointValues = props.dataPoints.map((item) => item.value);
  const totalMaximum = Math.max(...dataPointValues)

  return <div className={style.chart}>
    {props.dataPoints.map(dataPoint => (
    <ChartBar 
      key={dataPoint.label}
      value={dataPoint.value}
      maxValue={totalMaximum}
      label={dataPoint.label}
     />))}
  </div>
}

export default Chart;