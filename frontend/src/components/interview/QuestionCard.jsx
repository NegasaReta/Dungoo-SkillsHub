import Card from '../common/Card.jsx'

export default function QuestionCard({ index, total, question }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">
        Question {index + 1} of {total}
      </p>
      <p className="mt-2 text-lg">{question?.text}</p>
    </Card>
  )
}
