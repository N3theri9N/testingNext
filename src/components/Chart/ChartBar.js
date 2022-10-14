import style from './ChartBar.module.css';

const ChartBar = (props) => {
  let barFillHeight = '0%';

  if (props.maxValue > 0){
    barFillHeight = Math.round((props.value / props.maxValue) * 100) + "%";
  }

  return (
    <div className={style.chartBar}>
      <div className={style.chartBarInner}>
        <div className={style.chartBarFill} style={{height: barFillHeight}}></div>
      </div>
      <div className={style.chartBarLabel}>{props.label}</div>
    </div>
  )
}

export default ChartBar;