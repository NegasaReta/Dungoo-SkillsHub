import Card from '../common/Card.jsx'

export default function QuestionCard({ index, total, question }) {
  return (
    <Card>
      <p className="text-sm text-primary/60">
        Question {index + 1} of {total}
      </p>
      <p className="mt-2 text-lg text-primary">{question?.text}</p>
    </Card>
  )
}
