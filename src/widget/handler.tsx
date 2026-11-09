import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { loadCircuit, loadSchedules } from '../data/load';
import { LumioWidget } from './LumioWidget';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== 'LumioWidget') return;
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const [schedules, circuit] = await Promise.all([loadSchedules(), loadCircuit()]);
      props.renderWidget(<LumioWidget schedules={schedules} circuit={circuit} now={new Date()} />);
      break;
    }
    default:
      break;
  }
}
