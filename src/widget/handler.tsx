import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { loadCircuit, loadSchedules, loadTimeFormat } from '../data/load';
import { LumioWidget } from './LumioWidget';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== 'LumioWidget') return;
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const schedules = await loadSchedules();
      const circuit = await loadCircuit(schedules);
      const timeFormat = await loadTimeFormat();
      props.renderWidget(<LumioWidget schedules={schedules} circuit={circuit} timeFormat={timeFormat} now={new Date()} />);
      break;
    }
    default:
      break;
  }
}
