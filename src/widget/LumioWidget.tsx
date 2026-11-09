import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { dayView, formatDuration, getStatus, hourLabel, type MonthSchedule } from '../core/schedule';
import { color } from '../theme/tokens';
import { fanSvg } from './fanSvg';

const hhmm = (d: Date) => hourLabel(d.getHours() * 60 + d.getMinutes());

export function LumioWidget({ schedules, circuit, now }: { schedules: MonthSchedule[]; circuit: number; now: Date }) {
  const status = getStatus(schedules, circuit, now);
  const today = dayView(schedules, circuit, now);
  const nowMinute = now.getHours() * 60 + now.getMinutes();

  const word = !status.covered ? 'SIN DATOS' : status.hasLight ? 'HAY LUZ' : 'SIN LUZ';
  const wordColor = !status.covered ? color.smoke : status.hasLight ? color.glassOn : color.offText;
  const line = status.until
    ? `${status.hasLight ? 'hasta' : 'vuelve'} ${hhmm(status.until)}${status.remainingMs !== null ? ` · ${formatDuration(status.remainingMs)}` : ''}`
    : status.covered
      ? 'más allá no hay horario'
      : 'abre Lumio con internet';

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{ height: 'match_parent', width: 'match_parent', flexDirection: 'row', alignItems: 'center', backgroundColor: color.lead, borderRadius: 22, padding: 10 }}
    >
      {today && (
        <SvgWidget svg={fanSvg(120, today.slots, Math.floor(nowMinute / 180), nowMinute)} style={{ width: 120, height: 66 }} />
      )}
      <FlexWidget style={{ flex: 1, marginLeft: 10, flexDirection: 'column', justifyContent: 'center' }}>
        <TextWidget text={word} style={{ fontFamily: 'sans-serif-condensed', fontWeight: '900', fontSize: 30, color: wordColor }} />
        <TextWidget text={line} maxLines={1} style={{ fontSize: 13, color: color.cal }} />
        <TextWidget text={`Cto ${circuit} · act. ${hhmm(now)}`} style={{ fontSize: 11, color: color.smoke }} />
      </FlexWidget>
    </FlexWidget>
  );
}
