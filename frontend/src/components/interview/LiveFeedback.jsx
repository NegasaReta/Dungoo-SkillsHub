import Card from '../common/Card.jsx'

export default function LiveFeedback({ feedback }) {
  if (!feedback) return null

  return (
    <Card>
      <h2 className="font-medium text-primary">Feedback</h2>
      <p className="mt-2 text-sm text-primary/70">{feedback.summary}</p>
    </Card>
  )
}
