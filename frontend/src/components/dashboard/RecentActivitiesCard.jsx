import { SCORE_MAX } from '../../constants.js'
import Panel from './Panel.jsx'

const STATUS_STYLES = {
  completed: 'bg-success/10 text-success ring-success/25',
  in_progress: 'bg-accent/15 text-primary ring-accent/40',
}

const STATUS_LABELS = {
  completed: 'Completed',
  in_progress: 'In progress',
}

const COLUMNS = ['Activity Name', 'Category', 'Duration', 'Score', 'Date', 'Status']

export default function RecentActivitiesCard({ activities }) {
  if (!activities.length) {
    return (
      <Panel>
        <h2 className="text-base font-semibold text-primary">Recent Activities</h2>
        <p className="mt-3 text-sm text-primary/60">
          Nothing here yet. Your scored interview sessions will be listed as you complete them.
        </p>
      </Panel>
    )
  }

  return (
    <Panel>
      <h2 className="text-base font-semibold text-primary">Recent Activities</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b border-primary/10 pb-3 text-xs font-medium text-primary/50"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="border-b border-primary/5 transition-colors last:border-0 hover:bg-surface/60"
              >
                <td className="py-4 pr-4 text-sm font-medium text-primary">{activity.name}</td>
                <td className="py-4 pr-4 text-sm text-primary/60">{activity.category}</td>
                <td className="py-4 pr-4 text-sm text-primary/60">{activity.duration}</td>
                <td className="py-4 pr-4 text-sm">
                  {activity.score === null ? (
                    <span className="text-primary/40">N/A</span>
                  ) : (
                    <span className="font-semibold text-success">
                      {activity.score.toFixed(1)}/{SCORE_MAX}
                    </span>
                  )}
                </td>
                <td className="py-4 pr-4 text-sm text-primary/60">{activity.date}</td>
                <td className="py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
                      STATUS_STYLES[activity.status]
                    }`}
                  >
                    {STATUS_LABELS[activity.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
